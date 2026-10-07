#!/usr/bin/env node
// paperclip-telegram — answer Paperclip approvals and questions from Telegram with inline buttons.
// No inbound port (Telegram long polling), no model tokens (only the Paperclip REST API and the Telegram Bot API).
import fs from "node:fs";
import path from "node:path";
import { loadConfig } from "./config.mjs";
import { strings } from "./i18n.mjs";

const cfg = loadConfig();
const T = strings(cfg.lang);
const log = (msg) => console.log(`${new Date().toISOString()} ${msg}`);

// ── State (offset, sent cards, open button keys). Written with 0600: it holds chat ids and card references.
function loadState() {
  try { return JSON.parse(fs.readFileSync(cfg.stateFile, "utf8")); } catch { return {}; }
}
const S = Object.assign({ startedAt: new Date().toISOString(), offset: 0, counter: 0, sent: {}, open: {}, runs: {}, done: {} }, loadState());
function saveState() {
  fs.mkdirSync(path.dirname(cfg.stateFile), { recursive: true, mode: 0o700 });
  fs.writeFileSync(cfg.stateFile, JSON.stringify(S), { mode: 0o600 });
}
saveState();

// ── APIs
async function tg(method, body) {
  const res = await fetch(`https://api.telegram.org/bot${cfg.telegramToken}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
    // Without a timeout a dropped connection can stall the loop for minutes.
    signal: AbortSignal.timeout(method === "getUpdates" ? 45_000 : 20_000),
  });
  return res.json();
}
async function pc(route, options = {}) {
  const res = await fetch(`${cfg.paperclipUrl}/api${route}`, {
    signal: AbortSignal.timeout(30_000),
    ...options,
    headers: { Authorization: `Bearer ${cfg.paperclipToken}`, Origin: cfg.paperclipUrl, "Content-Type": "application/json" },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Paperclip ${res.status} ${route}: ${text.slice(0, 200)}`);
  try { return JSON.parse(text); } catch { return text; }
}
const list = (x) => (Array.isArray(x) ? x : x?.items ?? x?.data ?? []);
const clip = (s, n) => (s ?? "").toString().replace(/\s+/g, " ").trim().slice(0, n);
const esc = (s) => (s ?? "").toString().replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
const escAttr = (s) => esc(s).replace(/"/g, "&quot;");
// Deep link to the issue on the Paperclip board (issue #2): PAPERCLIP_URL plus
// the company prefix plus the issue identifier, e.g. http://localhost:3100/acme/ACME-123.
const boardUrl = (company, issue) => {
  const prefix = company.prefix ?? company.id;
  return `${cfg.paperclipUrl}/${encodeURIComponent(prefix)}/${encodeURIComponent(issue.identifier)}`;
}
const newKey = () => (++S.counter).toString(36);
const send = (text, extra = {}) => tg("sendMessage", { chat_id: cfg.chatId, text: text.slice(0, 4000), parse_mode: "HTML", disable_web_page_preview: true, ...extra });

// ── Pending cards = interactions with status "pending" on open issues
async function pendingCards() {
  const out = [];
  for (const company of list(await pc("/companies"))) {
    for (const issue of list(await pc(`/companies/${company.id}/issues?limit=500`))) {
      if (["done", "cancelled"].includes(issue.status)) continue;
      for (const card of list(await pc(`/issues/${issue.id}/interactions`))) {
        if (card.status === "pending") out.push({ company, issue, card });
      }
    }
  }
  return out;
}
const isBacklogIssue = (issue) => cfg.backlogTitlePrefixes.some((p) => (issue.title ?? "").startsWith(p));

async function sendCard({ company, issue, card }) {
  const p = card.payload ?? {};
  const head = `<b>${esc(company.name)} · ${esc(issue.identifier)}</b>\n${esc(clip(issue.title, 120))}`;
  if (card.kind === "request_confirmation") {
    const k = newKey();
    S.open[k] = { type: "confirm", issueId: issue.id, cardId: card.id, ident: issue.identifier };
    const body = clip(p.detailsMarkdown || p.prompt, 1500);
    const url = escAttr(boardUrl(company, issue));
    await send(`${head}\n\n✅ <b>${esc(clip(card.title || p.prompt, 300))}</b>${body ? `\n\n${esc(body)}` : ""}`, {
      reply_markup: { inline_keyboard: [[
        { text: clip(p.acceptLabel || T.approve, 40), callback_data: `a:${k}` },
        { text: clip(p.rejectLabel || T.reject, 40), callback_data: `r:${k}` },
      ], [
        { text: T.openBoard, url },
      ]] },
    });
  } else if (card.kind === "ask_user_questions") {
    const questions = p.questions ?? [];
    const k = newKey();
    S.open[k] = {
      type: "form", issueId: issue.id, cardId: card.id, ident: issue.identifier, answers: {},
      questions: questions.map((q) => ({ id: q.id, options: (q.options ?? []).map((o) => o.id), labels: (q.options ?? []).map((o) => o.label) })),
    };
    const url = escAttr(boardUrl(company, issue));
    await send(`${head}\n\n❓ <b>${esc(card.title || p.title || T.questions)}</b> — ${T.formIntro(questions.length)}\n🔗 <a href="${url}">${esc(T.openBoard)}</a>`);
    for (const [i, q] of questions.entries()) {
      const rows = (q.options ?? []).map((o, j) => [{ text: clip(o.label, 60), callback_data: `q:${k}:${i}:${j}` }]);
      const notes = (q.options ?? []).filter((o) => o.description).map((o) => `• <b>${esc(clip(o.label, 60))}</b>: ${esc(clip(o.description, 160))}`).join("\n");
      await send(`<b>${i + 1}/${questions.length}</b> ${esc(clip(q.prompt, 600))}${notes ? `\n\n${notes}` : ""}`, { reply_markup: { inline_keyboard: rows } });
    }
  } else {
    return; // other interaction kinds are left to the Paperclip board
  }
  S.sent[card.id] = new Date().toISOString();
  saveState();
  log(`sent ${issue.identifier} ${card.kind}`);
}

// ── Button presses
async function onButton(cb) {
  if (String(cb.message?.chat?.id) !== String(cfg.chatId)) return;
  const [kind, k, i, j] = String(cb.data ?? "").split(":");
  const o = S.open[k];
  if (!o) return tg("answerCallbackQuery", { callback_query_id: cb.id, text: T.cardGone });

  if (kind === "a" || kind === "r") {
    let ok = false;
    try {
      await pc(`/issues/${o.issueId}/interactions/${o.cardId}/${kind === "a" ? "accept" : "reject"}`, {
        method: "POST", body: JSON.stringify(kind === "a" ? {} : { reason: T.rejectReason }),
      });
      ok = true;
    } catch (e) { log(`confirm failed ${o.ident}: ${e.message}`); }
    await tg("answerCallbackQuery", { callback_query_id: cb.id, text: ok ? (kind === "a" ? T.approved : T.rejected) : T.failed });
    await tg("editMessageReplyMarkup", { chat_id: cfg.chatId, message_id: cb.message.message_id, reply_markup: { inline_keyboard: [] } });
    await send(`${esc(o.ident)}: ${ok ? (kind === "a" ? T.resultApproved : T.resultRejected) : T.resultFailed}`);
    delete S.open[k]; saveState();
    return;
  }

  if (kind === "q") {
    const q = o.questions[Number(i)];
    if (!q) return;
    o.answers[q.id] = q.options[Number(j)];
    await tg("answerCallbackQuery", { callback_query_id: cb.id, text: T.selected(clip(q.labels[Number(j)], 40)) });
    await tg("editMessageReplyMarkup", { chat_id: cfg.chatId, message_id: cb.message.message_id,
      reply_markup: { inline_keyboard: [[{ text: `✓ ${clip(q.labels[Number(j)], 50)}`, callback_data: "noop" }]] } });
    // Paperclip closes a form on the first response, so answers are sent once, together.
    if (Object.keys(o.answers).length >= o.questions.length) {
      const answers = Object.entries(o.answers).map(([questionId, opt]) => ({ questionId, optionIds: [opt], otherText: T.otherText }));
      let ok = false;
      try { await pc(`/issues/${o.issueId}/interactions/${o.cardId}/respond`, { method: "POST", body: JSON.stringify({ answers }) }); ok = true; }
      catch (e) { log(`respond failed ${o.ident}: ${e.message}`); }
      await send(`${esc(o.ident)}: ${ok ? T.formSent : T.formFailed}`);
      delete S.open[k];
    }
    saveState();
  }
}

// ── Commands
async function onMessage(m) {
  const chat = m.chat?.id;
  const text = (m.text ?? "").trim();
  if (!cfg.chatId) {
    // Not configured yet: tell the person their chat id so they can allow it. Nothing else is processed.
    if (text.startsWith("/start")) await tg("sendMessage", { chat_id: chat, text: T.notAllowed(chat) });
    return;
  }
  if (String(chat) !== String(cfg.chatId)) { log(`ignored message from a chat that is not allowed`); return; }

  const cmd = text.split(/[\s@]/)[0].toLowerCase();
  if (cmd === "/start" || cmd === "/help") return send(esc(T.help));

  if (cmd === "/status") {
    const cards = await pendingCards();
    const current = cards.filter((x) => !isBacklogIssue(x.issue));
    const older = cards.filter((x) => isBacklogIssue(x.issue) || (!S.sent[x.card.id] && x.card.createdAt < S.startedAt));
    const running = [];
    for (const company of list(await pc("/companies"))) {
      const byId = Object.fromEntries(list(await pc(`/companies/${company.id}/issues?limit=500`)).map((i) => [i.id, i]));
      for (const run of list(await pc(`/companies/${company.id}/heartbeat-runs?limit=50`)).filter((r) => r.status === "running")) {
        const issue = byId[run.contextSnapshot?.issueId];
        running.push(`• ${esc(issue?.identifier ?? "?")} ${esc(clip(issue?.title, 50))}`);
      }
    }
    const fresh = current.filter((x) => !older.includes(x));
    await send(`${T.running(running.length)}\n${running.join("\n")}\n\n${T.pendingNow(fresh.length)}\n${T.backlogNote(older.length)}`);
    for (const x of fresh) await sendCard(x); // re-sent with fresh buttons
    return;
  }

  if (cmd === "/backlog") {
    const cards = (await pendingCards()).filter((x) => !S.sent[x.card.id]);
    if (!cards.length) return send(esc(T.backlogEmpty));
    for (const x of cards.slice(0, 3)) await sendCard(x);
    if (cards.length > 3) await send(esc(T.backlogMore(cards.length - 3)));
  }
}

// ── Periodic scan: new cards, failed runs, finished issues
let lastScan = 0;
async function scan() {
  if (!cfg.chatId || Date.now() - lastScan < cfg.pollSeconds * 1000) return;
  lastScan = Date.now();

  for (const x of await pendingCards()) {
    if (S.sent[x.card.id] || isBacklogIssue(x.issue)) continue;
    if ((x.card.createdAt ?? "") < S.startedAt) continue; // older cards: /backlog
    await sendCard(x);
  }

  for (const company of list(await pc("/companies"))) {
    if (cfg.notifyFailedRuns) {
      const issues = Object.fromEntries(list(await pc(`/companies/${company.id}/issues?limit=500`)).map((i) => [i.id, i]));
      for (const run of list(await pc(`/companies/${company.id}/heartbeat-runs?limit=50`))) {
        if (run.status !== "failed" || S.runs[run.id] || (run.createdAt ?? "") < S.startedAt) continue;
        S.runs[run.id] = 1;
        if (cfg.ignoreRunErrors.includes(run.errorCode)) continue;
        const issue = issues[run.contextSnapshot?.issueId];
        await send(esc(T.runFailed(company.name, issue?.identifier, null, run.errorCode ?? "unknown")));
      }
    }
    if (cfg.notifyDone) {
      for (const issue of list(await pc(`/companies/${company.id}/issues?limit=500`))) {
        if (issue.status !== "done" || S.done[issue.id]) continue;
        S.done[issue.id] = 1;
        if ((issue.updatedAt ?? "") >= S.startedAt) await send(esc(T.issueDone(issue.identifier, clip(issue.title, 80))), { disable_notification: true });
      }
    }
  }
  saveState();
}

// ── `--check`: verify configuration and Paperclip access without touching Telegram, then exit.
if (process.argv.includes("--check")) {
  const companies = list(await pc("/companies"));
  const cards = await pendingCards();
  const me = await tg("getMe");
  console.log(`Paperclip OK: ${companies.length} compan${companies.length === 1 ? "y" : "ies"}, ${cards.length} pending card(s).`);
  console.log(me.ok ? `Telegram OK: @${me.result.username}` : `Telegram token rejected: ${me.description}`);
  console.log(cfg.chatId ? "TELEGRAM_CHAT_ID is set." : "TELEGRAM_CHAT_ID is not set yet: start the bot and send /start to it.");
  process.exit(me.ok ? 0 : 1);
}

// ── Main loop (long polling)
log(`started; Paperclip ${cfg.paperclipUrl}; ${cfg.chatId ? "chat configured" : "no TELEGRAM_CHAT_ID yet — send /start to the bot to get it"}`);
for (;;) {
  try {
    const r = await tg("getUpdates", { offset: S.offset, timeout: 30, allowed_updates: ["message", "callback_query"] });
    for (const u of r.result ?? []) {
      S.offset = u.update_id + 1;
      try {
        if (u.callback_query) await onButton(u.callback_query);
        else if (u.message) await onMessage(u.message);
      } catch (e) { log(`update error: ${e.message}`); }
    }
    saveState();
    await scan();
  } catch (e) {
    log(`loop error: ${e.message}`);
    await new Promise((res) => setTimeout(res, 5_000));
  }
}
