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
      link.id = fontLinkId;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
  } else {
    document.getElementById(fontLinkId)?.remove();
  }
}

/**
 * Inject Google Font <link> tags extracted from CSS @import statements.
 * Removes any previously injected AI font links first, then injects fresh ones.
 * Called with the raw CSS string — font URLs are parsed here in the page context.
 */
function manageGoogleFontLinks(fontUrls: string[]) {
  // Remove all previously injected AI font links
  document.querySelectorAll('[data-polish-ai-font]').forEach((element) => element.remove());

  if (!fontUrls.length) {
    return;
  }

  // Ensure preconnect hints exist (idempotent)
  if (!document.querySelector('link[href="https://fonts.googleapis.com"][rel="preconnect"]')) {
    const preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect1);
  }
  if (!document.querySelector('link[href="https://fonts.gstatic.com"][rel="preconnect"]')) {
    const preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect2);
  }

  // Inject one <link rel="stylesheet"> per font URL
  fontUrls.forEach((href, index) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.polishAiFont = String(index);
    document.head.appendChild(link);
  });
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

/**
 * Extract all Google Fonts URLs from @import statements in a CSS string.
 * This runs in the background service worker (not the page), so we can use
 * any JS we like here — no serialisation concerns.
 */
function extractGoogleFontUrls(css: string): string[] {
  const urls: string[] = [];
  const importRe =
    /@import\s+url\(\s*['"]?(https:\/\/fonts\.googleapis\.com\/[^'"\s)]+)['"]?\s*\)\s*;?/gm;
  let match = importRe.exec(css);
  while (match !== null) {
    if (match[1]) {
      urls.push(match[1]);
    }
    match = importRe.exec(css);
  }
  return urls;
}

async function injectCSS(css: string, injectFontLink: boolean): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab?.id) {
    throw new Error('No active tab found');
  }

  const tabId = tab.id;

  // Extract Google Font URLs from the CSS @import statements before injecting
  const googleFontUrls = extractGoogleFontUrls(css);

  await chrome.scripting.executeScript({
    target: { tabId },
    func: manageFontLink,
    args: [injectFontLink, FONT_LINK_ID],
  });

  // Inject <link> tags for any Google Fonts found in the CSS
  await chrome.scripting.executeScript({
    target: { tabId },
    func: manageGoogleFontLinks,
    args: [googleFontUrls],
  });

  await chrome.scripting.executeScript({
    target: { tabId },
    func: applyStyleToPage,
    args: [css, STYLE_ELEMENT_ID],
  });
}

// ── Polish API proxy ───────────────────────────────────────────────────────
async function generateCSSFromPrompt(prompt: string): Promise<string> {
  const response = await fetch(POLISH_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 429) {
      throw new Error('Rate limit — try again in a moment');
    }
    throw new Error(err?.error ?? `API error ${response.status}`);
  }

  const data = await response.json();
  return data.css ?? '';
}

// ── Message router ─────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'APPLY_CSS') {
    injectCSS(message.css ?? '', message.injectFontLink ?? false)
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true;
  }

  if (message.type === 'GENERATE_CSS') {
    generateCSSFromPrompt(message.prompt)
      .then((css) => sendResponse({ css }))
      .catch((err) => sendResponse({ error: String(err) }));
    return true;
  }
});
