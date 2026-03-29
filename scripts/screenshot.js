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
  console.log('🚀 Starting multi-language screenshot task (Descriptive Names)...');
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // Helper to force light mode
  const setLightMode = async () => {
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await sleep(500);
  };
  
  // Helper to force dark mode
  const setDarkMode = async () => {
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await sleep(500);
  };

  const capture = async (locale) => {
    console.log(`🌐 Locale: ${locale}`);
    await page.goto(DEMO_URL, { waitUntil: 'domcontentloaded' });
    await page.evaluate((l) => localStorage.setItem('transmission-locale', l), locale);
    await page.goto(DEMO_URL, { waitUntil: 'domcontentloaded' });
    await sleep(3000);

    const suffix = locale === 'zh' ? '' : `_${locale}`;

    // Dashboard - Light
    console.log(`📸 Dashboard (Light, ${locale})`);
    await setLightMode();
    await page.screenshot({ path: path.join(OUTPUT_DIR, `dashboard_light${suffix}.png`) });

    // Dashboard - Dark
    console.log(`📸 Dashboard (Dark, ${locale})`);
    await setDarkMode();
    await page.screenshot({ path: path.join(OUTPUT_DIR, `dashboard_dark${suffix}.png`) });

    // Torrent Details (Light)
    console.log(`📸 Details (Light, ${locale})`);
    await page.goto(`${DEMO_URL}/#/torrents/detail?id=1`, { waitUntil: 'domcontentloaded' });
    await setLightMode();
    await sleep(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, `torrent_details${suffix}.png`) });

    // Settings (Light)
    console.log(`📸 Settings (Light, ${locale})`);
    await page.goto(`${DEMO_URL}/#/settings`, { waitUntil: 'domcontentloaded' });
    await setLightMode();
    await sleep(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, `settings${suffix}.png`) });
  };

  // Run for both locales
  await capture('zh');
  await capture('en');

  console.log(`✅ All descriptive screenshots saved to: ${OUTPUT_DIR}`);
  await browser.close();
}

takeScreenshots().catch(err => {
  console.error('❌ Error during screenshots:', err);
  process.exit(1);
});
