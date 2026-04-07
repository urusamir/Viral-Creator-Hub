const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set mock auth state
  await page.goto('http://localhost:5173/');
  await page.evaluate(() => {
    localStorage.setItem('vairal-auth-test', 'true');
  });

  await page.goto('http://localhost:5173/dashboard/campaigns/new');
  
  // Wait for the UI to be ready
  await page.waitForSelector('[data-testid="text-step-title"]');
  console.log("Found title:", await page.textContent('[data-testid="text-step-title"]'));
  
  // Click next button
  const nextBtn = await page.$('[data-testid="button-next"]');
  console.log("Is button disabled?", await nextBtn.isDisabled());
  
  await nextBtn.click();
  
  await page.waitForTimeout(500); // give it a moment
  console.log("Title after click:", await page.textContent('[data-testid="text-step-title"]'));
  
  await browser.close();
})();
