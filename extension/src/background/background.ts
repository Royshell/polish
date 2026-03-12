// ── Polish Extension — Background Service Worker ───────────────────────────
//
// All privileged operations run here:
//   • APPLY_CSS    — inject/remove <style> + optional <link> into the active tab
//   • GENERATE_CSS — call Polish API proxy, return clean CSS to the side panel
//
// Why here and not in the side panel?
//   Chrome MV3 side panels cannot use chrome.scripting or make cross-origin
//   fetch calls without CORS issues. The service worker has both scripting
//   permissions and unrestricted fetch access.

import { POLISH_API_URL, STYLE_ELEMENT_ID, FONT_LINK_ID } from '../constants';

// ── Panel behaviour ────────────────────────────────────────────────────────
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((err) => console.error('[Polish] sidePanel:', err));

// ── Helpers injected into the page via executeScript ──────────────────────
// These functions run INSIDE the target tab's page context, not here.

/** Inject or remove the Inter font <link> tag. */
function manageFontLink(inject: boolean, fontLinkId: string) {
  if (inject) {
    if (!document.getElementById(fontLinkId)) {
      const link = document.createElement('link');
      link.id   = fontLinkId;
      link.rel  = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
  } else {
    document.getElementById(fontLinkId)?.remove();
  }
}

/** Inject, update, or remove the main <style> tag. */
function applyStyleToPage(css: string, styleId: string) {
  let el = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!css) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('style');
    el.id = styleId;
    document.head.appendChild(el);
  }
  el.textContent = css;
}

// ── CSS injection ──────────────────────────────────────────────────────────
async function injectCSS(css: string, injectFontLink: boolean): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab?.id) throw new Error('No active tab found');

  const tabId = tab.id;

  await chrome.scripting.executeScript({
    target: { tabId },
    func:   manageFontLink,
    args:   [injectFontLink, FONT_LINK_ID],
  });

  await chrome.scripting.executeScript({
    target: { tabId },
    func:   applyStyleToPage,
    args:   [css, STYLE_ELEMENT_ID],
  });
}

// ── Polish API proxy ───────────────────────────────────────────────────────
async function generateCSSFromPrompt(prompt: string): Promise<string> {
  const response = await fetch(POLISH_API_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 429) throw new Error('Rate limit — try again in a moment');
    throw new Error(err?.error ?? `API error ${response.status}`);
  }

  const data = await response.json();
  return data.css ?? '';
}

// ── Message router ─────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {

  if (message.type === 'APPLY_CSS') {
    injectCSS(message.css ?? '', message.injectFontLink ?? false)
      .then(()    => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true;
  }

  if (message.type === 'GENERATE_CSS') {
    generateCSSFromPrompt(message.prompt)
      .then((css)  => sendResponse({ css }))
      .catch((err) => sendResponse({ error: String(err) }));
    return true;
  }
});
