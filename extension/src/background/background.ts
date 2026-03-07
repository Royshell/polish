chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(() => {
  console.log('Polish Extension Installed');
});

// ── CSS Injection ──────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'APPLY_CSS') {
    injectCSS(message.css as string, message.injectFontLink as boolean)
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true;
  }
});

async function injectCSS(css: string, injectFontLink: boolean): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab?.id) throw new Error('No active tab found');

  // 1. Inject the font <link> tag (needed because @import doesn't work in textContent)
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: manageFontLink,
    args: [injectFontLink],
  });

  // 2. Inject the CSS rules
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: applyStyleToPage,
    args: [css, 'polish-injected'],
  });
}

// Runs INSIDE the page — manages the Google Fonts <link> tag
function manageFontLink(inject: boolean): void {
  const LINK_ID = 'polish-font-link';
  const existing = document.getElementById(LINK_ID);

  if (!inject) {
    existing?.remove();
    return;
  }

  if (!existing) {
    const link = document.createElement('link');
    link.id = LINK_ID;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }
}

// Runs INSIDE the page — injects/updates/removes the style tag
function applyStyleToPage(css: string, styleId: string): void {
  let el = document.getElementById(styleId) as HTMLStyleElement | null;

  if (!css || css.trim() === '') {
    el?.remove();
    // also remove font link on full revert
    document.getElementById('polish-font-link')?.remove();
    return;
  }

  if (!el) {
    el = document.createElement('style');
    el.id = styleId;
    document.head.appendChild(el);
  }

  el.textContent = css;
}

// ── AI CSS Generation ──────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GENERATE_CSS') {
    generateCSSFromPrompt(message.prompt as string)
      .then((css) => sendResponse({ css }))
      .catch((err) => sendResponse({ error: String(err) }));
    return true;
  }
});

async function generateCSSFromPrompt(userPrompt: string): Promise<string> {
  const { apiKey } = await chrome.storage.local.get('apiKey');
  if (!apiKey) throw new Error('No API key set');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey as string,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `You are an expert CSS designer.
Respond ONLY with valid CSS that can be injected into any webpage via a <style> tag.
Use !important on all rules to ensure they override existing styles.
Target broad selectors: body, div, p, h1-h6, span, a, li, section, article, main.
Output raw CSS only — no markdown, no explanation, no backticks.
Keep output under 120 lines.`,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error((err as { error?: { message?: string } })?.error?.message ?? 'API error');
  }

  const data = await response.json() as { content: { type: string; text: string }[] };
  return data.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .replace(/```(?:css)?/gi, '')
    .trim();
}
