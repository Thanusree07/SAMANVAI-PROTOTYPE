import { NextRequest, NextResponse } from "next/server";
import { answerMessage, createApplication, summarizeStatus, classifyIntent, mergeAnswerWithQuestion, findKnowledgeItem } from "@/lib/samanvai/engine";
import { getKnowledgeItem, knowledgeBase } from "@/lib/samanvai/knowledge";
import { readDb, writeDb } from "@/lib/samanvai/store";
import { getSamanvaiResponse } from "@/lib/samanvai/llm";

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
  const language = body.language === "te" || body.language === "hi" || body.language === "kn" ? body.language : "en";

  if (body.type === "reset") {
    db.profileFacts = {};
    db.history = [];
    await writeDb(db);
    return NextResponse.json({ ok: true });
  }

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

  if (body.type === "upload") {
    const referenceId = body.referenceId;
    const documentName = body.documentName;
    const app = db.applications.find((record) => record.referenceId === referenceId);
    if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    const doc = app.documents.find((d) => d.name === documentName);
    if (doc) {
      doc.status = "Uploaded & Verified";
      app.updatedAt = new Date().toISOString();
      app.statusHistory.push({
        status: app.status,
        at: new Date().toISOString(),
        note: `Document '${documentName}' uploaded manually and verified successfully.`
      });
      await writeDb(db);
      return NextResponse.json({ ok: true, application: app });
    }
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Merge database facts with incoming client facts
  let activeFacts = { ...db.profileFacts, ...(body.facts || {}) };
  let activeItemId = body.itemId || activeFacts.active_scheme_id;

  // 1. Detect user intent
  const intent = classifyIntent(String(body.message || ""), activeItemId, body.lastQuestionKey);

  // 2. Workflow selection & Form Mapping (ONLY for application_workflow)
  if (intent === "application_workflow" || activeItemId) {
    // If starting a new scheme workflow (e.g. "I want to apply for Aarogyasri")
    const explicitItem = findKnowledgeItem(String(body.message || ""));
    const isNewWorkflowStart = explicitItem && (!activeItemId || explicitItem.id !== activeItemId);
    if (isNewWorkflowStart) {
      activeItemId = explicitItem.id;
    }

    // If answering a question, validate and map it to the active facts
    if (body.lastQuestionKey) {
      activeFacts = mergeAnswerWithQuestion(activeFacts, body.lastQuestionKey, String(body.message || ""));
    }
  }

  // 3. Evaluate rule engine state based on clean pipeline inputs
  const ruleResult = answerMessage(
    String(body.message || ""),
    language,
    activeFacts,
    activeItemId,
    body.lastQuestionKey
  );

  // Format chat history
  const formattedHistory: Array<{ role: "citizen" | "assistant"; text: string }> = [];
  for (const h of db.history.slice(0, 10).reverse()) {
    formattedHistory.push({ role: "citizen", text: h.input });
    formattedHistory.push({ role: "assistant", text: h.response });
  }

  // Get natural response (integrates LLM & local fallback)
  const naturalResponse = await getSamanvaiResponse(
    String(body.message || ""),
    formattedHistory,
    ruleResult.facts,
    {
      item: ruleResult.item,
      eligible: ruleResult.eligible,
      nextQuestion: ruleResult.nextQuestion,
      canApply: ruleResult.canApply,
    },
    language
  );

  // Merge facts and re-evaluate rules to synchronize
  let finalFacts = { ...ruleResult.facts };
  if (intent === "application_workflow" || activeItemId) {
    finalFacts = { ...finalFacts, ...naturalResponse.extractedFacts };
  }
  
  const matchedId = naturalResponse.itemId || ruleResult.item?.id || activeItemId;
  if (matchedId) {
    finalFacts.active_scheme_id = matchedId;
  }

  const finalRuleResult = answerMessage(
    String(body.message || ""),
    language,
    finalFacts,
    matchedId,
    body.lastQuestionKey
  );

  // Form is created ONLY after user chooses a scheme and confirms they want to apply
  const hasStartedWorkflow = Boolean(
    matchedId &&
    (finalRuleResult.facts.agreed_to_apply === true || String(finalRuleResult.facts.agreed_to_apply) === "true")
  );

  // Save updated facts and history
  db.profileFacts = { ...db.profileFacts, ...finalRuleResult.facts };
  db.history.unshift({ id: crypto.randomUUID(), input: String(body.message || ""), response: naturalResponse.response, at: new Date().toISOString() });
  db.auditLogs.unshift({ id: crypto.randomUUID(), action: "assistant_message", at: new Date().toISOString(), metadata: { intent: finalRuleResult.intent, itemId: matchedId || "unknown" } });
  await writeDb(db);

  const returnItem = hasStartedWorkflow ? finalRuleResult.item : undefined;
  const returnFacts = finalRuleResult.facts;
  const returnEligible = hasStartedWorkflow ? finalRuleResult.eligible : undefined;
  const returnNextQ = naturalResponse.nextQuestion || finalRuleResult.nextQuestion;
  const returnCanApply = hasStartedWorkflow ? (naturalResponse.canApply || finalRuleResult.canApply) : false;

  return NextResponse.json({
    intent: intent,
    detectedLanguage: naturalResponse.detectedLanguage,
    item: returnItem,
    facts: returnFacts,
    eligible: returnEligible,
    nextQuestion: returnNextQ,
    response: naturalResponse.response,
    recommendations: finalRuleResult.recommendations,
    canApply: returnCanApply,
    suggestions: naturalResponse.suggestions || [],
  });
}
