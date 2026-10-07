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
  zh: {
    help:
      "Paperclip 机器人已就绪。\n" +
      "/status — 正在运行的智能体及待批准的请求和待回答的问题（含按钮）\n" +
      "/backlog — 机器人启动前的待处理卡片，每次显示 3 张\n" +
      "/help — 显示此帮助",
    notAllowed: (id) =>
      `此聊天未获授权。要使用此机器人，请在服务器上设置 TELEGRAM_CHAT_ID=${id} 并重启机器人。`,
    approve: "批准",
    reject: "拒绝",
    questions: "问题",
    formIntro: (n) => `共 ${n} 个问题。全部回答后，答案将一并发送到 Paperclip。`,
    cardGone: "此卡片已失效。",
    approved: "已批准",
    rejected: "已拒绝",
    failed: "操作失败 — 请查看 Paperclip 看板",
    resultApproved: "✅ 已批准",
    resultRejected: "❌ 已拒绝",
    resultFailed: "⚠️ 无法处理（卡片可能已关闭）",
    selected: (l) => `已选择：${l}`,
    formSent: "📨 答案已发送到 Paperclip",
    formFailed: "⚠️ 无法发送答案 — 请查看 Paperclip 看板",
    rejectReason: "已通过 Telegram 拒绝。",
    otherText: "已通过 Telegram 回答。",
    running: (n) => `🟢 正在运行的智能体：${n}`,
    pendingNow: (n) => `❓ 待处理卡片：${n}${n ? " — 见下方" : "（暂无待处理卡片）"}`,
    backlogNote: (n) => `🗂 较早的待处理卡片：${n}${n ? "（使用 /backlog 查看）" : ""}`,
    backlogEmpty: "没有较早的待处理卡片。",
    backlogMore: (n) => `还有 ${n} 张卡片 — 请再次发送 /backlog`,
    runFailed: (company, ident, agent, code) => `⚠️ ${company}：智能体运行失败${ident ? `，任务：${ident}` : ""}${agent ? `（${agent}）` : ""}：${code}`,
    issueDone: (ident, title) => `✅ ${ident} 已完成：${title}`,
  },
};

export function strings(lang) {
  return STRINGS[lang] ?? STRINGS.en;
}
