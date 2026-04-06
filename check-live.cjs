const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`);
  });
  page.on('pageerror', error => {
    console.log(`BROWSER ERROR: ${error.message}`);
  });
  
  page.on('requestfailed', request => {
    console.log(`REQUEST FAILED: ${request.url()} - ${request.failure().errorText}`);
  });
  
  console.log("Navigating to https://viralislive.vercel.app/admin-login");
  await page.goto('https://viralislive.vercel.app/admin-login', { waitUntil: 'networkidle' });
  
  console.log("Filling login form...");
  await page.fill('input[type="email"]', 'testadmin123@gmail.com');
  await page.fill('input[type="password"]', '12345678');
  await page.click('button[type="submit"]');
  
  console.log("Logged in, waiting for navigation...");
  await page.waitForTimeout(5000);
  
  console.log("Current URL after login:", page.url());
  
  // click the users tab or dashboard tab
  let url = page.url();
  if (!url.includes('/admin')) {
    await page.goto('https://viralislive.vercel.app/admin');
    await page.waitForTimeout(3000);
  }
  
  console.log("Checking Brands...");
  await page.goto('https://viralislive.vercel.app/admin/brands');
  await page.waitForTimeout(4000);

  // click a brand to check details where the spinner is
  console.log("Clicking first brand if available...");
  const brandLinks = await page.$$('a[href^="/admin/brands/"]');
  if (brandLinks.length > 0) {
    await brandLinks[0].click();
    console.log("Clicked brand, waiting 5 seconds for loading...");
    await page.waitForTimeout(5000);
  } else {
    // go to the url from screenshot
    await page.goto('https://viralislive.vercel.app/admin/brands/8ddd1cd5-a638-442f-bd56-d33d9411adb4');
    await page.waitForTimeout(5000);
  }

  console.log("Test finished.");
  await browser.close();
})();
