### Network Interception Pattern

Mock, block, or modify network requests

**When to use**: Testing, blocking ads/analytics, modifying responses

# NETWORK INTERCEPTION:

## Block Unnecessary Resources
"""
await page.route('**/*', (route) => {
  const url = route.request().url();
  const resourceType = route.request().resourceType();

  // Block images, fonts, analytics for faster scraping
  if (['image', 'font', 'media'].includes(resourceType)) {
    return route.abort();
  }

  // Block tracking/analytics
  if (url.includes('google-analytics') ||
      url.includes('facebook.com/tr')) {
    return route.abort();
  }

  return route.continue();
});
"""

## Mock API Responses (Testing)
"""
await page.route('**/api/products', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([
      { id: 1, name: 'Mock Product', price: 99.99 },
    ]),
  });
});

// Now page will receive mocked data
await page.goto('/products');
"""

## Capture API Responses
"""
const apiResponses: any[] = [];

page.on('response', async (response) => {
  if (response.url().includes('/api/')) {
    const data = await response.json().catch(() => null);
    apiResponses.push({
      url: response.url(),
      status: response.status(),
      data,
    });
  }
});

await page.goto('/dashboard');
// apiResponses now contains all API calls
"""

