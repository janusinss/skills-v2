---
name: chrome-extensions
description: "Build, debug, and publish Manifest V3 Chrome Extensions: service workers, side panels, content scripts, declarativeNetRequest, offscreen documents, CSP sandboxes, userScripts, and Chrome Web Store listings. Use when creating or updating browser extensions or CHROMEWEBSTORE.md."
license: Apache-2.0
---

# Chrome Extensions

Build production-quality Chrome extensions using Manifest V3 and publish them to the Chrome Web Store.

## Part 1 — Building Extensions

### Mandatory Rules

These address the most common causes of broken extensions. Violating any produces a non-functional build.

#### 1. Icons: only reference files you create — or omit icons entirely

```
❌ BROKEN — missing files or reusing one file for all sizes:
   "icons": { "16": "icon.png", "48": "icon.png", "128": "icon.png" }
✅ CORRECT — separate file per size (16×16px, 48×48px, 128×128px):
   "icons": { "16": "icons/icon-16.png", "48": "icons/icon-48.png", "128": "icons/icon-128.png" }
✅ ALSO CORRECT — omit "icons" and "default_icon" if you cannot generate real PNGs (Chrome uses a default icon)
```

**If you include icon references, you MUST create the actual image files.** Generate them with a script (see `references/extensions/icons.md`) or leave them out. Never reference non-existent files.

#### 2. Side panel: you MUST provide a way to open it

Defining `"side_panel": {"default_path": "..."}` does NOT make it openable. Add a trigger:

```js
// In service-worker.js — action.onClicked ONLY fires when there is NO default_popup
chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ windowId: tab.windowId });
});
```

If the extension has both a popup AND side panel, add a button in the popup that calls `chrome.sidePanel.open()`. Alternatively, use `chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })` — but the property is `openPanelOnActionClick`, NOT `openPanelOnActionIconClick`; the "Icon" variant causes a synchronous TypeError that silently aborts the service worker. Do NOT also define `default_popup` when using `setPanelBehavior`. See `references/extensions/side-panel.md`.

#### 3. Code execution: sandboxed iframes ONLY

Extension CSP blocks `eval()`, `new Function()`, inline `<script>` in all extension pages.

```js
// ❌ BROKEN — direct iframe DOM access throws SecurityError; eval() blocked by CSP
iframe.contentDocument.write(html);
eval(userCode);
// ✅ OPTION A: Sandbox in manifest + postMessage ("sandbox": { "pages": ["sandbox.html"] })
iframe.contentWindow.postMessage({ html, css, js }, '*');
window.addEventListener('message', (e) => { eval(e.data.js); }); // inside sandbox.html
// ✅ OPTION B: Blob URL (separate origin, bypasses extension CSP)
iframe.src = URL.createObjectURL(new Blob([doc], { type: 'text/html' }));
// ✅ OPTION C: srcdoc
iframe.srcdoc = `<style>${css}</style>${html}<script>${js}<\/script>`;
```

See `references/extensions/csp-sandbox.md` for full details.

#### 4. `tab.url` requires the `tabs` permission

Without it, `tab.url` silently returns `undefined` — no error thrown. See `references/extensions/permissions.md`.

#### 5. Always use async/await — never `.then()` chains

```js
// ❌ BAD
chrome.tabs.query({active: true, currentWindow: true}).then(tabs => {
  chrome.scripting.executeScript({target: {tabId: tabs[0].id}, files: ['content.js']}).then(() => {});
});
// ✅ GOOD
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
```

For `runtime.onMessage` listeners that do async work:

```js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    const data = await chrome.storage.local.get('key');
    sendResponse({ data });
  })();
  return true; // keeps channel open
});
```

#### 6. Content scripts: don't block the main thread

When modifying many DOM elements, batch with `requestAnimationFrame` and yield between batches:

```js
async function highlightAll(elements) {
  const BATCH = 20;
  for (let i = 0; i < elements.length; i += BATCH) {
    await new Promise(r => requestAnimationFrame(() => {
      elements.slice(i, i + BATCH).forEach(el => el.style.backgroundColor = 'yellow');
      r();
    }));
    if (globalThis.scheduler?.yield) await scheduler.yield();
  }
}
```

See `references/extensions/content-scripts.md`.

#### 7. Service workers are ephemeral — never store state in variables

```js
// ❌ BROKEN — state lost when SW terminates (~30s of inactivity)
let count = 0;
chrome.tabs.onUpdated.addListener(() => { count++; });
// ✅ CORRECT — persist in chrome.storage, read on every event
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status !== 'complete') return;
  const { count = 0 } = await chrome.storage.local.get('count');
  await chrome.storage.local.set({ count: count + 1 });
  await chrome.action.setBadgeText({ text: String(count + 1) });
});
```

