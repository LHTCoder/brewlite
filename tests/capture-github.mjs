/**
 * Chụp ảnh minh chứng CI/CD trên GitHub (repo public) cho báo cáo.
 *   node capture-github.mjs            -> docs/evidence/github/*.png
 * Biến tuỳ chọn: REPO (mặc định LHTCoder/brewlite), CD_RUN (id lần chạy CD cần chụp)
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = process.env.REPO ?? 'LHTCoder/brewlite';
const GH = `https://github.com/${REPO}`;
const OUT = process.env.OUT_DIR ?? join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'evidence', 'github');
mkdirSync(OUT, { recursive: true });

const pages = [
  ['01-repo.png', GH],
  ['02-lich-su-commit.png', `${GH}/commits/main`],
  ['03-pull-requests.png', `${GH}/pulls?q=is%3Apr`],
  ['04-pr5-ci-that-bai.png', `${GH}/pull/5`],
  ['05-ci-runs.png', `${GH}/actions/workflows/ci.yml`],
  ['06-cd-runs.png', `${GH}/actions/workflows/cd.yml`],
  ...(process.env.CD_RUN ? [['07-cd-run-thanh-cong.png', `${GH}/actions/runs/${process.env.CD_RUN}`]] : []),
  ['08-packages-ghcr.png', `https://github.com/${REPO.split('/')[0]}?tab=packages`],
  ['09-releases.png', `${GH}/releases`],
  ['10-branches.png', `${GH}/branches`],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, locale: 'en-US', colorScheme: 'light' });
const page = await ctx.newPage();
const results = [];
for (const [file, url] of pages) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3500);
    await page.screenshot({ path: join(OUT, file), fullPage: false });
    results.push(`OK   ${file}`);
  } catch (e) {
    results.push(`FAIL ${file}: ${String(e?.message ?? e).split('\n')[0]}`);
  }
}
await browser.close();
console.log(results.join('\n'));
