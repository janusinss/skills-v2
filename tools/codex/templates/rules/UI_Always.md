# Frontend quality guidance

Apply the relevant checks when creating or changing a web interface. Keep the user's design choices and existing conventions.

- Prevent unintended horizontal overflow by fixing container widths, wrapping, and flex/grid minimum sizes. Account for fixed navigation in the layout. Use stable page-height behavior when a sparse page needs a footer at the bottom.
- Preserve semantic controls, keyboard navigation, visible focus, associated form labels, and clear loading, error, and disabled states. Provide touch targets appropriate to the interface and device. Avoid small mobile input text that causes unwanted zoom.
- Keep body text legible with suitable contrast and line lengths. Use the project's typography and color tokens. Truncated content should remain available through an accessible mechanism.
- Reserve media dimensions with intrinsic sizes or aspect ratios to avoid layout shifts. Choose `object-fit` according to whether cropping is appropriate. Use approved assets with meaningful alternatives; do not invent URLs or product imagery.
- Match visual emphasis to the content. Avoid decorative containers, repeated cards, gradients, badges, or icons that make the requested design harder to scan. The user's chosen aesthetic takes precedence over generic style preferences.
- Keep UI copy factual and natural. Reuse established terminology. Use `avoid-ai-writing` when a writing audit or rewrite is actually requested or needed, while preserving attribution, protected content, and product claims.

## Browser verification

For meaningful layout or interaction changes, use the bundled Playwright runner through inline Node execution. Create no scratch `.js` files for these audits and do not delegate browser verification to subagents. A host browser tool can be used when the user requests it or the Playwright workflow is unavailable; report that substitution. A preview viewer alone does not establish runtime correctness.

Check 375, 768, and 1280 CSS pixels, plus project-specific widths when needed. Capture page exceptions and console errors and detect accidental horizontal overflow. Resolve the actual target URL through `helpers.resolveTargetUrl()` using the project configuration, running server, or an explicit user-provided URL. Do not guess a port.

From the project root, use this canonical inline layout audit. It saves screenshots in `scratch/`, audits all three widths, reports failures, and closes Chromium:

```text
node .codex/skills/playwright-skill/run.js -e "const fs = require('node:fs'); const url = await helpers.resolveTargetUrl(); if (!url) throw new Error('Start the target server or specify its URL'); fs.mkdirSync('scratch', { recursive: true }); const browser = await chromium.launch({ headless: true }); const errors = []; const overflowWidths = []; try { const page = await browser.newPage(); page.on('pageerror', error => errors.push(error.message)); page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); }); for (const width of [375, 768, 1280]) { await page.setViewportSize({ width, height: 900 }); await page.goto(url); await page.evaluate(() => document.fonts.ready); const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth); if (overflow) overflowWidths.push(width); await page.screenshot({ path: 'scratch/ui-' + width + '.png', fullPage: true }); console.log(JSON.stringify({ width, overflow })); } if (overflowWidths.length || errors.length) throw new Error(JSON.stringify({ overflowWidths, errors })); } finally { await browser.close(); }"
```

Keep `scratch/` git-ignored and add the requested flow's meaningful interaction checks to the inline audit. Preserve existing project tests. Do not require browser checks for every unrelated or trivial edit, or claim that this layout audit validates the complete UI. Report missing tooling, servers, and unresolved errors accurately.