Use `chrome.alarms` instead of `setTimeout`/`setInterval`. See `references/extensions/service-worker.md`.

#### 8. chrome.identity: extension ID differs between dev and production

When using Google sign-in, the OAuth client_id is tied to a specific extension ID, which changes between unpacked development and the Chrome Web Store. To stabilize the ID in dev, add `"key"` to `manifest.json`: 1) Pack once (`chrome://extensions` → Pack), 2) Extract the public key from `.crx`, 3) Add `"key": "MIIBIjANBgkqh..."` to `manifest.json`. Always document: "After publishing to the Chrome Web Store, update the OAuth client with the store-assigned extension ID." See `references/extensions/auth-identity.md`.

#### 9. Context menus: show user feedback after action

When a context menu item performs an action (save, copy, etc.), confirm it to the user. Use a notification, badge flash, or injected toast — don't let actions happen silently. See `references/extensions/context-menus.md` for a complete toast implementation.

#### 10. Prompt API: available in service workers, popup, and side panel

The `LanguageModel` API works in all extension contexts — service worker, popup, and side panel — with no additional manifest permissions required. Extensions also get `LanguageModel.params()`, which is unavailable on the web:

```js
const params = await LanguageModel.params();
// { defaultTopK: 3, maxTopK: 128, defaultTemperature: 1, maxTemperature: 2 }
```

For general Prompt API patterns (availability checks, session creation, streaming), use the `modern-web-guidance` skill. See `references/extensions/prompt-api.md` for the extension-specific wiring example.

#### 11. `chrome.action` API requires `action` in manifest

Using `chrome.action.setBadgeText`, `chrome.action.setIcon`, or `chrome.action.onClicked` requires an `"action"` key in `manifest.json` — even if empty. Without it, `chrome.action` is `undefined`.

```js
// ❌ BROKEN — manifest has no "action" key (TypeError: Cannot read properties of undefined)
await chrome.action.setBadgeText({ text: '5' });
// ✅ FIX — add "action" to manifest.json (minimum empty object, or with default_popup)
{ "action": {} } // or { "action": { "default_popup": "popup/popup.html" } }
```

#### 12. `activeTab` only works on direct user gestures — not from side panels

`activeTab` grants temporary access to the current tab ONLY on a direct user gesture (action icon click, context menu item, keyboard shortcut, omnibox suggestion) — NOT from a button click inside a side panel or popup. Use `tabs` + `host_permissions` instead. See `references/extensions/permissions.md` and `references/extensions/side-panel.md`.

#### 13. DevTools panel URLs are relative to the extension root

When creating a DevTools panel, the panel HTML path is relative to the **extension root**, NOT relative to the devtools page calling `chrome.devtools.panels.create()`.

```js
// ❌ BROKEN — path relative to devtools/ directory
chrome.devtools.panels.create("My Panel", "", "panel/panel.html");
// ✅ CORRECT — full path from extension root
chrome.devtools.panels.create("My Panel", "", "devtools/panel/panel.html");
```

See `references/extensions/devtools.md`.

#### 14. Offscreen documents have NO access to most chrome.* APIs

Offscreen documents (`chrome.offscreen`) are **severely restricted**. Most `chrome.*` APIs are unavailable, including `chrome.downloads`, `chrome.tabs`, and `chrome.action`.

```js
// ❌ BROKEN — chrome.downloads & chrome.action are undefined in offscreen documents (TypeError)
chrome.downloads.download({ url, filename: 'recording.webm' });
chrome.action.setBadgeText({ text: 'REC' });
```

**Available in offscreen documents:** `chrome.runtime.sendMessage` / `chrome.runtime.onMessage`, `chrome.runtime.getURL`, and standard Web APIs (DOM, fetch, MediaRecorder, Canvas, Web Audio, etc.).

**Rule of thumb:** Offscreen documents do Web API work (recording, parsing, audio); the service worker does all `chrome.*` API work (downloads, badge updates, notifications) via `chrome.runtime.sendMessage`. See `references/extensions/message-passing.md`.

#### 15. Notifications and badge icons must reference real image files

`chrome.notifications.create()` requires a valid `iconUrl` pointing to an actual image file, or it fails with `"Unable to download all specified images."`

