import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEMO_URL = 'https://transmission-next-ui-demo.pages.dev';
const OUTPUT_DIR = path.join(__dirname, '../pic');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function takeScreenshots() {
  console.log('🚀 Starting multi-language screenshot task...');
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // --- Locale: ZH ---
  console.log('🌐 Locale: zh');
  await page.goto(DEMO_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.setItem('transmission-locale', 'zh'));
  await page.goto(DEMO_URL, { waitUntil: 'domcontentloaded' });
  await sleep(2000);

  console.log('📸 Dashboard (Light, ZH)');
  await page.evaluate(() => document.documentElement.classList.remove('dark'));
  await sleep(500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'demo.png') });

  console.log('📸 Dashboard (Dark, ZH)');
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await sleep(500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'demo_dark.png') });

  console.log('📸 Details (ZH)');
  await page.goto(`${DEMO_URL}/#/torrents/detail?id=1`, { waitUntil: 'domcontentloaded' });
  await sleep(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'demo2.png') });

  // --- Locale: EN ---
  console.log('🌐 Locale: en');
  await page.goto(DEMO_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.setItem('transmission-locale', 'en'));
  await page.goto(DEMO_URL, { waitUntil: 'domcontentloaded' });
  await sleep(2000);

  console.log('📸 Dashboard (Light, EN)');
  await page.evaluate(() => document.documentElement.classList.remove('dark'));
  await sleep(500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'demo_en.png') });

  console.log('📸 Dashboard (Dark, EN)');
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await sleep(500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'demo_dark_en.png') });

  console.log('📸 Details (EN)');
  await page.goto(`${DEMO_URL}/#/torrents/detail?id=1`, { waitUntil: 'domcontentloaded' });
  await sleep(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'demo2_en.png') });

  console.log('📸 Settings (EN)');
  await page.goto(`${DEMO_URL}/#/settings`, { waitUntil: 'domcontentloaded' });
  await sleep(1000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'demo3_en.png') });

  console.log(`✅ All screenshots saved to: ${OUTPUT_DIR}`);
  await browser.close();
}

takeScreenshots().catch(err => {
  console.error('❌ Error during screenshots:', err);
  process.exit(1);
});
