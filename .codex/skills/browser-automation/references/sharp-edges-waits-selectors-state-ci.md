## Sharp Edges

### Using waitForTimeout Instead of Proper Waits

Severity: CRITICAL

Situation: Waiting for elements or page state

Symptoms:
Tests pass locally, fail in CI. Pass 9 times, fail on the 10th.
"Element not found" errors that seem random. Tests take 30+ seconds
when they should take 3.

Why this breaks:
waitForTimeout is a fixed delay. If the page loads in 500ms, you wait
2000ms anyway. If the page takes 2100ms (CI is slower), you fail.
There's no correct value - it's always either too short or too long.

Recommended fix:

# REMOVE all waitForTimeout calls

# WRONG:
await page.goto('/dashboard');
await page.waitForTimeout(2000);  # Arbitrary!
await page.click('.submit');

# CORRECT - Auto-wait handles it:
await page.goto('/dashboard');
await page.getByRole('button', { name: 'Submit' }).click();

# If you need to wait for specific condition:
await expect(page.getByText('Dashboard')).toBeVisible();
await page.waitForURL('**/dashboard');
await page.waitForResponse(resp => resp.url().includes('/api/data'));

# For animations, wait for element to be stable:
await page.getByRole('button').click();  # Auto-waits for stable

# NEVER use setTimeout or waitForTimeout in production code

### CSS Selectors Tied to Styling Classes

Severity: HIGH

Situation: Selecting elements for interaction

Symptoms:
Tests break after CSS refactoring. Selectors like .btn-primary stop
working. Frontend redesign breaks all tests without changing behavior.

Why this breaks:
CSS class names are implementation details for styling, not semantic
meaning. When designers change from .btn-primary to .button--primary,
your tests break even though behavior is identical.

Recommended fix:

# Use user-facing locators instead:

# WRONG - Tied to CSS:
await page.locator('.btn-primary.submit-form').click();
await page.locator('#sidebar > div.menu > ul > li:nth-child(3)').click();

# CORRECT - User-facing:
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByRole('menuitem', { name: 'Settings' }).click();

# If you must use CSS, use data-testid:
<button data-testid="submit-order">Submit</button>

await page.getByTestId('submit-order').click();

# Locator priority:
# 1. getByRole - matches accessibility
# 2. getByText - matches visible content
# 3. getByLabel - matches form labels
# 4. getByTestId - explicit test contract
# 5. CSS/XPath - last resort only

### navigator.webdriver Exposes Automation

Severity: HIGH

Situation: Scraping sites with bot detection

Symptoms:
Immediate 403 errors. CAPTCHA challenges. Empty pages. "Access Denied"
messages. Works for 1 request, then gets blocked.

Why this breaks:
By default, headless browsers set navigator.webdriver = true. This is
the first thing bot detection checks. It's a bright red flag that
says "I'm automated."

Recommended fix:

# Use stealth plugins:

### Puppeteer Stealth (best option):
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--disable-blink-features=AutomationControlled'],
});

### Playwright Stealth:
import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';

chromium.use(stealth());

### Manual (partial):
await page.evaluateOnNewDocument(() => {
  Object.defineProperty(navigator, 'webdriver', {
    get: () => undefined,
  });
});

# Note: This is cat-and-mouse. Detection evolves.
# For serious scraping, consider managed solutions like Browserbase.

### Tests Share State and Affect Each Other

Severity: HIGH

Situation: Running multiple tests in sequence

Symptoms:
Tests pass individually but fail when run together. Order matters -
test B fails if test A runs first. Random failures that "fix themselves"
on rerun.

Why this breaks:
Shared browser context means shared cookies, localStorage, and session
state. Test A logs in, test B expects logged-out state. Test A adds
item to cart, test B's cart count is wrong.

Recommended fix:

# Each test must be fully isolated:

### Playwright Test (automatic isolation):
test('first test', async ({ page }) => {
  // Fresh context, fresh page
});

test('second test', async ({ page }) => {
  // Completely isolated from first test
});

### Manual isolation:
const context = await browser.newContext();  // Fresh context
const page = await context.newPage();
// ... test code ...
await context.close();  // Clean up

## Shared authentication (the right way):
// 1. Save auth state to file
await context.storageState({ path: './auth.json' });

// 2. Reuse in other tests
const context = await browser.newContext({
  storageState: './auth.json'
});

# Never modify global state in tests
# Never rely on previous test's actions

### No Trace Capture for CI Failures

Severity: MEDIUM

Situation: Debugging test failures in CI

Symptoms:
"Test failed in CI" with no useful information. Can't reproduce
locally. Screenshot shows page but not what went wrong. Guessing
at root cause.

Why this breaks:
CI runs headless on different hardware. Timing is different. Network
is different. Without traces, you can't see what actually happened -
the sequence of actions, network requests, console logs.

Recommended fix:

# Enable traces for failures:

### playwright.config.ts:
export default defineConfig({
  use: {
    trace: 'retain-on-failure',    # Keep trace on failure
    screenshot: 'only-on-failure', # Screenshot on failure
    video: 'retain-on-failure',    # Video on failure
  },
  outputDir: './test-results',
});

### View trace locally:
npx playwright show-trace test-results/path/to/trace.zip

### In CI, upload test-results as artifact:
# GitHub Actions:
- uses: actions/upload-artifact@v3
  if: failure()
  with:
    name: playwright-traces
    path: test-results/

# Trace shows:
# - Timeline of actions
# - Screenshots at each step
# - Network requests and responses
# - Console logs
# - DOM snapshots

