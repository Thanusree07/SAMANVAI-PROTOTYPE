import { promises as fs } from "fs";
import path from "path";
import { ApplicationRecord, ProfileFacts } from "./engine";

export type ProfileBucket = {
  facts: ProfileFacts;
  applications: ApplicationRecord[];
  history: Array<{ id: string; input: string; response: string; at: string }>;
};

type Database = {
  users: Array<{ id: string; name: string; authenticated: boolean; portalLanguage: string }>;
  preferences: Record<string, { samanvaiLanguage: string; consent: boolean }>;
  applications: ApplicationRecord[];
  notifications: Array<{ id: string; title: string; body: string; at: string; read: boolean }>;
  history: Array<{ id: string; input: string; response: string; at: string }>;
  profileFacts: ProfileFacts;
  auditLogs: Array<{ id: string; action: string; at: string; metadata: Record<string, string> }>;
  currentProfile: string;
  profilesData: Record<string, ProfileBucket>;
};

const dbPath = path.join(process.cwd(), "data", "samanvai-db.json");

const defaultDb: Database = {
  users: [{ id: "citizen-001", name: "Verified Citizen", authenticated: true, portalLanguage: "en" }],
  preferences: { "citizen-001": { samanvaiLanguage: "en", consent: true } },
  applications: [],
  notifications: [
    {
      id: "notice-001",
      title: "Government Portal session verified",
      body: "PIN verification completed. SAMANVAI can now assist within this authenticated session.",
      at: new Date().toISOString(),
      read: false,
    },
  ],
  history: [],
  profileFacts: {},
  auditLogs: [],
  currentProfile: "live",
  profilesData: {},
};

async function ensureDb() {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  try {
    await fs.access(dbPath);
  } catch {
    await fs.writeFile(dbPath, JSON.stringify(defaultDb, null, 2), "utf8");
  }
}

export async function readDb(): Promise<Database> {
  await ensureDb();
  const raw = await fs.readFile(dbPath, "utf8");
  const parsed = JSON.parse(raw) as Database;
  // Migration: back-fill new fields on older DBs
  if (!parsed.currentProfile) parsed.currentProfile = "live";
  if (!parsed.profilesData) parsed.profilesData = {};
  return parsed;
}

export async function writeDb(db: Database) {
  await ensureDb();
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf8");
}

export async function appendAudit(action: string, metadata: Record<string, string> = {}) {
  const db = await readDb();
  db.auditLogs.unshift({ id: crypto.randomUUID(), action, at: new Date().toISOString(), metadata });
  await writeDb(db);
}

