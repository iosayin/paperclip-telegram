import assert from "node:assert/strict";
import test from "node:test";
import { STRINGS, strings } from "../src/i18n.mjs";

const zh = strings("zh");

test("zh provides every English key with the same value type", () => {
  assert.notStrictEqual(zh, STRINGS.en);
  assert.strictEqual(zh, STRINGS.zh);
  assert.deepEqual(Object.keys(zh).sort(), Object.keys(STRINGS.en).sort());
  for (const key of Object.keys(STRINGS.en)) {
    assert.equal(typeof zh[key], typeof STRINGS.en[key], key);
    if (typeof zh[key] === "string") assert.ok(zh[key].length > 0, key);
  }
});

test("Chinese help preserves commands and uses the approval action label", () => {
  for (const command of ["/status", "/backlog", "/help"]) {
    assert.ok(zh.help.includes(command), command);
  }
  assert.ok(zh.help.includes("Paperclip"));
  assert.ok(zh.help.includes(zh.approve));
  assert.ok(zh.help.includes("3"));
  assert.ok(zh.notAllowed(-1001234567890).includes("TELEGRAM_CHAT_ID=-1001234567890"));
});

test("approval actions are distinct from completed outcomes", () => {
  assert.equal(zh.approve, "批准");
  assert.equal(zh.approved, "已批准");
  assert.equal(zh.resultApproved, "✅ 已批准");
  assert.equal(zh.reject, "拒绝");
  assert.equal(zh.rejected, "已拒绝");
  assert.equal(zh.resultRejected, "❌ 已拒绝");
  assert.match(zh.rejectReason, /^已.*拒绝/);
});

test("count messages handle zero, one and multiple items", () => {
  for (const n of [0, 1, 3]) {
    assert.ok(zh.formIntro(n).includes(`${n} 个问题`));
    assert.ok(zh.formIntro(n).includes("全部回答后"));
    assert.ok(zh.formIntro(n).includes("Paperclip"));
    assert.ok(zh.running(n).includes(`：${n}`));
    assert.ok(zh.pendingNow(n).includes(`：${n}`));
    assert.equal(zh.pendingNow(n).includes("见下方"), n > 0);
    assert.equal(zh.pendingNow(n).includes("暂无待处理卡片"), n === 0);
    assert.ok(zh.backlogNote(n).includes(`：${n}`));
    assert.equal(zh.backlogNote(n).includes("/backlog"), n > 0);
    assert.ok(zh.backlogMore(n).includes(`${n} 张卡片`));
    assert.ok(zh.backlogMore(n).includes("/backlog"));
  }
});

test("dynamic strings preserve special characters and optional details", () => {
  const company = '研发 <A&B> "公司"';
  const ident = "项目-1<&>";
  const agent = "智能体 '小王' & <bot>";
  const code = "ERR<&>_42";
  const label = '选项 <A&B> "保留"';
  const title = "任务 <完成> & 验证";
  assert.ok(zh.notAllowed(ident).includes(`TELEGRAM_CHAT_ID=${ident}`));
  assert.ok(zh.selected(label).includes(label));
  assert.ok(zh.issueDone(ident, title).includes(ident));
  assert.ok(zh.issueDone(ident, title).includes(title));
  for (const optionalIdent of [ident, "", null, undefined]) {
    for (const optionalAgent of [agent, "", null, undefined]) {
      const output = zh.runFailed(company, optionalIdent, optionalAgent, code);
      assert.ok(output.includes(company));
      assert.ok(output.includes(code));
      if (optionalIdent) assert.ok(output.includes(optionalIdent));
      if (optionalAgent) assert.ok(output.includes(optionalAgent));
      assert.ok(!output.includes("undefined"));
      assert.ok(!output.includes("null"));
      assert.ok(!output.includes("()"));
      assert.ok(!output.includes("（）"));
    }
  }
});

test("existing locales and unknown-language English fallback are preserved", () => {
  assert.strictEqual(strings("en"), STRINGS.en);
  assert.strictEqual(strings("tr"), STRINGS.tr);
  for (const lang of ["unknown", "", "zh-CN", "zh-TW", null, undefined]) {
    assert.strictEqual(strings(lang), STRINGS.en);
  }
});
