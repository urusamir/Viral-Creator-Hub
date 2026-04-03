const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));
  
  await page.goto('http://localhost:5000/auth');
  await page.waitForTimeout(2000);
  
  // Fill email
  await page.fill('input[type="email"]', 'admin@viral.com'); // assuming some test user
  await page.fill('input[type="password"]', 'password123'); // assuming test password
  await page.click('button:has-text("Sign in")');
  
  await page.waitForTimeout(5000);
  // Check what page we are on
  console.log("CURRENT URL:", page.url());
  
  await browser.close();
})();
