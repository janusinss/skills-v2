### Stealth Browser Pattern

Avoid bot detection for scraping

**When to use**: Scraping sites with anti-bot protection

# STEALTH BROWSER PATTERN:

"""
Bot detection checks for:
- navigator.webdriver property
- Chrome DevTools protocol artifacts
- Browser fingerprint inconsistencies
- Behavioral patterns (perfect timing, no mouse movement)
- Headless indicators
"""

## Puppeteer Stealth (Best Anti-Detection)
"""
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const browser = await puppeteer.launch({
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-blink-features=AutomationControlled',
  ],
});

const page = await browser.newPage();

// Set realistic viewport
await page.setViewport({ width: 1920, height: 1080 });

// Realistic user agent
await page.setUserAgent(
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
);

// Navigate with human-like behavior
await page.goto('https://target-site.com', {
  waitUntil: 'networkidle0',
});
"""

## Playwright Stealth
"""
import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';

chromium.use(stealth());

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  userAgent: 'Mozilla/5.0 ...',
  locale: 'en-US',
  timezoneId: 'America/New_York',
});
"""

## Human-Like Behavior
"""
// Random delays between actions
const randomDelay = (min: number, max: number) =>
  new Promise(r => setTimeout(r, Math.random() * (max - min) + min));

await page.goto(url);
await randomDelay(500, 1500);

// Mouse movement before click
const button = await page.$('button.submit');
const box = await button.boundingBox();
await page.mouse.move(
  box.x + box.width / 2,
  box.y + box.height / 2,
  { steps: 10 }  // Move in steps like a human
);
await randomDelay(100, 300);
await button.click();

// Scroll naturally
await page.evaluate(() => {
  window.scrollBy({
    top: 300 + Math.random() * 200,
    behavior: 'smooth'
  });
});
"""

