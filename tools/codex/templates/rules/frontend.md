# Frontend implementation

Use this guidance for the requested frontend work. Preserve the existing framework, behavior, content, and approved design unless the user requests a change.

Read the relevant project files and existing `DESIGN.md` or `PRODUCT.md`. For new UI or a substantial redesign, select an installed design skill such as `21st-ui-build`, `frontend-design`, or `impeccable` when its scope fits. Use `21st-ui-explore` when the user requests alternatives and `21st-ui-review` for a review. Clarify only unresolved choices that materially affect implementation.

Prefer the project's existing components and tokens. When the user provides a component or registry link, use its supported CLI, registry, connector, or authorized source files and follow its license. Check external packages before assuming they are installed. Do not bypass access controls or promise that a public preview supplies editable source.

Apply [UI_Always.md](UI_Always.md) to relevant layout, accessibility, media, and interaction behavior. Use real approved content and assets. Choose photography, generated illustrations, icons, or other media according to the user's brief and the available capabilities. Avoid introducing unsupported product claims.

If Impeccable is installed and relevant, its launcher supports a targeted `detect <file-or-dir>` pass. Check availability before running it because first use may download its engine. Fix meaningful findings in a bounded pass; preserve intentional design choices.

Verify substantial layout changes and meaningful interactions in a browser at relevant mobile, tablet, and desktop widths. Check overflow and unexpected console errors. Capture screenshots in `scratch/` when visual evidence helps. Minor copy or style corrections can be checked directly when browser automation would add little confidence. Report which checks ran and any unverified behavior.
