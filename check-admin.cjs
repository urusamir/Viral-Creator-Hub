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
  
  await page.goto('http://localhost:3000/login');
  
  // Fill login
  await page.fill('input[type="email"]', 'testadmin123@gmail.com');
  await page.fill('input[type="password"]', '12345678');
  await page.click('button[type="submit"]');
  
  console.log("Logged in, waiting for navigation...");
  await page.waitForTimeout(2000);
  
  console.log("Navigating to admin...");
  await page.goto('http://localhost:3000/admin');
  await page.waitForTimeout(3000);
  
  console.log("Navigating to brand details...");
  // Let's get the first brand link or just go directly
  await page.goto('http://localhost:3000/admin/brands/1f31fbb7-cadb-4176-bf25-ccce3323528b'); // using a random id, it should fail with "Brand not found" or keep loading
  await page.waitForTimeout(3000);

  await browser.close();
})();
