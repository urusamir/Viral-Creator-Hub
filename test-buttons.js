const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navigate to wizard
  await page.goto('http://localhost:5173/');
  
  console.log("If need login, do it here");
  
  await browser.close();
})();
