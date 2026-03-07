import { ref, reactive } from 'vue';
import { defineStore } from 'pinia';

export interface PolishToggles {
  moreContrast: boolean;
  darkMode: boolean;
  focusMode: boolean;
  extraSpacing: boolean;
  readable: boolean;
}

export interface UserPreset {
  id: string;
  name: string;
  css: string;
  source: 'toggles' | 'ai';
  createdAt: number;
}

const DEFAULT_TOGGLES: PolishToggles = {
  moreContrast: false,
  darkMode: false,
  focusMode: false,
  extraSpacing: false,
  readable: false,
};

const STORAGE_KEY = 'polish_presets';

export const usePolishStore = defineStore('polish', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const selectedPreset = ref('Cyber Mode');
  const toggles = reactive<PolishToggles>({ ...DEFAULT_TOGGLES });
  const aiPrompt = ref('');
  const autoApply = ref(false);
  const isPolishing = ref(false);
  const isGenerating = ref(false);
  const lastAppliedCSS = ref<string | null>(null);
  const lastAppliedSource = ref<'toggles' | 'ai' | null>(null);
  const presets = ref<UserPreset[]>([]);
  const activePresetId = ref<string | null>(null);

  function init() {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      if (result[STORAGE_KEY]) {
        presets.value = result[STORAGE_KEY] as UserPreset[];
      }
    });
  }

  // ── Core Actions ───────────────────────────────────────────────────────────
  function resetToDefaults() {
    Object.assign(toggles, DEFAULT_TOGGLES);
    selectedPreset.value = 'Cyber Mode';
    aiPrompt.value = '';
  }

  function setToggle(key: keyof PolishToggles, value: boolean) {
    // moreContrast and darkMode are mutually exclusive
    if (key === 'moreContrast' && value) toggles.darkMode = false;
    if (key === 'darkMode' && value) toggles.moreContrast = false;

    toggles[key] = value;
  }

  async function applyPolish() {
    isPolishing.value = true;
    try {
      const css = buildToggleCSS(toggles);
      await sendCSSToPage(css);
      lastAppliedCSS.value = css;
      lastAppliedSource.value = 'toggles';
      activePresetId.value = null;
    } finally {
      isPolishing.value = false;
    }
  }

  async function generateAiStyle(prompt: string) {
    isGenerating.value = true;
    try {
      const css = await fetchAiCSS(prompt);
      await sendCSSToPage(css);
      lastAppliedCSS.value = css;
      lastAppliedSource.value = 'ai';
      activePresetId.value = null;
    } finally {
      isGenerating.value = false;
    }
  }

  async function revertStyles() {
    await sendCSSToPage('');
    lastAppliedCSS.value = null;
    lastAppliedSource.value = null;
    activePresetId.value = null;
  }

  // ── Preset Actions ─────────────────────────────────────────────────────────
  async function savePreset(name: string) {
    if (!lastAppliedCSS.value) return;
    const preset: UserPreset = {
      id: `preset_${Date.now()}`,
      name: name.trim(),
      css: lastAppliedCSS.value,
      source: lastAppliedSource.value ?? 'toggles',
      createdAt: Date.now(),
    };
    presets.value.push(preset);
    activePresetId.value = preset.id;
    await persistPresets();
  }

  async function applyPreset(id: string) {
    const preset = presets.value.find((p) => p.id === id);
    if (!preset) return;
    await sendCSSToPage(preset.css);
    lastAppliedCSS.value = preset.css;
    lastAppliedSource.value = preset.source;
    activePresetId.value = id;
  }

  async function deletePreset(id: string) {
    presets.value = presets.value.filter((p) => p.id !== id);
    if (activePresetId.value === id) activePresetId.value = null;
    await persistPresets();
  }

  async function renamePreset(id: string, newName: string) {
    const preset = presets.value.find((p) => p.id === id);
    if (preset) {
      preset.name = newName.trim();
      await persistPresets();
    }
  }

  // ── CSS Building ───────────────────────────────────────────────────────────
  function buildToggleCSS(t: PolishToggles): string {
    const blocks: string[] = [];

    // ── More Contrast ──────────────────────────────────────────────────────
    // Forces white background + near-black text across all elements.
    // Mutual exclusive with Dark Mode.
    if (t.moreContrast) {
      blocks.push(`
/* ── More Contrast ── */
html, body {
  background-color: #ffffff !important;
  color: #111111 !important;
}
div, section, article, main, aside, header, footer, nav,
form, fieldset, figure, details, summary {
  background-color: #ffffff !important;
  color: #111111 !important;
}
p, span, li, td, th, label, caption, blockquote,
figcaption, dt, dd, address, time, code, pre {
  color: #111111 !important;
}
h1, h2, h3, h4, h5, h6 {
  color: #000000 !important;
}
a             { color: #0044cc !important; }
a:visited     { color: #551a8b !important; }
a:hover       { color: #002899 !important; }
input, textarea, select, button {
  background-color: #f5f5f5 !important;
  color: #111111 !important;
  border-color: #999999 !important;
}
/* Restore images and media — don't touch them */
img, video, canvas, svg, picture { filter: none !important; }
`);
    }

    // ── Dark Mode ──────────────────────────────────────────────────────────
    // Smart dark mode: dark backgrounds, light text, preserves images.
    // Mutual exclusive with More Contrast.
    if (t.darkMode) {
      blocks.push(`
/* ── Dark Mode ── */
html, body {
  background-color: #1a1a1a !important;
  color: #e8e8e8 !important;
}
div, section, article, main, aside, nav, form, fieldset,
figure, details, summary {
  background-color: #1a1a1a !important;
  color: #e8e8e8 !important;
}
header, footer {
  background-color: #111111 !important;
  color: #e8e8e8 !important;
}
p, span, li, td, th, label, caption, blockquote,
figcaption, dt, dd, address, time {
  color: #e8e8e8 !important;
}
h1, h2, h3, h4, h5, h6 {
  color: #ffffff !important;
}
a         { color: #6aa9ff !important; }
a:visited { color: #bb88ff !important; }
a:hover   { color: #90c4ff !important; }
input, textarea, select {
  background-color: #2a2a2a !important;
  color: #e8e8e8 !important;
  border-color: #555555 !important;
}
button {
  background-color: #333333 !important;
  color: #e8e8e8 !important;
  border-color: #555555 !important;
}
code, pre {
  background-color: #2d2d2d !important;
  color: #f8f8f2 !important;
  border-color: #444444 !important;
}
hr, border { border-color: #444444 !important; }
/* Preserve images and media */
img, video, canvas, picture { filter: none !important; }
/* Lighten SVG icons slightly so they stay visible */
svg { opacity: 0.9 !important; }
`);
    }

    // ── Focus Mode ────────────────────────────────────────────────────────
    // Hides common distractors: ads, sidebars, cookie banners, popups,
    // sticky headers, floating chat widgets. Keeps main content untouched.
    if (t.focusMode) {
      blocks.push(`
/* ── Focus Mode ── */

/* Common ad networks & trackers */
[id*="ad"], [class*="ad-"], [class*="-ad"],
[id*="ads"], [class*="ads-"], [class*="-ads"],
[id*="advert"], [class*="advert"],
[id*="banner"], [class*="banner"],
[id*="sponsor"], [class*="sponsor"],
[class*="promo"], [id*="promo"],
ins.adsbygoogle, [id^="google_ads"],
iframe[src*="doubleclick"], iframe[src*="googlesyndication"],
iframe[src*="amazon-adsystem"] {
  display: none !important;
}

/* Cookie / GDPR banners */
[id*="cookie"], [class*="cookie"],
[id*="gdpr"], [class*="gdpr"],
[id*="consent"], [class*="consent"],
[class*="notice--cookie"], [class*="cc-banner"],
[id*="onetrust"], [class*="onetrust"] {
  display: none !important;
}

/* Popups, modals, overlays */
[class*="modal"]:not(dialog[open]),
[class*="popup"], [class*="overlay"],
[class*="lightbox"], [class*="interstitial"],
[role="dialog"]:not([aria-modal="true"]) {
  display: none !important;
}

/* Newsletter / subscribe nags */
[class*="newsletter"], [class*="subscribe"],
[id*="newsletter"], [id*="subscribe"],
[class*="signup-form"], [class*="email-capture"] {
  display: none !important;
}

/* Floating chat / support widgets */
[id*="chat-widget"], [class*="chat-widget"],
[id*="intercom"], [class*="intercom"],
[id*="drift"], [class*="drift"],
[id*="zendesk"], [id*="zopim"] {
  display: none !important;
}

/* Sticky / fixed header annoyances (but keep nav accessible) */
[class*="sticky-header"], [class*="sticky-bar"],
[class*="fixed-header"] {
  position: relative !important;
}

/* Sidebars — hide secondary, preserve primary content */
aside,
[class*="sidebar"], [id*="sidebar"],
[class*="side-bar"], [id*="side-bar"],
[class*="widget-area"], [id*="widget-area"] {
  display: none !important;
}

/* Social share floating bars */
[class*="social-share"], [class*="share-bar"],
[class*="floating-share"], [id*="share-widget"] {
  display: none !important;
}
`);
    }

    // ── Extra Spacing ─────────────────────────────────────────────────────
    // Increases breathing room for easier reading.
    if (t.extraSpacing) {
      blocks.push(`
/* ── Extra Spacing ── */
body {
  max-width: 780px !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
p, li, td, th, label, blockquote, dt, dd {
  line-height: 1.9 !important;
  letter-spacing: 0.015em !important;
}
p {
  margin-bottom: 1.4em !important;
}
h1 { margin: 1.4em 0 0.6em !important; }
h2 { margin: 1.2em 0 0.5em !important; }
h3 { margin: 1em 0 0.4em !important; }
h4, h5, h6 { margin: 0.8em 0 0.3em !important; }
li { margin-bottom: 0.45em !important; }
blockquote {
  padding: 0.8em 1.2em !important;
  margin: 1.2em 0 !important;
}
`);
    }

    // ── Readable ──────────────────────────────────────────────────────────
    // Applies Inter font + sane type scale.
    // Note: the <link> for Inter is injected separately in background.ts
    // because @import doesn't work inside style.textContent.
    if (t.readable) {
      blocks.push(`
/* ── Readable ── */
body, p, span, li, td, th, label, div,
input, textarea, select, button, blockquote {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
  font-size: 15px !important;
  -webkit-font-smoothing: antialiased !important;
  text-rendering: optimizeLegibility !important;
}
h1 { font-size: 2rem !important;    font-weight: 700 !important; line-height: 1.2 !important; }
h2 { font-size: 1.5rem !important;  font-weight: 700 !important; line-height: 1.25 !important; }
h3 { font-size: 1.25rem !important; font-weight: 600 !important; line-height: 1.3 !important; }
h4 { font-size: 1.1rem !important;  font-weight: 600 !important; }
h5, h6 { font-size: 1rem !important; font-weight: 600 !important; }
code, pre, kbd {
  font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace !important;
  font-size: 13px !important;
}
`);
    }

    return blocks.join('\n');
  }

  // ── Messaging ──────────────────────────────────────────────────────────────
  async function sendCSSToPage(css: string): Promise<void> {
    const injectFontLink = toggles.readable && !!css;

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: 'APPLY_CSS', css, injectFontLink },
        (response: { ok: boolean; error?: string }) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else if (!response?.ok) {
            reject(new Error(response?.error ?? 'Unknown error'));
          } else {
            resolve();
          }
        },
      );
    });
  }

  async function fetchAiCSS(prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: 'GENERATE_CSS', prompt },
        (response: { css?: string; error?: string }) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else if (response?.error) {
            reject(new Error(response.error));
          } else {
            resolve(response?.css ?? '');
          }
        },
      );
    });
  }

  async function persistPresets(): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEY]: presets.value });
  }

  return {
    selectedPreset,
    toggles,
    aiPrompt,
    autoApply,
    isPolishing,
    isGenerating,
    lastAppliedCSS,
    lastAppliedSource,
    presets,
    activePresetId,
    init,
    resetToDefaults,
    setToggle,
    applyPolish,
    generateAiStyle,
    revertStyles,
    savePreset,
    applyPreset,
    deletePreset,
    renamePreset,
  };
});
