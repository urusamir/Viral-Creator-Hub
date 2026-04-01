const { chromium } = require('playwright');

(async () => {
  console.log("Starting playwright...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('https://viralislive.vercel.app/login', { waitUntil: 'networkidle' });
  const content = await page.content();
  console.log("BODY START", content.substring(0, 500));
  await page.screenshot({ path: 'vercel-home.png' });
  await browser.close();
})();
