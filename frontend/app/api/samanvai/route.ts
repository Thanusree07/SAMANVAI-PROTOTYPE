import { NextRequest, NextResponse } from "next/server";
import { answerMessage, createApplication, summarizeStatus } from "@/lib/samanvai/engine";
import { getKnowledgeItem, knowledgeBase } from "@/lib/samanvai/knowledge";
import { readDb, writeDb } from "@/lib/samanvai/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await readDb();
  return NextResponse.json({
    user: db.users[0],
    preferences: db.preferences["citizen-001"],
    knowledgeBase,
    applications: db.applications,
    documents: db.applications.flatMap((app) => app.documents.map((doc) => ({ ...doc, referenceId: app.referenceId, itemName: app.itemName }))),
    notifications: db.notifications,
    history: db.history,
    profileFacts: db.profileFacts,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const db = await readDb();
  const language = body.language === "te" || body.language === "hi" ? body.language : "en";

  if (body.type === "preference") {
    db.preferences["citizen-001"] = { ...db.preferences["citizen-001"], samanvaiLanguage: language, consent: true };
    await writeDb(db);
    return NextResponse.json({ ok: true, preferences: db.preferences["citizen-001"] });
  }

  if (body.type === "apply") {
    const item = getKnowledgeItem(body.itemId);
    if (!item) return NextResponse.json({ error: "Knowledge item not found" }, { status: 404 });
    const app = createApplication(item, { ...db.profileFacts, ...(body.facts || {}) });
    db.applications.unshift(app);
    db.notifications.unshift({
      id: crypto.randomUUID(),
      title: "Reference ID generated",
      body: `${app.referenceId} created for ${app.itemName}.`,
      at: new Date().toISOString(),
      read: false,
    });
    db.auditLogs.unshift({ id: crypto.randomUUID(), action: "application_submitted", at: new Date().toISOString(), metadata: { referenceId: app.referenceId } });
    await writeDb(db);
    return NextResponse.json({ application: app, response: `Your SAMANVAI Reference ID is ${app.referenceId}.\n\n${summarizeStatus(app, language)}` });
  }

  if (body.type === "status") {
    const referenceId = String(body.referenceId || body.message || "").match(/SMV-[A-Z0-9]+-\d{8}-[A-Z0-9]+/i)?.[0]?.toUpperCase();
    const app = db.applications.find((record) => record.referenceId === referenceId);
    return NextResponse.json({ response: summarizeStatus(app, language), application: app });
  }

  const result = answerMessage(String(body.message || ""), language, { ...db.profileFacts, ...(body.facts || {}) }, body.itemId, body.lastQuestionKey);
  db.profileFacts = { ...db.profileFacts, ...result.facts };
  db.history.unshift({ id: crypto.randomUUID(), input: String(body.message || ""), response: result.response, at: new Date().toISOString() });
  db.auditLogs.unshift({ id: crypto.randomUUID(), action: "assistant_message", at: new Date().toISOString(), metadata: { intent: result.intent, itemId: result.item?.id || "unknown" } });
  await writeDb(db);
  return NextResponse.json(result);
}

