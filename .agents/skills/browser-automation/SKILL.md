---
name: browser-automation
description: "Automate browsers for web testing, scraping, and agent flows with resilient selectors and waits. Use when writing browser scripts or fixing flaky automation."
risk: critical
source: vibeship-spawner-skills (Apache 2.0)
date_added: 2026-02-27
---

# Browser Automation

Browser automation powers web testing, scraping, and AI agent interactions.
The difference between a flaky script and a reliable system comes down to
understanding selectors, waiting strategies, and anti-detection patterns.

This skill covers Playwright (recommended) and Puppeteer, with patterns for
testing, scraping, and agentic browser control. Key insight: Playwright won
the framework war. Unless you need Puppeteer's stealth ecosystem or are
Chrome-only, Playwright is the better choice in 2025.

Critical distinction: Testing automation (predictable apps you control) vs
scraping/agent automation (unpredictable sites that fight back). Different
problems, different solutions.

## Principles

- Use user-facing locators (getByRole, getByText) over CSS/XPath
- Never add manual waits - Playwright's auto-wait handles it
- Each test/task should be fully isolated with fresh context
- Screenshots and traces are your debugging lifeline
- Headless for CI, headed for debugging
- Anti-detection is cat-and-mouse - stay current or get blocked

## Capabilities

- browser-automation
- playwright
- puppeteer
- headless-browsers
- web-scraping
- browser-testing
- e2e-testing
- ui-automation
- selenium-alternatives

## Scope

- api-testing → backend
- load-testing → performance-thinker
- accessibility-testing → accessibility-specialist
- visual-regression-testing → ui-design

## Tooling

### Frameworks

- Playwright - When: Default choice - cross-browser, auto-waiting, best DX Note: 96% success rate, 4.5s avg execution, Microsoft-backed
- Puppeteer - When: Chrome-only, need stealth plugins, existing codebase Note: 75% success rate at scale, but best stealth ecosystem
- Selenium - When: Legacy systems, specific language bindings Note: Slower, more verbose, but widest browser support

### Stealth_tools

- puppeteer-extra-plugin-stealth - When: Need to bypass bot detection with Puppeteer Note: Gold standard for anti-detection
- playwright-extra - When: Stealth plugins for Playwright Note: Port of puppeteer-extra ecosystem
- undetected-chromedriver - When: Selenium anti-detection Note: Dynamic bypass of detection

### Cloud_browsers

- Browserbase - When: Managed headless infrastructure Note: Built-in stealth mode, session management
- BrowserStack - When: Cross-browser testing at scale Note: Real devices, CI integration

## Patterns

### Test Isolation Pattern

Each test runs in complete isolation with fresh state

**When to use**: Testing, any automation that needs reproducibility

# TEST ISOLATION:

"""
Each test gets its own:
- Browser context (cookies, storage)
- Fresh page
- Clean state
"""

## Playwright Test Example
"""
import { test, expect } from '@playwright/test';

// Each test runs in isolated browser context
test('user can add item to cart', async ({ page }) => {
  // Fresh context - no cookies, no storage from other tests
  await page.goto('/products');
  await page.getByRole('button', { name: 'Add to Cart' }).click();
  await expect(page.getByTestId('cart-count')).toHaveText('1');
});

test('user can remove item from cart', async ({ page }) => {
  // Completely isolated - cart is empty
  await page.goto('/cart');
  await expect(page.getByText('Your cart is empty')).toBeVisible();
});
"""

## Shared Authentication Pattern
"""
// Save auth state once, reuse across tests
// setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Wait for auth to complete
  await page.waitForURL('/dashboard');

  // Save authentication state
  await page.context().storageState({
    path: './playwright/.auth/user.json'
  });
});

// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'tests',
      dependencies: ['setup'],
      use: {
        storageState: './playwright/.auth/user.json',
      },
    },
  ],
});
"""

### User-Facing Locator Pattern

Select elements the way users see them

**When to use**: Always - the default approach for selectors

# USER-FACING LOCATORS:

"""
Priority order:
1. getByRole  - Best: matches accessibility tree
2. getByText  - Good: matches visible content
3. getByLabel - Good: matches form labels
4. getByTestId - Fallback: explicit test contracts
5. CSS/XPath - Last resort: fragile, avoid
"""

## Good Examples (User-Facing)
"""
// By role - THE BEST CHOICE
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByRole('link', { name: 'Sign up' }).click();
await page.getByRole('heading', { name: 'Dashboard' }).isVisible();
await page.getByRole('textbox', { name: 'Search' }).fill('query');

// By text content
await page.getByText('Welcome back').isVisible();
await page.getByText(/Order #\d+/).click();  // Regex supported

// By label (forms)
await page.getByLabel('Email address').fill('user@example.com');
await page.getByLabel('Password').fill('secret');

// By placeholder
await page.getByPlaceholder('Search...').fill('query');

// By test ID (when no user-facing option works)
await page.getByTestId('submit-button').click();
"""

## Bad Examples (Fragile)
"""
// DON'T - CSS selectors tied to structure
await page.locator('.btn-primary.submit-form').click();
await page.locator('#header > div > button:nth-child(2)').click();

// DON'T - XPath tied to structure
await page.locator('//div[@class="form"]/button[1]').click();

// DON'T - Auto-generated selectors
await page.locator('[data-v-12345]').click();
"""

## Filtering and Chaining
"""
// Filter by containing text
await page.getByRole('listitem')
  .filter({ hasText: 'Product A' })
  .getByRole('button', { name: 'Add to cart' })
  .click();

// Filter by NOT containing
await page.getByRole('listitem')
  .filter({ hasNotText: 'Sold out' })
  .first()
  .click();

// Chain locators
const row = page.getByRole('row', { name: 'John Doe' });
await row.getByRole('button', { name: 'Edit' }).click();
"""