```js
// ❌ BROKEN — icon file doesn't exist
chrome.notifications.create('reminder', { type: 'basic', iconUrl: 'icons/icon-128.png', title: 'Reminder', message: 'Time is up!' });
// ✅ Generate a data URL at runtime via OffscreenCanvas (see `references/extensions/icons.md`)
const iconUrl = await getIconDataUrl();
chrome.notifications.create('reminder', { type: 'basic', iconUrl, title: 'Reminder', message: 'Time is up!' });
```

This applies to ALL image references in `chrome.*` APIs (notifications, `chrome.action.setIcon`, context menu icons). **If you reference a file, it must exist.**

#### 16. Tab capture: guard against double-start with state locking

`chrome.tabCapture.getMediaStreamId()` fails with `"Cannot capture a tab with an active stream"` if called while a previous capture is active (e.g., rapid double-clicks). Use explicit state locking in `chrome.storage.session`:

```js
// ❌ BROKEN — no guard against rapid clicks
let isRecording = false;
chrome.action.onClicked.addListener(async (tab) => {
  if (isRecording) { stopRecording(); isRecording = false; }
  else { isRecording = true; startRecording(tab); } // Second click = "active stream" error
});
// ✅ CORRECT — transitional states ('idle' → 'starting' → 'recording' → 'stopping' → 'idle') in chrome.storage.session
chrome.action.onClicked.addListener(async (tab) => {
  const { recordingState = 'idle' } = await chrome.storage.session.get('recordingState');
  if (recordingState === 'starting' || recordingState === 'stopping') return;
  if (recordingState === 'idle') {
    await chrome.storage.session.set({ recordingState: 'starting' });
    try {
      await startRecording(tab);
      await chrome.storage.session.set({ recordingState: 'recording' });
      await chrome.action.setBadgeText({ text: 'REC' });
      await chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
    } catch (err) {
      console.error('Failed to start recording:', err);
      await chrome.storage.session.set({ recordingState: 'idle' });
    }
  } else if (recordingState === 'recording') {
    await chrome.storage.session.set({ recordingState: 'stopping' });
    try { await stopRecording(); } finally {
      await chrome.storage.session.set({ recordingState: 'idle' });
      await chrome.action.setBadgeText({ text: '' });
    }
  }
});
```

Applies to any exclusive chrome API (`chrome.tabCapture`, `chrome.desktopCapture`, `chrome.offscreen.createDocument`). See `references/extensions/media-capture.md`.

#### 17. `chrome.desktopCapture` requires a target tab with URL access

When calling `chrome.desktopCapture.chooseDesktopMedia()` from a service worker, pass the active tab as `targetTab` with its `url` field populated (requires `"tabs"` permission).

```js
// ❌ BROKEN — missing targetTab ("A target tab is required...") or missing "tabs" permission ("targetTab doesn't have URL field set.")
chrome.desktopCapture.chooseDesktopMedia(['screen', 'window'], (streamId) => { ... });
// ✅ CORRECT — "tabs" permission in manifest + pass tab object
// manifest.json: { "permissions": ["tabs", "desktopCapture"] }
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
chrome.desktopCapture.chooseDesktopMedia(['screen', 'window'], tab, (streamId) => { if (!streamId) return; });
```

**Note:** Prefer `chrome.tabCapture.getMediaStreamId()` for tab-only recording; use `chrome.desktopCapture` when the user chooses a screen/window. See `references/extensions/media-capture.md`.

#### 18. User scripts: four non-obvious pitfalls

`chrome.userScripts` runs **user-provided code** at runtime (for script managers and user automation, not extension-bundled scripts):

- **API throws on property access if not enabled.** Chrome 138+ requires the user to toggle "Allow User Scripts" on the extension's details page; Chrome < 138 requires Developer mode. Always call `isUserScriptsAvailable()` before any `chrome.userScripts.*` call and show an error UI when it returns false.
- **Registered scripts are cleared on extension update.** Persist configs in `chrome.storage`; re-register them in `runtime.onInstalled` for the `"update"` reason.
- **Messaging requires explicit opt-in.** Call `configureWorld({ messaging: true })` first; listen on `runtime.onUserScriptMessage`, not `runtime.onMessage`.
- **`ScriptSource` constraint:** each `js` entry must have exactly one of `code` or `file`. **`id` constraint:** cannot start with `_`.

See `references/extensions/user-scripts.md`.

#### 19. `chrome.windows` has NO `.query()` method — use `getAll`, `getLastFocused`, or `getCurrent`

Unlike `chrome.tabs.query()`, the `chrome.windows` API does NOT have a `.query()` method.

