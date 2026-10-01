# Frontend quality guidance

Apply the relevant checks when creating or changing a web interface. Keep the user's design choices and existing conventions.

- Prevent unintended horizontal overflow by fixing container widths, wrapping, and flex/grid minimum sizes. Account for fixed navigation in the layout. Use stable page-height behavior when a sparse page needs a footer at the bottom.
- Preserve semantic controls, keyboard navigation, visible focus, associated form labels, and clear loading, error, and disabled states. Provide touch targets appropriate to the interface and device. Avoid small mobile input text that causes unwanted zoom.
- Keep body text legible with suitable contrast and line lengths. Use the project's typography and color tokens. Truncated content should remain available through an accessible mechanism.
- Reserve media dimensions with intrinsic sizes or aspect ratios to avoid layout shifts. Choose `object-fit` according to whether cropping is appropriate. Use approved assets with meaningful alternatives; do not invent URLs or product imagery.
- Match visual emphasis to the content. Avoid decorative containers, repeated cards, gradients, badges, or icons that make the requested design harder to scan. The user's chosen aesthetic takes precedence over generic style preferences.
- Keep UI copy factual and natural. Reuse established terminology. Use `avoid-ai-writing` when a writing audit or rewrite is actually requested or needed, while preserving attribution, protected content, and product claims.

## Browser verification

For substantial layout or interaction changes, use the available browser capability or the bundled Playwright runner. Test the project's relevant widths; 375, 768, and 1280 CSS pixels are useful defaults when no device requirements are provided. Check meaningful interaction states, unexpected browser errors, and accidental horizontal overflow. Resolve the actual target URL from the project configuration or running server.

From an installed project, the helper runner supports:

```text
node .agents/skills/playwright-skill/run.js -e "const url = await helpers.resolveTargetUrl(); if (!url) throw new Error('Start the target server or specify its URL'); const b = await chromium.launch(); try { const p = await b.newPage(); await p.goto(url); console.log(await p.title()); } finally { await b.close(); }"
```

Inline code is convenient for small checks. Use reusable test files when they improve verification. Save temporary artifacts in `scratch/` or the project's artifact directory. Do not run a browser suite for every small edit or claim that this smoke check validates the complete UI.