### Auto-Wait Pattern

Let Playwright wait automatically, never add manual waits

**When to use**: Always with Playwright

# AUTO-WAIT PATTERN:

"""
Playwright waits automatically for:
- Element to be attached to DOM
- Element to be visible
- Element to be stable (not animating)
- Element to receive events
- Element to be enabled

NEVER add manual waits!
"""

## Wrong - Manual Waits
"""
// DON'T DO THIS
await page.goto('/dashboard');
await page.waitForTimeout(2000);  // NO! Arbitrary wait
await page.click('.submit-button');

// DON'T DO THIS
await page.waitForSelector('.loading-spinner', { state: 'hidden' });
await page.waitForTimeout(500);  // "Just to be safe" - NO!
"""

## Correct - Let Auto-Wait Work
"""
// Auto-waits for button to be clickable
await page.getByRole('button', { name: 'Submit' }).click();

// Auto-waits for text to appear
await expect(page.getByText('Success!')).toBeVisible();

// Auto-waits for navigation to complete
await page.goto('/dashboard');
// Page is ready - no manual wait needed
"""

## When You DO Need to Wait
"""
// Wait for specific network request
const responsePromise = page.waitForResponse(
  response => response.url().includes('/api/data')
);
await page.getByRole('button', { name: 'Load' }).click();
const response = await responsePromise;

// Wait for URL change
await Promise.all([
  page.waitForURL('**/dashboard'),
  page.getByRole('button', { name: 'Login' }).click(),
]);

// Wait for download
const downloadPromise = page.waitForEvent('download');
await page.getByText('Export CSV').click();
const download = await downloadPromise;
"""


## References

- [references/stealth-and-anti-detection.md](references/stealth-and-anti-detection.md) - read this when scripts get bot-detected or you need stealth plugins and human-like behavior.
- [references/error-recovery-and-parallel-execution.md](references/error-recovery-and-parallel-execution.md) - read this when adding failure screenshots, retries, or parallel/rate-limited runs.
- [references/network-interception.md](references/network-interception.md) - read this when blocking resources, mocking or capturing API responses.
- [references/sharp-edges-waits-selectors-state-ci.md](references/sharp-edges-waits-selectors-state-ci.md) - read this when debugging waitForTimeout use, fragile selectors, webdriver exposure, shared state, or missing CI traces.
- [references/sharp-edges-headless-rate-limits-windows-iframes.md](references/sharp-edges-headless-rate-limits-windows-iframes.md) - read this when tests fail headless, get rate-limited, or involve popups and iframes.

## Validation Checks

### Using waitForTimeout

Severity: ERROR

waitForTimeout causes flaky tests and slow execution

Message: Using waitForTimeout - remove it. Playwright auto-waits for elements. Use waitForResponse, waitForURL, or assertions instead.

### Using setTimeout in Test Code

Severity: WARNING

setTimeout is unreliable for timing in tests

Message: Using setTimeout instead of Playwright waits. Replace with await expect(...).toBeVisible() or page.waitFor*.

### Custom Sleep Function

Severity: WARNING

Sleep functions indicate improper waiting strategy

Message: Custom sleep function detected. Use Playwright's built-in waiting mechanisms instead.

### CSS Class Selector Used

Severity: WARNING

CSS class selectors are fragile

Message: Using CSS class selector. Prefer getByRole, getByText, getByLabel, or getByTestId for more stable selectors.

### nth-child CSS Selector

Severity: WARNING

Position-based selectors are very fragile

Message: Using position-based selector. These break when DOM order changes. Use user-facing locators instead.

### XPath Selector Used

Severity: INFO

XPath should be last resort

Message: Using XPath selector. Consider getByRole, getByText first. XPath should be last resort for complex DOM traversal.

### Auto-Generated Selector

Severity: WARNING

Framework-generated selectors are extremely fragile

Message: Using auto-generated selector. These change on every build. Use data-testid instead.

### Puppeteer Without Stealth Plugin

Severity: INFO

Scraping without stealth is easily detected

Message: Using Puppeteer without stealth plugin. Consider puppeteer-extra-plugin-stealth for anti-detection.

### navigator.webdriver Not Hidden

Severity: INFO

navigator.webdriver exposes automation

Message: Launching browser without hiding automation flags. For scraping, add stealth measures.

### Scraping Loop Without Error Handling

Severity: WARNING

One failure shouldn't crash entire scrape

Message: Scraping loop without try/catch. One page failure will crash the entire scrape. Add error handling.

## Collaboration

### Delegation Triggers

- user needs full desktop control beyond browser -> computer-use-agents (Desktop automation for non-browser apps)
- user needs API testing alongside browser tests -> backend (API integration and testing patterns)
- user needs testing strategy -> test-architect (Overall test architecture decisions)
- user needs visual regression testing -> ui-design (Visual comparison and design validation)
- user needs browser automation in workflows -> workflow-automation (Durable execution for browser tasks)
- user building browser tools for agents -> agent-tool-builder (Tool design patterns for LLM agents)

## Related Skills

Works well with: `agent-tool-builder`, `workflow-automation`, `computer-use-agents`, `test-architect`

## When to Use
- User mentions or implies: playwright
- User mentions or implies: puppeteer
- User mentions or implies: browser automation
- User mentions or implies: headless
- User mentions or implies: web scraping
- User mentions or implies: e2e test
- User mentions or implies: end-to-end
- User mentions or implies: selenium
- User mentions or implies: chromium
- User mentions or implies: browser test
- User mentions or implies: page.click
- User mentions or implies: locator

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
