"""Backend API tests for SAMANVAI Next.js /api/samanvai route."""
import os
import re
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:3000").rstrip("/")
API = f"{BASE_URL}/api/samanvai"


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _switch_profile(client, profile):
    r = client.post(API, json={"type": "profile", "profile": profile})
    assert r.status_code == 200, r.text
    return r.json()


# --- Basic connectivity ---
class TestHealth:
    def test_get_state(self, client):
        r = client.get(API)
        assert r.status_code == 200
        data = r.json()
        assert "knowledgeBase" in data
        assert "profileFacts" in data
        assert isinstance(data.get("applications"), list)
        # 20 supported schemes
        assert len(data["knowledgeBase"]) >= 15  # sanity


# --- Profile switching / persona seeds ---
class TestProfiles:
    @pytest.mark.parametrize("profile,persona_name", [
        ("lakshmi", "Lakshmi"),
        ("suresh", "Suresh"),
        ("ramana", "Ramana"),
    ])
    def test_switch_profile_seeds(self, client, profile, persona_name):
        data = _switch_profile(client, profile)
        assert data.get("ok") is True
        assert data.get("profile") == profile
        assert data["facts"].get("__persona") == persona_name

    def test_suresh_has_farmer_facts(self, client):
        data = _switch_profile(client, "suresh")
        f = data["facts"]
        assert f.get("is_farmer") is True
        assert f.get("state") == "Andhra Pradesh"

    def test_live_profile_switch_ok(self, client):
        # Live persona is minor - may or may not have __persona seed depending on migration.
        # Key requirement: switch to live succeeds and currentProfile updates.
        data = _switch_profile(client, "live")
        assert data.get("profile") == "live"


# --- Phase 1: intent recognition (life situations) ---
class TestSituationDetection:
    @pytest.mark.parametrize("message,expected_keyword", [
        ("I am a farmer", "PM-KISAN"),
        ("my crops failed", "KISAN"),
        ("I need a house", "hous"),
        ("I need treatment", "health"),
        ("I need a scholarship", "cholar"),
    ])
    def test_life_situation_maps_to_schemes(self, client, message, expected_keyword):
        _switch_profile(client, "live")
        r = client.post(API, json={"type": "message", "message": message})
        assert r.status_code == 200
        text = (r.json().get("response") or "") + " " + " ".join(r.json().get("suggestions") or [])
        assert expected_keyword.lower() in text.lower(), f"Response missing '{expected_keyword}': {text[:400]}"

    def test_unsupported_request_no_hallucination(self, client):
        _switch_profile(client, "live")
        r = client.post(API, json={"type": "message", "message": "I need passport help"})
        assert r.status_code == 200
        body = r.json()
        text = (body.get("response") or "").lower()
        # Should say not supported OR fall back to category chips, not hallucinate a passport scheme
        assert "passport" not in text or "not" in text or "only" in text or "support" in text


# --- Suresh full journey PM-KISAN ---
class TestSureshPMKISANJourney:
    def test_full_journey_generates_reference_id(self, client):
        _switch_profile(client, "suresh")
        # Phase 1: farmer situation
        r = client.post(API, json={"type": "message", "message": "I am a farmer"})
        assert r.status_code == 200
        assert "PM-KISAN" in (r.json().get("response") or "") + " " + " ".join(r.json().get("suggestions") or [])

        # Select PM-KISAN
        r = client.post(API, json={"type": "message", "message": "PM-KISAN"})
        assert r.status_code == 200

        # Check Eligibility
        r = client.post(API, json={"type": "message", "message": "Check Eligibility"})
        assert r.status_code == 200

        # Answer 'Andhra Pradesh' once; Suresh persona pre-seeds farmer facts so eligibility should pass
        r = client.post(API, json={"type": "message", "message": "Andhra Pradesh"})
        assert r.status_code == 200
        j = r.json()
        assert "Eligible" in (j.get("response") or "") or "Prerequisites" in (j.get("response") or ""), j.get("response")
        assert "Apply Now" in (j.get("suggestions") or [])

        # Apply Now
        r = client.post(API, json={"type": "message", "message": "Apply Now"})
        assert r.status_code == 200
        j = r.json()
        assert "fetch" in (j.get("response") or "").lower()

        # Fetch Automatically
        r = client.post(API, json={"type": "message", "message": "Fetch Automatically"})
        assert r.status_code == 200
        j = r.json()
        assert j.get("intent") == "application_ready"
        assert "✔" in (j.get("response") or "") or "Fetched" in (j.get("response") or "")

        # Confirm & Submit
        r = client.post(API, json={"type": "message", "message": "Confirm & Submit"})
        assert r.status_code == 200
        j = r.json()
        assert j.get("intent") == "application_submitted"
        ref = (j.get("application") or {}).get("referenceId", "")
        assert re.match(r"^SMV-PMKISAN-\d{8}-[A-Z0-9]+$", ref), f"Bad reference id: {ref}"


# --- Per-profile data isolation ---
class TestProfileIsolation:
    def test_suresh_app_isolated_from_lakshmi(self, client):
        # Ensure suresh has at least one application (from previous test if run in order or create fresh)
        _switch_profile(client, "suresh")
        suresh = client.post(API, json={"type": "profile", "profile": "suresh"}).json()
        suresh_apps_before = len(suresh.get("applications", []))

        # Switch to Lakshmi
        lakshmi = _switch_profile(client, "lakshmi")
        # Lakshmi should have her own bucket
        lakshmi_apps = lakshmi.get("applications", [])
        # Applications submitted as Suresh must NOT appear as Lakshmi
        for a in lakshmi_apps:
            assert a.get("itemName") != "PM-KISAN" or not a.get("referenceId", "").startswith("SMV-PMKISAN")

        # Switch back to Suresh; his apps preserved
        suresh2 = _switch_profile(client, "suresh")
        assert len(suresh2.get("applications", [])) == suresh_apps_before


# --- Status tracking ---
class TestStatusTracking:
    def test_track_application_ref(self, client):
        _switch_profile(client, "suresh")
        # get list
        state = client.get(API).json()
        apps = state.get("applications", [])
        if not apps:
            pytest.skip("No applications to track")
        ref = apps[0]["referenceId"]
        r = client.post(API, json={"type": "status", "referenceId": ref})
        assert r.status_code == 200
        assert r.json().get("application", {}).get("referenceId") == ref
