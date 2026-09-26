import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const modules = new Map();
// Compile only repository-owned TypeScript for focused regression checks.
function load(relative) {
  if (modules.has(relative)) return modules.get(relative);
  const exports = {};
  modules.set(relative, exports);
  const code = ts.transpileModule(fs.readFileSync(path.resolve(relative), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  runInNewContext(code, {
    exports, process, Buffer, URL,
    require: (id) => id.startsWith("@/lib/") ? load(`src/lib/${id.slice(6)}.ts`) : require(id),
  });
  return exports;
}

const { readJsonObject, RequestBodyError } = load("src/lib/request-json.ts");
for (const input of ["null", "[]", '"text"', "broken"]) {
  await assert.rejects(readJsonObject(new Request("http://localhost", { method: "POST", body: input }), 64), (e) => e instanceof RequestBodyError && e.status === 400);
}
assert.equal((await readJsonObject(new Request("http://localhost", { method: "POST", body: '{"ok":true}' }), 64)).ok, true);
await assert.rejects(readJsonObject(new Request("http://localhost", { method: "POST", body: "x".repeat(65) }), 64), (e) => e.status === 413);
await assert.rejects(readJsonObject(new Request("http://localhost", { method: "POST", body: "x".repeat(65), headers: { "Content-Length": "1" } }), 64), (e) => e.status === 413);

const { parseFrontmatter } = load("src/lib/parse-frontmatter.ts");
assert.equal(parseFrontmatter('---\ntitle: safe\n---\nBody').data.title, "safe");
assert.equal(parseFrontmatter('---json\n{"title":"safe"}\n---\nBody').data.title, "safe");
for (const language of ["javascript", "js", "Javascript", " javascript"]) {
  assert.throws(() => parseFrontmatter(`---${language}\n({title: process.env.ADMIN_SESSION_SECRET})\n---\nBody`));
}
for (const directory of ["content/blog", "content/finance"]) {
  for (const file of fs.readdirSync(directory).filter((name) => /\.mdx?$/.test(name))) parseFrontmatter(fs.readFileSync(path.join(directory, file), "utf8"));
}

// Use isolated fixtures; never read .env.local or contact GitHub.
const previousPassword = process.env.ADMIN_EDITOR_PASSWORD;
const previousSecret = process.env.ADMIN_SESSION_SECRET;
try {
  process.env.ADMIN_EDITOR_PASSWORD = "security-check-password";
  process.env.ADMIN_SESSION_SECRET = "s".repeat(48);
  const auth = load("src/lib/admin-auth.ts");
  assert.equal(auth.verifyAdminPassword("wrong"), false);
  const session = auth.createAdminSession();
  assert.equal(auth.verifyAdminSessionValue(session.value), true);
  assert.equal(auth.verifyAdminSessionValue(session.value + "x"), false);
  process.env.ADMIN_EDITOR_PASSWORD = "changed-password";
  assert.equal(auth.verifyAdminSessionValue(session.value), false);
  const { isSameOriginRequest } = load("src/lib/request-origin.ts");
  assert.equal(isSameOriginRequest(new Request("https://example.com/api", { headers: { origin: "https://attacker.com" } })), false);
  assert.equal(isSameOriginRequest(new Request("https://example.com/api")), false);
  assert.equal(isSameOriginRequest(new Request("https://example.com/api", { headers: { origin: "https://example.com" } })), true);
  const { consumeLoginAttempt } = load("src/lib/login-rate-limit.ts");
  const loginRequest = new Request("http://localhost/api/admin/session");
  for (let i = 0; i < 10; i++) assert.equal(consumeLoginAttempt(loginRequest).allowed, true);
  assert.equal(consumeLoginAttempt(loginRequest).allowed, false);
} finally {
  if (previousPassword === undefined) delete process.env.ADMIN_EDITOR_PASSWORD; else process.env.ADMIN_EDITOR_PASSWORD = previousPassword;
  if (previousSecret === undefined) delete process.env.ADMIN_SESSION_SECRET; else process.env.ADMIN_SESSION_SECRET = previousSecret;
}
console.log("Security regression checks passed; all article frontmatter parsed safely.");
