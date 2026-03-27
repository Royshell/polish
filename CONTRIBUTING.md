# Contributing to Polish✦

Polish is a Chrome extension that lets users restyle any webpage — via toggles, fine-tune controls, AI prompts, or saved presets.
The extension is built with **Vue 3 + Pinia + TypeScript + Vite**, and uses **pnpm** as the package manager.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Submitting Pull Requests](#submitting-pull-requests)
- [Branch Naming Convention](#branch-naming-convention)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Code Style](#code-style)
- [Testing (Manual)](#testing-manual)
- [Notes on the Chrome Extension Architecture](#notes-on-the-chrome-extension-architecture)
- [License](#license)

---

## Architecture Overview

Polish is a **Manifest V3 Chrome Extension** with three distinct execution contexts:

| Context                       | File                           | Responsibility                                     |
| ----------------------------- | ------------------------------ | -------------------------------------------------- |
| **Side Panel**                | `src/main.ts` → `App.vue`      | Vue 3 UI — all user interaction                    |
| **Background Service Worker** | `src/background/background.ts` | CSS injection via `chrome.scripting`, AI API calls |
| **Content Script**            | `src/content/contentScript.ts` | Listens for `APPLY_CSS` messages inside the page   |

The side panel **cannot** call `chrome.scripting` or make cross-origin requests directly — all privileged operations go through the background via `chrome.runtime.sendMessage`. Keep this boundary in mind when adding new features.

State is managed in a single **Pinia store** (`src/stores/polishStore.ts`), which persists per-site state and user presets using `chrome.storage.local`.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) — install with `npm i -g pnpm` if needed
- Google Chrome (or any Chromium-based browser)

### Setup

1. **Fork** the repository on GitHub.
2. **Clone** your fork:
   ```bash
   git clone https://github.com/your-username/polish.git
   cd polish
   ```
3. **Add the upstream remote:**
   ```bash
   git remote add upstream https://github.com/original-org/polish.git
   ```
4. **Install dependencies:**
   ```bash
   pnpm install
   ```

---

## Development Workflow

```bash
# Start the Vite dev server (hot-reload for the side panel UI)
pnpm dev

# Type-check + build the extension into /dist
pnpm build

# Lint all .ts and .vue files
pnpm lint

# Preview the last production build
pnpm preview
```

### Loading the extension in Chrome

1. Run `pnpm build` to generate the `/dist` folder.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select the `/dist` folder.
4. After code changes, run `pnpm build` again and click the refresh icon on the extension card.

> For UI-only changes you can iterate with `pnpm dev`, but background / content script changes always require a full `pnpm build` + reload.

---

## Project Structure

```
src/
├── background/
│   └── background.ts        # Service worker — scripting + API proxy
├── content/
│   └── contentScript.ts     # Injected into every page
├── components/
│   ├── common/              # RetroButton, RetroToggle
│   ├── features/            # OneClickPolish, FineTuneCard, PresetsCard,
│   │                        # ThemePresetBar, AiStylePanel, FooterOptions
│   └── layout/              # PanelHeader, SectionCard
├── stores/
│   └── polishStore.ts       # Single Pinia store — all state + actions
├── constants.ts             # Storage keys, API URL, UI constants, system presets
├── App.vue
├── main.ts
└── style.css
```

---

## How to Contribute

### Reporting Bugs

Before opening a bug report:

- Search [existing issues](https://github.com/original-org/polish/issues) to avoid duplicates.
- Make sure you're testing on the latest build.

A useful bug report includes:

- The URL of the page where the issue occurs (if applicable).
- Which feature triggered the bug — toggles, fine-tune, AI, or a specific preset.
- Expected vs. actual behaviour.
- Chrome version + OS.
- Any errors from the extension's background service worker (visible at `chrome://extensions` → Polish → **Service Worker** → **Inspect**).

### Suggesting Features

Open an issue with the `enhancement` label. Describe:

- The problem you're trying to solve.
- How it fits into Polish's model (side panel UI vs. background privilege vs. injected CSS).
- Any tradeoffs or edge cases.

### Submitting Pull Requests

1. **Sync with upstream** before starting:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```
2. **Create a feature branch** (see [Branch Naming Convention](#branch-naming-convention)).
3. Make your changes. For anything touching `polishStore.ts`, review the existing action/helper pattern before adding new state.
4. Run the linter:
   ```bash
   pnpm lint
   ```
5. Run a full build and manually test the change in Chrome (see [Testing (Manual)](#testing-manual)).
6. Commit using [Conventional Commits](#commit-message-guidelines).
7. Push and open a Pull Request against `main`.
8. Fill in the PR template — describe _what_ changed, _why_, and how you tested it.

---

## Branch Naming Convention

| Prefix      | Purpose                                     |
| ----------- | ------------------------------------------- |
| `feat/`     | New feature                                 |
| `fix/`      | Bug fix                                     |
| `docs/`     | Documentation only                          |
| `refactor/` | Code restructuring without behaviour change |
| `chore/`    | Tooling, config, dependency updates         |

**Example:** `feat/ai-style-history`, `fix/focus-mode-cnn-sidebar`

---

## Commit Message Guidelines

Polish follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(optional scope): <short description>
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `style`, `chore`, `perf`

**Examples:**

```
feat(presets): add rename-on-double-click to PresetsCard
fix(background): handle missing active tab gracefully in injectCSS
refactor(store): extract buildFineTuneCSS into a pure util
docs: update CONTRIBUTING with pnpm setup steps
chore: bump vite to 7.2.4
```

---

## Code Style

Linting and formatting are enforced automatically on commit via **Husky** + **lint-staged**. The rules are:

- **ESLint** (TypeScript + Vue recommended configs) for `.ts` and `.vue` files.
- **Prettier** for `.ts`, `.vue`, `.css`, `.json`, and `.md` files.

Run before pushing:

```bash
pnpm lint
```

A few conventions worth knowing:

- Prefer explicit `async/await` over raw `.then()` chains (see existing store actions as reference).
- Chrome message handlers must `return true` when responding asynchronously — don't remove this.
- CSS strings inside `constants.ts` or `polishStore.ts` should be commented with their visual intent (e.g., `/* -- Dark Mode -- */`).
- Keep component files focused — new UI sections belong in `src/components/features/` or `src/components/common/`, not directly in `App.vue`.

---

## Testing (Manual)

There are currently no automated tests. All validation is done manually in Chrome.

**Checklist before opening a PR:**

- [ ] `pnpm build` completes without TypeScript errors.
- [ ] `pnpm lint` passes with no errors.
- [ ] The side panel opens correctly via the toolbar icon.
- [ ] The changed feature works on at least two different sites (e.g., a news site and a documentation site).
- [ ] **One-Click Polish** toggles (Dark Mode, Focus Mode, etc.) apply and revert cleanly.
- [ ] **AI style generation** returns CSS and injects it without console errors.
- [ ] **Presets** can be saved, applied, renamed, and deleted.
- [ ] **Auto-apply** re-injects CSS on tab reload when enabled.
- [ ] No unhandled errors appear in the background service worker console (`chrome://extensions` → Polish → Inspect service worker).

---

## Notes on the Chrome Extension Architecture

A few things that catch contributors off-guard:

**Side panel <-> background messaging** — The side panel calls `chrome.runtime.sendMessage` for anything that needs `chrome.scripting` or a cross-origin fetch. If you add a new privileged operation, add a handler in the `chrome.runtime.onMessage` listener in `background.ts`, not in a Vue component.

**Service worker lifecycle** — MV3 service workers can be suspended at any time. Don't store state in module-level variables inside `background.ts`; use `chrome.storage` instead. The Pinia store (which runs in the side panel context) is the right place for reactive UI state.

**`return true` in message listeners** — If a `chrome.runtime.onMessage` handler calls `sendResponse` asynchronously, it **must** return `true` to keep the message channel open. Removing this silently breaks the response.

**CSS injection vs. content script** — Most CSS injection goes through `background.ts` via `chrome.scripting.executeScript`. The content script (`contentScript.ts`) is a secondary listener kept for lightweight direct-message use cases.

**Google Fonts in AI-generated CSS** — `background.ts` extracts `@import url(...)` font links from AI-generated CSS and injects them as separate `<link>` tags, since `@import` inside a dynamically injected `<style>` tag is ignored by some browsers.

---

## License

By contributing to Polish, you agree that your contributions will be licensed under the project's [LICENSE](LICENSE) file.

---

Thanks for helping make the web look better ✨
