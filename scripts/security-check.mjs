#!/usr/bin/env node
/*
 * サンフラワープロジェクト 自動セキュリティチェック
 *
 * 使い方:
 *   npm run test:security                    # 本番URLに対してテスト
 *   TEST_URL=http://localhost:3000 npm run test:security  # 別URL指定
 *
 * カバー範囲:
 *   - J. 情報漏洩（.env、JWT、機密ファイル、source map）
 *   - K. HTTPヘッダー（HTTPS強制、X-Frame-Options 等）
 *   - M. オープンリダイレクト（next= 悪用）
 *   - C. API認証（未認証拒否、入力検証）
 *   - O. 主要ページ疎通
 *
 * 対象外（ブラウザ・人手が必要）:
 *   - A. 認証フロー、B. 他人データ非表示、E. ファイルアップロード等
 */

import { execSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const BASE_URL = process.env.TEST_URL || "https://funahashi-sunflower-pj.vercel.app";

// ===== 色付きログ =====
const c = {
  reset: "\x1b[0m", bold: "\x1b[1m",
  green: "\x1b[32m", red: "\x1b[31m", yellow: "\x1b[33m",
  cyan: "\x1b[36m", gray: "\x1b[90m", blue: "\x1b[34m",
};
const PASS = `${c.green}✅ PASS${c.reset}`;
const FAIL = `${c.red}❌ FAIL${c.reset}`;
const SKIP = `${c.yellow}⏭️  SKIP${c.reset}`;

const results = [];

function logResult(id, name, status, message = "") {
  results.push({ id, name, status, message, timestamp: new Date().toISOString() });
  const icon = status === "pass" ? PASS : status === "fail" ? FAIL : SKIP;
  console.log(`  ${icon} ${c.bold}[${id}]${c.reset} ${name}`);
  if (message) console.log(`     ${c.gray}→ ${message}${c.reset}`);
}

async function runTest(id, name, fn) {
  try {
    const result = await fn();
    logResult(id, name, "pass", result?.message);
  } catch (e) {
    logResult(id, name, "fail", e.message);
  }
}

function section(title) {
  console.log(`\n${c.bold}${c.cyan}━━━ ${title} ━━━${c.reset}\n`);
}

// ===== ヘルパー =====
function grepInDir(dir, pattern, exts = /\.(ts|tsx|js|jsx)$/) {
  const matches = [];
  if (!existsSync(dir)) return matches;
  function walk(d) {
    for (const entry of readdirSync(d)) {
      if (entry === "node_modules" || entry === ".next" || entry === ".git") continue;
      const full = join(d, entry);
      try {
        const st = statSync(full);
        if (st.isDirectory()) walk(full);
        else if (exts.test(entry)) {
          const content = readFileSync(full, "utf8");
          if (pattern.test(content)) matches.push(full.replace(PROJECT_ROOT, "."));
        }
      } catch { /* ignore */ }
    }
  }
  walk(dir);
  return matches;
}

// ===========================================
// テスト開始
// ===========================================
console.log(`\n${c.bold}🌻 サンフラワープロジェクト セキュリティ自動テスト${c.reset}`);
console.log(`${c.gray}Target: ${BASE_URL}${c.reset}`);
console.log(`${c.gray}Date  : ${new Date().toLocaleString("ja-JP")}${c.reset}`);

// ===== J. 情報漏洩 =====
section("J. 情報漏洩（ローカルファイル）");

await runTest("J1", ".env系ファイルがgitに含まれない", async () => {
  let tracked = "";
  try {
    tracked = execSync("git ls-files", { cwd: PROJECT_ROOT, encoding: "utf8" });
  } catch {
    throw new Error("git ls-files 実行失敗（gitリポジトリでない可能性）");
  }
  const envFiles = tracked.split("\n").filter(f => /(^|\/)\.env(\.|$)/.test(f.trim()));
  if (envFiles.length > 0) {
    throw new Error(`git追跡されている: ${envFiles.join(", ")}`);
  }
});

await runTest("J2", "service_role キー(JWT)が src/ にハードコードされていない", async () => {
  // service_role JWT パターンを検出
  const found = grepInDir(
    join(PROJECT_ROOT, "src"),
    /eyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/
  );
  if (found.length > 0) {
    throw new Error(`JWT-likeトークン検出: ${found.join(", ")}`);
  }
});

await runTest("J2b", "process.env.SUPABASE_SERVICE_ROLE_KEY が client側に出ない", async () => {
  // "use client" がついているファイルで SUPABASE_SERVICE_ROLE_KEY を参照していないか
  const clientFiles = [];
  function walk(d) {
    if (!existsSync(d)) return;
    for (const entry of readdirSync(d)) {
      if (entry === "node_modules" || entry === ".next") continue;
      const full = join(d, entry);
      try {
        const st = statSync(full);
        if (st.isDirectory()) walk(full);
        else if (/\.(tsx?|jsx?)$/.test(entry)) {
          const content = readFileSync(full, "utf8");
          if (/^["']use client["']/m.test(content) &&
              /SUPABASE_SERVICE_ROLE_KEY/.test(content)) {
            clientFiles.push(full.replace(PROJECT_ROOT, "."));
          }
        }
      } catch { /* ignore */ }
    }
  }
  walk(join(PROJECT_ROOT, "src"));
  if (clientFiles.length > 0) {
    throw new Error(`client側で参照: ${clientFiles.join(", ")}`);
  }
});

await runTest("J3", "public/ に機密ファイルがない", async () => {
  const publicDir = join(PROJECT_ROOT, "public");
  if (!existsSync(publicDir)) return;
  const suspicious = readdirSync(publicDir, { recursive: true })
    .filter(f => typeof f === "string")
    .filter(f => /\.(env|key|pem|p12|pfx|secret)$/i.test(f) || /credentials|secret|private/i.test(f));
  if (suspicious.length > 0) {
    throw new Error(`疑わしいファイル: ${suspicious.join(", ")}`);
  }
});

await runTest("J6", "public/ に source map (.map) がない", async () => {
  const publicDir = join(PROJECT_ROOT, "public");
  if (!existsSync(publicDir)) return;
  const maps = readdirSync(publicDir, { recursive: true })
    .filter(f => typeof f === "string" && f.endsWith(".map"));
  if (maps.length > 0) {
    throw new Error(`source map検出: ${maps.join(", ")}`);
  }
});

await runTest("Build", "TypeScript 型チェックが通る", async () => {
  try {
    execSync("npx tsc --noEmit", { cwd: PROJECT_ROOT, stdio: "pipe" });
  } catch (e) {
    throw new Error("型エラーあり: " + (e.stdout?.toString().split("\n")[0] ?? ""));
  }
});

// ===== K. HTTPヘッダー（要デプロイ） =====
section("K. HTTPヘッダー（本番URL）");

let reachable = false;
await runTest("Network", "本番URL疎通", async () => {
  const res = await fetch(BASE_URL, { redirect: "manual" });
  if (res.status >= 500) throw new Error(`HTTP ${res.status}`);
  reachable = true;
});

if (reachable) {
  await runTest("K1", "HTTPからHTTPSへリダイレクト", async () => {
    const httpUrl = BASE_URL.replace(/^https:\/\//, "http://");
    const res = await fetch(httpUrl, { redirect: "manual" });
    if (res.status < 300 || res.status >= 400) {
      throw new Error(`リダイレクトなし HTTP ${res.status}`);
    }
    const loc = res.headers.get("location") ?? "";
    if (!loc.startsWith("https://")) {
      throw new Error(`HTTPSでないリダイレクト: ${loc}`);
    }
  });

  const headers = (await fetch(BASE_URL)).headers;

  await runTest("K5", "X-Frame-Options または CSP frame-ancestors", async () => {
    const xfo = headers.get("x-frame-options");
    const csp = headers.get("content-security-policy") ?? "";
    if (!xfo && !csp.includes("frame-ancestors")) {
      throw new Error("両方未設定");
    }
  });

  await runTest("K6", "X-Content-Type-Options: nosniff", async () => {
    const v = headers.get("x-content-type-options");
    if (v !== "nosniff") throw new Error(`値: ${v ?? "未設定"}`);
  });

  await runTest("K7", "Referrer-Policy あり", async () => {
    if (!headers.get("referrer-policy")) throw new Error("未設定");
  });

  await runTest("K8", "Permissions-Policy あり", async () => {
    if (!headers.get("permissions-policy")) throw new Error("未設定");
  });

  // ===== M. Open Redirect =====
  section("M. オープンリダイレクト");

  await runTest("M1", "next=外部URL を拒否", async () => {
    const url = `${BASE_URL}/api/auth/callback?next=https://evil.example.com`;
    const res = await fetch(url, { redirect: "manual" });
    const loc = res.headers.get("location") ?? "";
    if (loc.includes("evil.example.com")) {
      throw new Error(`外部にリダイレクト: ${loc}`);
    }
  });

  await runTest("M2", "next=javascript: スキームを拒否", async () => {
    const url = `${BASE_URL}/api/auth/callback?next=${encodeURIComponent("javascript:alert(1)")}`;
    const res = await fetch(url, { redirect: "manual" });
    const loc = res.headers.get("location") ?? "";
    if (loc.startsWith("javascript:")) {
      throw new Error(`javascriptスキーム: ${loc}`);
    }
  });

  await runTest("M3", "next=//evil.com（protocol-relative）を拒否", async () => {
    const url = `${BASE_URL}/api/auth/callback?next=${encodeURIComponent("//evil.example.com")}`;
    const res = await fetch(url, { redirect: "manual" });
    const loc = res.headers.get("location") ?? "";
    if (/^https?:\/\/evil\.example\.com/i.test(loc) || loc.startsWith("//evil")) {
      throw new Error(`プロトコル相対で外部誘導: ${loc}`);
    }
  });

  // ===== C. API認証 =====
  section("C. API認証・検証");

  await runTest("C1", "未認証で claim API → 401", async () => {
    const res = await fetch(`${BASE_URL}/api/stamps/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "seed" }),
    });
    if (res.status !== 401) {
      throw new Error(`期待401, 実際${res.status}`);
    }
  });

  await runTest("C-NoBody", "claim API にbodyなしPOST → 401 or 400", async () => {
    const res = await fetch(`${BASE_URL}/api/stamps/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (![400, 401].includes(res.status)) {
      throw new Error(`期待400/401, 実際${res.status}`);
    }
  });

  await runTest("C-GET", "claim API にGET → 405 or 404", async () => {
    const res = await fetch(`${BASE_URL}/api/stamps/claim`);
    if (![404, 405].includes(res.status)) {
      throw new Error(`期待404/405, 実際${res.status}`);
    }
  });

  // ===== O. ページ疎通 =====
  section("O. 主要ページ疎通");

  const pages = [
    ["/", "トップ"],
    ["/start", "スタート（デフォルト）"],
    ["/start?event=seed", "スタート（種まき）"],
    ["/start?event=water", "スタート（水やり）"],
    ["/login", "ログイン"],
    ["/stamp", "マイスタンプ"],
    ["/me", "診断"],
    ["/claim?event=seed", "クレイム"],
  ];
  for (const [path, label] of pages) {
    await runTest(`O-${path}`, `${label}: ${path}`, async () => {
      const res = await fetch(`${BASE_URL}${path}`, { redirect: "follow" });
      if (res.status < 200 || res.status >= 400) {
        throw new Error(`HTTP ${res.status}`);
      }
    });
  }

  await runTest("O-404", "存在しないURLは404", async () => {
    const res = await fetch(`${BASE_URL}/nonexistent-page-${Date.now()}`, { redirect: "manual" });
    if (res.status !== 404) {
      throw new Error(`期待404, 実際${res.status}`);
    }
  });
} else {
  console.log(`${c.yellow}⚠️  本番URLに疎通できないため、ネットワーク系テストはスキップします${c.reset}`);
}

// ===========================================
// サマリ
// ===========================================
console.log(`\n${c.bold}━━━ 結果 ━━━${c.reset}\n`);
const passed = results.filter(r => r.status === "pass").length;
const failed = results.filter(r => r.status === "fail").length;
const skipped = results.filter(r => r.status === "skip").length;

console.log(`  ${c.green}Pass${c.reset}    : ${passed}`);
console.log(`  ${c.red}Fail${c.reset}    : ${failed}`);
console.log(`  ${c.yellow}Skip${c.reset}    : ${skipped}`);
console.log(`  Total   : ${results.length}\n`);

if (failed > 0) {
  console.log(`${c.red}${c.bold}⚠️  ${failed}件の失敗があります。${c.reset}\n`);
  console.log("失敗したテスト:");
  results.filter(r => r.status === "fail").forEach(r => {
    console.log(`  ❌ [${r.id}] ${r.name}: ${r.message}`);
  });
  console.log();
} else {
  console.log(`${c.green}${c.bold}🎉 全テスト合格${c.reset}\n`);
}

// 結果をJSONで保存
const resultFile = join(PROJECT_ROOT, "test-results.json");
writeFileSync(resultFile, JSON.stringify({
  ranAt: new Date().toISOString(),
  target: BASE_URL,
  summary: { passed, failed, skipped, total: results.length },
  results,
}, null, 2));
console.log(`${c.gray}結果を ${resultFile} に保存しました${c.reset}\n`);

process.exit(failed > 0 ? 1 : 0);
