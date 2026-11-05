### Tests Pass Headed but Fail Headless

Severity: MEDIUM

Situation: Running tests in headless mode for CI

Symptoms:
Works perfectly when you watch it. Fails mysteriously in CI.
"Element not visible" in headless but visible in headed mode.

Why this breaks:
Headless browsers have no display, which affects some CSS (visibility
calculations), viewport sizing, and font rendering. Some animations
behave differently. Popup windows may not work.

Recommended fix:

# Set consistent viewport:
const browser = await chromium.launch({
  headless: true,
});

const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
});

# Or in config:
export default defineConfig({
  use: {
    viewport: { width: 1280, height: 720 },
  },
});

# Debug headless failures:
# 1. Run with headed mode locally
npx playwright test --headed

# 2. Slow down to watch
npx playwright test --headed --slowmo 100

# 3. Use trace viewer for CI failures
npx playwright show-trace trace.zip

# 4. For stubborn issues, screenshot at failure point:
await page.screenshot({ path: 'debug.png', fullPage: true });

### Getting Blocked by Rate Limiting

Severity: HIGH

Situation: Scraping multiple pages quickly

Symptoms:
Works for first 50 pages, then 429 errors. Suddenly all requests fail.
IP gets blocked. CAPTCHA starts appearing after successful requests.

Why this breaks:
Sites monitor request patterns. 100 requests per second from one IP
is obviously automated. Rate limits protect servers and catch scrapers.

Recommended fix:

# Add delays between requests:

const randomDelay = () =>
  new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));

for (const url of urls) {
  await randomDelay();  // 1-3 second delay
  await page.goto(url);
  // ... scrape ...
}

# Use rotating proxies:
const proxies = ['http://proxy1:8080', 'http://proxy2:8080'];
let proxyIndex = 0;

const getNextProxy = () => proxies[proxyIndex++ % proxies.length];

const context = await browser.newContext({
  proxy: { server: getNextProxy() },
});

# Limit concurrent requests:
import pLimit from 'p-limit';
const limit = pLimit(3);  // Max 3 concurrent

await Promise.all(
  urls.map(url => limit(() => scrapePage(url)))
);

# Rotate user agents:
const userAgents = [
  'Mozilla/5.0 (Windows...',
  'Mozilla/5.0 (Macintosh...',
];

await page.setExtraHTTPHeaders({
  'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)]
});

### New Windows/Popups Not Handled

Severity: MEDIUM

Situation: Clicking links that open new windows

Symptoms:
Click button, nothing happens. Test hangs. "Window not found" errors.
Actions succeed but verification fails because you're on wrong page.

Why this breaks:
target="_blank" links open new windows. Your page reference still
points to the original page. The new window exists but you're not
listening for it.

Recommended fix:

# Wait for popup BEFORE triggering it:

### New window/tab:
const pagePromise = context.waitForEvent('page');
await page.getByRole('link', { name: 'Open in new tab' }).click();
const newPage = await pagePromise;
await newPage.waitForLoadState();

// Now interact with new page
await expect(newPage.getByRole('heading')).toBeVisible();

// Close when done
await newPage.close();

### Popup windows:
const popupPromise = page.waitForEvent('popup');
await page.getByRole('button', { name: 'Open popup' }).click();
const popup = await popupPromise;
await popup.waitForLoadState();

### Multiple windows:
const pages = context.pages();  // Get all open pages

### Can't Interact with Elements in iframes

Severity: MEDIUM

Situation: Page contains embedded iframes

Symptoms:
Element clearly visible but "not found". Selector works in DevTools
but not in Playwright. Parent page selectors work, iframe content
doesn't.

Why this breaks:
iframes are separate documents. page.locator only searches the main
frame. You need to explicitly get the iframe's frame to interact
with its contents.

Recommended fix:

# Get frame by name or selector:

### By frame name:
const frame = page.frame('payment-iframe');
await frame.getByRole('textbox', { name: 'Card number' }).fill('4242...');

## By selector:
const frame = page.frameLocator('iframe#payment');
await frame.getByRole('textbox', { name: 'Card number' }).fill('4242...');

### Nested iframes:
const outer = page.frameLocator('iframe#outer');
const inner = outer.frameLocator('iframe#inner');
await inner.getByRole('button').click();

### Wait for iframe to load:
await page.waitForSelector('iframe#payment');
const frame = page.frameLocator('iframe#payment');
await frame.getByText('Secure Payment').waitFor();