```js
// ❌ BROKEN — TypeError: chrome.windows.query is not a function
const windows = await chrome.windows.query({ focused: true });
// ✅ CORRECT — use getLastFocused, getCurrent, or getAll
const focused = await chrome.windows.getLastFocused({ populate: true });
const current = await chrome.windows.getCurrent({ populate: true });
const all     = await chrome.windows.getAll({ populate: true });
```

**`chrome.windows` methods:** `getAll`, `getLastFocused`, `getCurrent`, `get(windowId)`, `create`, `update`, `remove`. See `references/extensions/tab-management.md`.

#### 20. `chrome.permissions.request()` in the service worker must be called with no `await` before it in the message listener

A user gesture from a UI context (side panel, popup) propagates across `chrome.runtime.sendMessage` to the service worker's `onMessage` listener only for that synchronous turn. If the listener awaits anything before calling `chrome.permissions.request()`, the gesture is lost and it throws `"This function must be called during a user gesture"`. Call it first in the listener with no `await` before it — see `references/extensions/permissions.md`.

### Always Manifest V3

Never generate Manifest V2 code.
- `background.service_worker` not `background.scripts`
- `chrome.action` not `chrome.browserAction`
- `chrome.scripting.executeScript` not `chrome.tabs.executeScript`
- `host_permissions` is separate from `permissions`
- No inline scripts in HTML — use `<script src="file.js">`
- No inline event handlers — use `addEventListener`

---

## Part 2 — Publishing to the Chrome Web Store

Manage `CHROMEWEBSTORE.md` — the single source of truth for all Chrome Web Store listing metadata, permissions justifications, privacy disclosures, version history, and publishing readiness for a Chrome extension project.

### Core Workflow

Every time you touch a Chrome extension project in a way that affects its store presence, update (or create) `CHROMEWEBSTORE.md` in the project root so the developer can copy-paste everything for the Chrome Developer Dashboard from one doc.

#### When to create CHROMEWEBSTORE.md

Create it when the user wants to publish, asks to "prepare for the store" / "get ready to publish", asks about store listing requirements, or you're building a new extension destined for the store. Use `references/webstore/chromewebstore-template.md` as your starting point and read it before generating the file.

#### When to update CHROMEWEBSTORE.md

Update it whenever:
- **User-facing changes**: Bump "Last Updated", update the feature list in descriptions, and add a Version History entry
- **manifest.json changes**: Update Permissions Justification if `permissions`, `host_permissions`, or `content_scripts` changed — every permission needs a plain-English reason
- **New release**: Add a Version History entry with version number, date, and summary
- **Privacy-relevant changes**: Update Privacy & Data Use and the privacy policy if data collection, storage, or transmission changed
- **Asset changes**: Note which screenshots need refreshing if icons or UI changed
- **Rejection response**: Update with the fix and add a Version History note on CWS rejection

### How to fill it out

Pull information from the actual project files:
1. Read `manifest.json` to extract name, version, description, permissions, host_permissions
2. Scan the codebase for data collection (storage, fetch calls, analytics)
3. Check for icon files and their dimensions
4. Look at the extension's UI to understand features for the description

Write specific, honest, benefit-oriented store copy (the CWS review team rejects vague copy like "Makes your life easier", whereas "Highlights search results on any webpage and lets you save highlights to a local list" passes). **Never mention implementation details.** Strip APIs, libraries, frameworks, or code patterns:

| ❌ Implementation detail (cut it) | ✅ User benefit (keep it) |
|-----------------------------------|--------------------------|
| "Uses a MutationObserver to detect page changes" | "Automatically detects new content as you browse" |
| "Built with custom elements and Shadow DOM" | "Works seamlessly without affecting page styles" |
| "Powered by a service worker for background processing" | "Runs quietly in the background without slowing your browser" |
| "Leverages the chrome.storage.sync API" | "Your settings sync across all your devices" |
| "Implements declarativeNetRequest for filtering" | "Blocks ads and trackers without reading your page content" |

### CHROMEWEBSTORE.md Sections

Read `references/webstore/chromewebstore-template.md` before generating the file. The highest-risk section is Permissions Justification: write a specific plain-English reason per permission and `host_permission` ("Needed for the extension to work" will be rejected). Read `references/webstore/privacy-policy.md` for privacy policy guidance.

### Pre-Publish Checklist

Before submission, run through `references/webstore/review-checklist.md`. Common first-submission failures:
- Every permission and host_permission must have a specific justification (not "needed to work")
- Privacy policy URL must be live and match the data use disclosure form
- At least 1 screenshot at 1280×800 or 640×400
- ZIP must exclude `.git/`, `node_modules/`, `.env`, `CHROMEWEBSTORE.md`

