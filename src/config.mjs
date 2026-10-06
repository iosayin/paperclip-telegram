import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Minimal .env loader (no dependency). Real environment variables always win.
function loadEnvFile(file) {
  if (!file || !fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || line.trim().startsWith("#")) continue;
    const value = m[2].replace(/^(['"])(.*)\1$/, "$2");
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}

// A secret can be given directly (VAR) or as a file path (VAR_FILE), e.g. a Docker/systemd secret.
function secret(name) {
  const file = process.env[`${name}_FILE`];
  if (file) return fs.readFileSync(file, "utf8").trim();
  return (process.env[name] ?? "").trim();
}

export function loadConfig() {
  loadEnvFile(process.env.PT_ENV_FILE ?? path.resolve(process.cwd(), ".env"));

  const cfg = {
    telegramToken: secret("TELEGRAM_BOT_TOKEN"),
    chatId: (process.env.TELEGRAM_CHAT_ID ?? "").trim() || null,
    paperclipUrl: (process.env.PAPERCLIP_URL ?? "http://localhost:3100").replace(/\/+$/, ""),
    paperclipToken: secret("PAPERCLIP_TOKEN"),
    lang: (process.env.PT_LANG ?? "en").trim(),
    pollSeconds: Math.max(15, Number(process.env.PT_POLL_SECONDS ?? 60)),
    notifyFailedRuns: process.env.PT_NOTIFY_FAILED_RUNS !== "false",
    notifyDone: process.env.PT_NOTIFY_DONE === "true",
    // Run error codes that are routine/self-healing and not worth a notification.
    ignoreRunErrors: (process.env.PT_IGNORE_RUN_ERRORS ?? "process_lost,issue_reassigned,cancelled")
      .split(",").map((s) => s.trim()).filter(Boolean),
    // Issues whose title starts with one of these prefixes are treated as "backlog" (not pushed automatically).
    backlogTitlePrefixes: (process.env.PT_BACKLOG_TITLE_PREFIXES ?? "")
      .split(",").map((s) => s.trim()).filter(Boolean),
    stateFile: process.env.PT_STATE_FILE ?? path.join(os.homedir(), ".paperclip-telegram", "state.json"),
  };

  const missing = [];
  if (!cfg.telegramToken) missing.push("TELEGRAM_BOT_TOKEN");
  if (!cfg.paperclipToken) missing.push("PAPERCLIP_TOKEN");
  if (missing.length) {
    console.error(`Missing required setting(s): ${missing.join(", ")}. See .env.example.`);
    process.exit(2);
  }
  return cfg;
}
