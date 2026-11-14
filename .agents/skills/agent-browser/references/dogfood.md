# Dogfood & Exploratory QA Workflow

Systematically explore a web application with `agent-browser`, find issues, and produce a report with full reproduction evidence for every finding.

## Setup

Only the **Target URL** is required. Everything else has sensible defaults unless overridden:

| Parameter | Default | Example override |
|---|---|---|
| **Target URL** | _(required)_ | `vercel.com`, `http://localhost:3000` |
| **Session name** | `agent-browser session id --scope worktree --prefix dogfood` | `--session my-session` |
| **Output directory** | `./scratch/dogfood-output/` | `./dogfood-output/` |
| **Scope** | Full app | `Focus on the billing page` |
| **Authentication** | None | `Sign in to user@example.com` |

Always invoke `agent-browser` directly (never `npx agent-browser`).

## Workflow

1. **Initialize**: Create output directories (`screenshots/`, `videos/`), copy [../templates/dogfood-report-template.md](../templates/dogfood-report-template.md), and open the target URL in an isolated session.
   ```bash
   SESSION="$(agent-browser session id --scope worktree --prefix dogfood)"
   agent-browser --session "$SESSION" open "$TARGET_URL"
   agent-browser --session "$SESSION" wait --load domcontentloaded
   ```
2. **Authenticate** (if needed): Snapshot interactive inputs, fill credentials (or use `agent-browser auth login`), wait for the authenticated URL/text, and save state (`state save`).
3. **Orient**: Capture an initial annotated screenshot (`screenshot --annotate`) and `snapshot -i` to map top-level navigation.
4. **Explore**: Follow [issue-taxonomy.md](issue-taxonomy.md) systematically across sections, forms, edge cases, and responsive widths; check `errors` and `console` at each page.
5. **Document Issues (Repro-First)**:
   - **Interactive issues**: Record video (`record start`) with human-paced steps (`wait 1000` between actions, step screenshots, `screenshot --annotate` on failure, `record stop`).
   - **Static visible-on-load issues**: One annotated screenshot (`screenshot --annotate`), `Repro Video: N/A`.
   - Append each issue immediately as `ISSUE-001`, `ISSUE-002`, etc.
6. **Wrap Up**: Update summary severity counts in the report and run `agent-browser --session "$SESSION" close`.

## References and Templates

- [issue-taxonomy.md](issue-taxonomy.md) — Severity levels, issue categories, and exploration checklist
- [../templates/dogfood-report-template.md](../templates/dogfood-report-template.md) — Structured report template
