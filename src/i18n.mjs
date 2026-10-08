// User-facing strings. Add a language by copying the `en` block.
export const STRINGS = {
  en: {
    help:
      "Paperclip bot is ready.\n" +
      "/status — running agents + pending approvals/questions (with buttons)\n" +
      "/backlog — pending cards opened before the bot started, 3 at a time\n" +
      "/help — this message",
    notAllowed: (id) =>
      `This chat is not allowed. To use this bot, set TELEGRAM_CHAT_ID=${id} on the server and restart it.`,
    approve: "Approve",
    reject: "Reject",
    questions: "Questions",
    formIntro: (n) => `${n} question(s). Answers are sent to Paperclip once all are answered.`,
    cardGone: "This card is no longer valid.",
    approved: "Approved",
    rejected: "Rejected",
    failed: "Failed — check the Paperclip board",
    resultApproved: "✅ approved",
    resultRejected: "❌ rejected",
    resultFailed: "⚠️ could not be processed (the card may be closed)",
    selected: (l) => `Selected: ${l}`,
    formSent: "📨 answers sent to Paperclip",
    formFailed: "⚠️ answers could not be sent — check the Paperclip board",
    rejectReason: "Rejected from Telegram.",
    otherText: "Answered from Telegram.",
    running: (n) => `🟢 Running agents: ${n}`,
    pendingNow: (n) => `❓ Pending cards: ${n}${n ? " — below" : " (nothing waiting for you)"}`,
    backlogNote: (n) => `🗂 Older pending cards: ${n}${n ? " (use /backlog)" : ""}`,
    backlogEmpty: "No older pending cards.",
    backlogMore: (n) => `${n} more — send /backlog again`,
    runFailed: (company, ident, agent, code) => `⚠️ ${company}: agent run failed${ident ? ` on ${ident}` : ""}${agent ? ` (${agent})` : ""}: ${code}`,
    issueDone: (ident, title) => `✅ ${ident} done: ${title}`,
  },
  tr: {
    help:
      "Paperclip botu hazır.\n" +
      "/status — çalışan ajanlar + bekleyen onay/sorular (düğmeli)\n" +
      "/backlog — bot başlamadan önce açılmış bekleyen kartlar, 3'er 3'er\n" +
      "/help — bu mesaj",
    notAllowed: (id) =>
      `Bu sohbet izinli değil. Botu kullanmak için sunucuda TELEGRAM_CHAT_ID=${id} ayarlayıp yeniden başlatın.`,
    approve: "Onayla",
    reject: "Reddet",
    questions: "Sorular",
    formIntro: (n) => `${n} soru. Hepsi cevaplanınca Paperclip'e gönderilir.`,
    cardGone: "Bu kart artık geçerli değil.",
    approved: "Onaylandı",
    rejected: "Reddedildi",
    failed: "Hata — Paperclip panelinden bakın",
    resultApproved: "✅ onaylandı",
    resultRejected: "❌ reddedildi",
    resultFailed: "⚠️ işlenemedi (kart kapanmış olabilir)",
    selected: (l) => `Seçildi: ${l}`,
    formSent: "📨 cevaplar Paperclip'e gönderildi",
    formFailed: "⚠️ cevaplar gönderilemedi — Paperclip panelinden bakın",
    rejectReason: "Telegram'dan reddedildi.",
    otherText: "Telegram'dan cevaplandı.",
    running: (n) => `🟢 Çalışan ajan: ${n}`,
    pendingNow: (n) => `❓ Bekleyen kart: ${n}${n ? " — aşağıda" : " (sizi bekleyen yok)"}`,
    backlogNote: (n) => `🗂 Eski bekleyen kart: ${n}${n ? " (/backlog)" : ""}`,
    backlogEmpty: "Eski bekleyen kart yok.",
    backlogMore: (n) => `${n} kart daha var — yine /backlog`,
    runFailed: (company, ident, agent, code) => `⚠️ ${company}: ajan çalışması başarısız${ident ? ` (${ident})` : ""}${agent ? ` · ${agent}` : ""}: ${code}`,
    issueDone: (ident, title) => `✅ ${ident} bitti: ${title}`,
  },
  de: {
    help:
      "Paperclip Bot ist bereit.\n" +
      "/status — laufende Agenten + offene Genehmigungen/Fragen (mit Buttons)\n" +
      "/backlog — offene Karten von vor dem Bot-Start, 3 auf einmal\n" +
      "/help — diese Nachricht",
    notAllowed: (id) =>
      `Dieser Chat ist nicht erlaubt. Um den Bot zu nutzen, setze TELEGRAM_CHAT_ID=${id} auf dem Server und starte ihn neu.`,
    approve: "Genehmigen",
    reject: "Ablehnen",
    questions: "Fragen",
    formIntro: (n) => `${n} Frage(n). Antworten gehen an Paperclip, sobald alle beantwortet sind.`,
    cardGone: "Diese Karte ist nicht mehr gültig.",
    approved: "Genehmigt",
    rejected: "Abgelehnt",
    failed: "Fehlgeschlagen — schau aufs Paperclip Board",
    resultApproved: "✅ genehmigt",
    resultRejected: "❌ abgelehnt",
    resultFailed: "⚠️ konnte nicht verarbeitet werden (die Karte ist vielleicht geschlossen)",
    selected: (l) => `Ausgewählt: ${l}`,
    formSent: "📨 Antworten an Paperclip gesendet",
    formFailed: "⚠️ Antworten konnten nicht gesendet werden — schau aufs Paperclip Board",
    rejectReason: "Von Telegram abgelehnt.",
    otherText: "Von Telegram beantwortet.",
    running: (n) => `🟢 Laufende Agenten: ${n}`,
    pendingNow: (n) => `❓ Offene Karten: ${n}${n ? " — unten" : " (nichts wartet auf dich)"}`,
    backlogNote: (n) => `🗂 Ältere offene Karten: ${n}${n ? " (/backlog nutzen)" : ""}`,
    backlogEmpty: "Keine älteren offenen Karten.",
    backlogMore: (n) => `${n} weitere — schick /backlog nochmal`,
    runFailed: (company, ident, agent, code) => `⚠️ ${company}: Agent-Lauf fehlgeschlagen${ident ? ` auf ${ident}` : ""}${agent ? ` (${agent})` : ""}: ${code}`,
    issueDone: (ident, title) => `✅ ${ident} fertig: ${title}`,
  },
};

export function strings(lang) {
  return STRINGS[lang] ?? STRINGS.en;
}