### Store Listing Copy Guidelines

See `references/webstore/store-listing.md` for copy guidelines and common rejections. Key rule: lead with function ("Highlights search terms on any webpage"), not feeling ("Enjoy searching again").

---

## Reference Files

For detailed API patterns and publishing guidance, read the relevant file BEFORE writing code or content:

| Topic | Reference |
|-------|-----------|
| Permissions | `references/extensions/permissions.md` |
| Side panels | `references/extensions/side-panel.md` |
| Content scripts & DOM | `references/extensions/content-scripts.md` |
| Popups | `references/extensions/popup-ui.md` |
| Service worker lifetime | `references/extensions/service-worker.md` |
| Code execution & CSP | `references/extensions/csp-sandbox.md` |
| API calls | `references/extensions/api-calling.md` |
| Declarative Net Request | `references/extensions/declarative-net-request.md` |
| Chrome Prompt API | `references/extensions/prompt-api.md` |
| DevTools panels | `references/extensions/devtools.md` |
| Authentication | `references/extensions/auth-identity.md` |
| Context menus | `references/extensions/context-menus.md` |
| Omnibox | `references/extensions/omnibox.md` |
| Storage | `references/extensions/storage.md` |
| Tab & window management | `references/extensions/tab-management.md` |
| Tab/desktop capture | `references/extensions/media-capture.md` |
| User scripts | `references/extensions/user-scripts.md` |
| Message passing | `references/extensions/message-passing.md` |
| Icons | `references/extensions/icons.md` |
| CHROMEWEBSTORE.md template | `references/webstore/chromewebstore-template.md` |
| Privacy policy guidance | `references/webstore/privacy-policy.md` |
| Pre-publish review checklist | `references/webstore/review-checklist.md` |
| Store listing tips & rejections | `references/webstore/store-listing.md` |

## Output Checklist

Verify EVERY item before delivering:

- [ ] `manifest_version: 3` — no V2 APIs anywhere
- [ ] All icon files referenced in manifest exist as real files with correct dimensions — or icons are omitted
- [ ] Side panel has an explicit open trigger (not just a manifest declaration)
- [ ] Code execution uses sandbox/blob/srcdoc — no `eval()` in extension pages
- [ ] `tabs` permission declared if `tab.url` or `tab.title` is accessed
- [ ] All code uses `async`/`await` — no `.then()` chains
- [ ] Content scripts batch DOM updates with `requestAnimationFrame`
- [ ] Service worker stores NO state in global variables — uses `chrome.storage`
- [ ] No inline scripts or event handlers in HTML
- [ ] Context menu actions show user confirmation
- [ ] `"action": {}` (or more) present in manifest if using `chrome.action.*` APIs
- [ ] If reading/scripting tabs from a side panel: use `tabs` + `host_permissions` (NOT `activeTab`)
- [ ] DevTools panel paths in `chrome.devtools.panels.create()` are relative to extension root
- [ ] Offscreen documents use ONLY `chrome.runtime` messaging — no `chrome.downloads`, `chrome.action`, etc.
- [ ] All image refs in `chrome.notifications`, `chrome.action.setIcon`, etc. point to real files (or use data URLs)
- [ ] Tab/desktop capture uses state locking to prevent double-start errors
- [ ] `chrome.desktopCapture.chooseDesktopMedia` passes `targetTab` with `tabs` permission
- [ ] `chrome.windows` calls use `getAll`/`getLastFocused`/`getCurrent` — NOT `.query()` (it doesn't exist)
- [ ] `chrome.permissions.request()` in a service worker `onMessage` listener is called with no `await` before it (gesture is lost after the first async gap)
- [ ] `chrome.userScripts` availability checked before use (API throws if user hasn't enabled it)
- [ ] User script configs persisted in `chrome.storage` and restored on `runtime.onInstalled` `"update"` reason
- [ ] `configureWorld({ messaging: true })` called before user scripts send messages; listening on `onUserScriptMessage` not `onMessage`
- [ ] `ScriptSource` entries each have exactly one of `code` or `file` (not both, not neither)
- [ ] User script `id` values do not start with underscore
- [ ] `sidePanel.setPanelBehavior` uses `openPanelOnActionClick` — NOT `openPanelOnActionIconClick`
- [ ] Error handling on all async operations
- [ ] `host_permissions` scoped to specific domains (not `<all_urls>` unless needed)
- [ ] `return true` in `onMessage` listeners with async responses
- [ ] Any use of `"tab"` in `chrome.contextMenus` `contexts` requires Chrome M150+
