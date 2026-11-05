### Error Recovery Pattern

Handle failures gracefully with screenshots and retries

**When to use**: Any production automation

# ERROR RECOVERY PATTERN:

## Automatic Screenshot on Failure
"""
// playwright.config.ts
export default defineConfig({
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  retries: 2,  // Retry failed tests
});
"""

## Try-Catch with Debug Info
"""
async function scrapeProduct(page: Page, url: string) {
  try {
    await page.goto(url, { timeout: 30000 });

    const title = await page.getByRole('heading', { level: 1 }).textContent();
    const price = await page.getByTestId('price').textContent();

    return { title, price, success: true };

  } catch (error) {
    // Capture debug info
    const screenshot = await page.screenshot({
      path: `errors/${Date.now()}-error.png`,
      fullPage: true
    });

    const html = await page.content();
    await fs.writeFile(`errors/${Date.now()}-page.html`, html);

    console.error({
      url,
      error: error.message,
      currentUrl: page.url(),
    });

    return { success: false, error: error.message };
  }
}
"""

## Retry with Exponential Backoff
"""
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        const jitter = delay * 0.1 * Math.random();
        await new Promise(r => setTimeout(r, delay + jitter));
      }
    }
  }

  throw lastError;
}

// Usage
const result = await withRetry(
  () => scrapeProduct(page, url),
  3,
  2000
);
"""

### Parallel Execution Pattern

Run tests/tasks in parallel for speed

**When to use**: Multiple independent pages or tests

# PARALLEL EXECUTION:

## Playwright Test Parallelization
"""
// playwright.config.ts
export default defineConfig({
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,  // CI: 4 workers, local: CPU-based

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
"""

## Browser Contexts for Parallel Scraping
"""
const browser = await chromium.launch();

const urls = ['url1', 'url2', 'url3', 'url4', 'url5'];

// Create multiple contexts - each is isolated
const results = await Promise.all(
  urls.map(async (url) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto(url);
      const data = await extractData(page);
      return { url, data, success: true };
    } catch (error) {
      return { url, error: error.message, success: false };
    } finally {
      await context.close();
    }
  })
);

await browser.close();
"""

## Rate-Limited Parallel Processing
"""
import pLimit from 'p-limit';

const limit = pLimit(5);  // Max 5 concurrent

const results = await Promise.all(
  urls.map(url => limit(async () => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Random delay between requests
    await new Promise(r => setTimeout(r, Math.random() * 2000));

    try {
      return await scrapePage(page, url);
    } finally {
      await context.close();
    }
  }))
);
"""

