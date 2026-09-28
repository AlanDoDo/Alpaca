import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import nextEnv from "@next/env";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
nextEnv.loadEnvConfig(process.cwd(), true);
const base = process.env.QA_BASE_URL || "http://localhost:3001";
const executablePath = process.env.QA_BROWSER_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({ headless: true, executablePath });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];
const consoleErrors = [];
const externalConsoleErrors = [];
const localHttpErrors = [];
let currentRoute = "";
const baseUrl = new URL(base);
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() !== "error") return;
  const entry = { route: currentRoute, message: message.text(), url: message.location().url };
  let isExternal = false;
  try { isExternal = Boolean(entry.url) && new URL(entry.url).host !== baseUrl.host; } catch {}
  (isExternal ? externalConsoleErrors : consoleErrors).push(entry);
});
page.on("response", (response) => {
  if (response.status() < 400) return;
  try {
    if (new URL(response.url()).host === baseUrl.host) localHttpErrors.push({ route: currentRoute, status: response.status(), url: response.url() });
  } catch {}
});
const output = ".next/qa";
fs.mkdirSync(output, { recursive: true });
const results = [];
async function open(route) {
  currentRoute = route;
  const response = await page.goto(base + route, { waitUntil: "domcontentloaded" });
  assert.equal(response.status(), 200, route);
  await page.waitForTimeout(550);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `Horizontal overflow: ${route}`);
  results.push(`Page ${route}: OK`);
}
try {
  await open("/");
  await page.locator(".floating-dock-trigger").hover();
  const musicCapsule = page.locator(".music-capsule");
  await musicCapsule.waitFor({ state: "visible" });
  await musicCapsule.hover();
  assert.equal(await musicCapsule.getAttribute("aria-expanded"), "true", "Hover should expand the music capsule");
  const musicPanel = page.locator("#music-player-panel");
  const iframeBox = await musicPanel.locator("iframe").boundingBox();
  assert(iframeBox, "NetEase player iframe should be mounted in the opened panel");
  currentRoute = "/ [music iframe hover]";
  await page.mouse.move(iframeBox.x + Math.min(70, iframeBox.width / 2), iframeBox.y + Math.min(55, iframeBox.height / 2));
  await page.waitForTimeout(600);
  assert.equal(await musicCapsule.getAttribute("aria-expanded"), "true", "Player must remain open while the pointer is inside its iframe");
  await page.mouse.move(420, 420);
  await page.waitForTimeout(600);
  assert.equal(await musicCapsule.getAttribute("aria-expanded"), "false", "Player should collapse after the pointer leaves the capsule and panel");
  results.push("Music capsule hover, iframe hover retention, and auto-collapse: OK");
  await musicCapsule.hover();
  await page.getByRole("button", { name: "收起播放器" }).click();
  assert.equal(await musicCapsule.getAttribute("aria-expanded"), "false", "Close button should collapse the player immediately");
  await musicCapsule.click();
  assert.equal(await musicCapsule.getAttribute("aria-expanded"), "true", "Click should open the player");
  await page.keyboard.press("Escape");
  assert.equal(await musicCapsule.getAttribute("aria-expanded"), "false", "Escape should close the player");
  results.push("Music capsule click, close button, and Escape: OK");
  for (const route of ["/", "/blog", "/forum", "/ai", "/finance", "/about"]) await open(route);
  await open("/blog");
  assert.equal(await page.locator(".journal-filters a").count(), 4);
  await page.waitForTimeout(1800);
  const regions = page.locator(".journal-scroll-region");
  let hoverIndex = -1;
  for (let index = 0; index < await regions.count(); index++) {
    if (await regions.nth(index).evaluate((element) => element.clientHeight >= 179 && element.scrollHeight > 200)) { hoverIndex = index; break; }
  }
  assert(hoverIndex >= 0, "No long Notes card for hover check");
  const region = regions.nth(hoverIndex);
  await region.scrollIntoViewIfNeeded();
  await page.mouse.move(1, 1);
  await page.waitForTimeout(500);
  const before = await region.evaluate((element) => element.clientHeight);
  await region.hover();
  await page.waitForTimeout(550);
  const expanded = await region.evaluate((element) => element.clientHeight);
  assert(expanded > before && expanded <= 321, "Hover expansion failed");
  await page.mouse.move(1, 1);
  await page.waitForTimeout(550);
  assert(await region.evaluate((element) => element.clientHeight) <= 181, "Hover collapse failed");
  results.push("Notes hover expansion/collapse: OK");
  await page.screenshot({ path: path.join(output, "notes-desktop.png"), fullPage: true });
  for (const topic of ["essays", "industry", "tools"]) await open(`/blog?topic=${topic}`);
  for (const topic of ["learning", "programming"]) await open(`/forum?topic=${topic}`);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ["/blog", "/forum", "/about", "/finance"]) await open(route);
  await open("/blog");
  assert.equal(await page.locator(".journal-column").count(), 1);
  await page.evaluate(() => { document.documentElement.dataset.theme = "dark"; });
  await page.screenshot({ path: path.join(output, "notes-mobile-dark.png"), fullPage: true });
  const articles = fs.readdirSync("content/blog").filter((file) => /\.mdx?$/.test(file));
  for (const file of articles) {
    const response = await context.request.get(`${base}/article/${file.replace(/\.mdx?$/, "")}`);
    assert.equal(response.status(), 200, `Article ${file}`);
  }
  results.push(`All ${articles.length} reading URLs: OK`);
  const collections = {};
  for (const [section, route, pages] of [["Notes", "/blog", 2], ["Research", "/forum", 14]]) {
    const slugs = new Set();
    for (let number = 1; number <= pages; number++) {
      const response = await context.request.get(`${base}${route}?page=${number}`);
      assert.equal(response.status(), 200);
      const html = await response.text();
      for (const match of html.matchAll(/href="\/article\/([a-z0-9-]+)"/g)) slugs.add(match[1]);
    }
    assert(slugs.size > 0, `${section} pagination should contain articles`);
    collections[section] = slugs;
  }
  assert([...collections.Notes].every((slug) => !collections.Research.has(slug)), "Research/Notes overlap");
  assert.equal(new Set([...collections.Notes, ...collections.Research]).size, articles.length, "Article omitted from lists");
  for (const slug of collections.Notes) {
    const response = await context.request.get(`${base}/api/journal/${slug}`);
    assert.equal(response.status(), 200, `Notes content API ${slug}`);
    assert.equal(typeof (await response.json()).content, "string");
  }
  for (const slug of ["trading-system", "asset-allocation", "company-research", "investment-framework"]) assert.equal((await context.request.get(`${base}/finance/${slug}`)).status(), 200);
  const search = await context.request.get(`${base}/api/search?q=STM32`);
  assert.equal(search.status(), 200);
  assert((await search.json()).some((article) => article.slug === "stm32"));
  results.push("Both collections cover all articles without overlap; Notes APIs, finance notes and search: OK");
  const anonymous = await context.request.post(`${base}/api/admin/articles`, { data: {}, headers: { Origin: base } });
  assert.equal(anonymous.status(), 401, "Anonymous publishing must be denied");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await open("/admin/login");
  assert(process.env.ADMIN_EDITOR_PASSWORD, "Local admin password is not configured");
  await page.getByLabel("管理员密码", { exact: true }).fill(process.env.ADMIN_EDITOR_PASSWORD);
  await page.getByRole("button", { name: "进入编辑器" }).click();
  await page.waitForURL("**/admin/articles");
  const classification = page.getByLabel("所属板块与分类", { exact: true });
  await classification.selectOption("notes:essays");
  assert.match(await page.locator(".admin-section-summary").innerText(), /Notes.*随笔思考/s);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出 .md" }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  assert.match(Buffer.concat(chunks).toString("utf8"), /notesTopic: essays|notesTopic: "essays"/);
  results.push("Notes classification exported in Markdown: OK");
  await classification.selectOption("programming");
  assert.match(await page.locator(".admin-section-summary").innerText(), /Research.*编程/s);
  await page.getByRole("button", { name: "文章库", exact: true }).click();
  await page.locator(".admin-library-sections button").filter({ hasText: "Notes" }).click();
  assert(await page.locator(".admin-option-category strong").evaluateAll((elements) => elements.every((element) => element.textContent === "Notes")));
  await page.screenshot({ path: path.join(output, "studio-sections.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  const menuBounds = await page.locator(".admin-article-menu").boundingBox();
  assert(menuBounds.x >= 0 && menuBounds.x + menuBounds.width <= 390 && menuBounds.y >= 0 && menuBounds.y + menuBounds.height <= 844, "Studio menu clipped on mobile");
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "Studio mobile overflow");
  await page.screenshot({ path: path.join(output, "studio-mobile.png"), fullPage: true });
  const invalid = await context.request.post(`${base}/api/admin/articles`, { headers: { Origin: base }, data: { notesTopic: "essays", researchTopic: "programming" } });
  assert.equal(invalid.status(), 400, "Conflicting sections must be rejected");
  results.push("Admin login, section selector, Notes library filter, mobile layout, publishing guards: OK");
  assert.equal(errors.length, 0, `Browser runtime errors: ${errors.join("; ")}`);
  assert.equal(consoleErrors.length, 0, `First-party browser console errors: ${consoleErrors.map((entry) => `${entry.route}: ${entry.message} (${entry.url})`).join("; ")}`);
  assert.equal(localHttpErrors.length, 0, `First-party HTTP errors: ${localHttpErrors.map((entry) => `${entry.status} ${entry.url}`).join("; ")}`);
  results.push(`First-party browser console/HTTP errors: none${externalConsoleErrors.length ? `; external iframe/resource console messages: ${externalConsoleErrors.length}` : ""}`);
  fs.writeFileSync(path.join(output, "prelaunch-results.json"), JSON.stringify({ base, results, runtimeErrors: errors, consoleErrors, externalConsoleErrors, localHttpErrors, realPublication: false }, null, 2));
  console.log(results.join("\n"));
} finally {
  await browser.close();
}
