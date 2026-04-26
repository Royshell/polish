# Polish ✦

> Restyle any website — instantly, from your browser sidebar.

![Polish in action](./docs/assets/demo.gif)

---

## Get the extension from Chrome Web Store

**[→ Add Polish to Chrome](https://chromewebstore.google.com/detail/polish%E2%9C%A6/fjejdndlacakdmjnmeabehlnamdlofmn)**

---

## What it does

Polish is a Chrome side panel extension that lets you apply visual styles to any website you're browsing — without touching the site's code.

- **One-Click Polish** — toggle contrast, dark mode, focus mode, readable fonts, and extra spacing
- **Theme Presets** — curated full-page vibes (Miami Vice, Cyber Mode, Night Owl, and more)
- **Fine-Tune** — adjust font size, heading scale, background and text color, and font family
- **Google Fonts** — browse and apply any font from Google Fonts directly to any page
- **AI Style** — describe a look in plain text and get a custom CSS style generated instantly
- **My Presets** — save any style you like and re-apply it on any site

---

## Architecture

The extension communicates with a lightweight API proxy that handles AI style generation. The Groq API key is kept server-side — it never touches the extension bundle.

**API endpoint:** `POST https://polish-api-alpha.vercel.app/api/generate`

```json
// Request
{ "prompt": "dark mode with purple accents" }

// Response
{ "css": "/* generated CSS */" }
```

**API source:** [github.com/Royshell/polish-api](https://github.com/Royshell/polish-api)

---

## Install locally

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)

### Build

```bash
git clone https://github.com/Royshell/polish.git
pnpm install
pnpm build
```

This generates a production-ready `dist/` folder.

### Load in Chrome

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `extension/dist/` folder
5. Click the extensions icon in the toolbar and pin **Polish**
6. Navigate to any website and click the Polish icon to open the side panel

### Development mode (with hot reload)

```bash
pnpm dev
```

Then load the `dist/` folder as above — Vite will rebuild on changes.

---

## Status

Polish is live on the Chrome Web Store. This is an early release — the core experience works but expect rough edges. Planned improvements include:

- Per-site style memory improvements
- More system presets
- Shareable preset links

---

## Tech stack

- Vue 3 + TypeScript + Vite
- Tailwind CSS v4
- Pinia
- Chrome Extension Manifest v3
- Google Fonts API
- Groq API (via [polish-api](https://github.com/Royshell/polish-api) proxy)
