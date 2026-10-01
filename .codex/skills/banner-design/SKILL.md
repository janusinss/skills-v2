---
name: "banner-design"
description: "Design and export social, advertising, or website banners at requested sizes using brand assets and available image tools."
license: "MIT"
metadata:
  author: "claudekit"
  upstream-version: "1.0.0"
---

# Banner design

Create banner assets for the user's purpose, platform, dimensions, and brand. Reuse supplied copy, logos, and approved images. Ask only for missing details that affect the result; do not impose a fixed number of variants.

Use [references/banner-sizes-and-styles.md](references/banner-sizes-and-styles.md) for format and style guidance. Resolve dimensions from the user's requirements and current platform specifications when necessary. Keep essential text and logos within the relevant safe area. Use a clear hierarchy, legible contrast, and a focused call to action where requested.

Use `ui-ux-pro-max` or `frontend-design` when their installed guidance helps with composition. Choose images from the user's assets or an available authorized source. For requested generated imagery, use the host's available image-generation capability and its applicable skill. Missing `ai-artist`, `ai-multimodal`, or `chrome-devtools` skills do not block this workflow; do not reference their nonexistent scripts or assume a Gemini image model is configured.

Create the composition with the available image tools or HTML/CSS at the requested dimensions. For an HTML composition, export using an available browser tool or `playwright-skill`: set the viewport to the requested width and height, load the actual served banner, wait for fonts and images, then capture the intended element or viewport. Verify output dimensions and visual clipping. Use installed image utilities for compression if required.

Place deliverables in the user's requested directory, or a suitable project asset directory when none was specified. Show the finished files and mention any unavailable inputs or unverified requirements. Preserve the source license and bundled references; upstream Gemini-specific examples in supporting material describe optional external integrations.
