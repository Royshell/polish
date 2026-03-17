import { ref, reactive, toRaw } from "vue";
import { defineStore } from "pinia";
import { STORAGE_KEY, SITE_KEY_PREFIX } from "../constants";

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
  source: "toggles" | "ai";
  createdAt: number;
}

export interface FineTuneState {
  bodyFontSize: number; // 12–22px
  headingScale: number; // 0.8–2.0x
  bgColor: string; // '' = not applied
  textColor: string; // '' = not applied
  fontFamily: string; // '' | 'inter' | 'georgia' | 'merriweather' | 'mono'
}

export interface SiteState {
  selectedPreset: string;
  toggles: PolishToggles;
  lastAppliedCSS: string | null;
  lastAppliedSource: "toggles" | "ai" | null;
  activePresetId: string | null;
  autoApply: boolean;
}

export interface SystemPreset {
  id: string;
  label: string;
  css: string;
}

// ── Defaults ───────────────────────────────────────────────────────────────
const DEFAULT_TOGGLES: PolishToggles = {
  moreContrast: false,
  darkMode: false,
  focusMode: false,
  extraSpacing: false,
  readable: false,
};

const DEFAULT_FINETUNE: FineTuneState = {
  bodyFontSize: 16,
  headingScale: 1.0,
  bgColor: "",
  textColor: "",
  fontFamily: "",
};

// ── System Presets ─────────────────────────────────────────────────────────
export const SYSTEM_PRESETS: SystemPreset[] = [
  {
    id: "miami-vice",
    label: "🌴 Miami Vice",
    css: `
/* Miami Vice — cinematic 80s night, based on the original title card */

/* Broadway BT via CDNFonts */
@import url('https://fonts.cdnfonts.com/css/broadway-bt');

html, body,
div#root, div#app, div#__next, div#main, div#wrapper, div#container,
main, article, section, header, footer, nav, aside,
[class*="layout"], [class*="Layout"],
[class*="wrapper"], [class*="Wrapper"],
[class*="container"], [class*="Container"],
[class*="page-"], [class*="Page"],
[class*="site-"], [id*="site-"],
[class*="content-wrap"], [class*="app-body"] {
  background-color: #071428 !important;
}
p, span, li, td, th, dt, dd, label, blockquote,
figcaption, address, cite, small, time,
strong, em, b, i {
  color: #c8ddf0 !important;
}
h1, h2, h3, h4, h5, h6 {
  color: #ff1e8e !important;
  font-family: 'Broadway BT', 'Broadway', fantasy !important;
  font-style: normal !important;
  text-shadow: 0 0 12px rgba(255,30,142,0.7), 0 0 30px rgba(255,30,142,0.3) !important;
  letter-spacing: 0.02em !important;
}
a         { color: #00c8c8 !important; }
a:visited { color: #7b4fcc !important; }
a:hover   {
  color: #ff1e8e !important;
  text-shadow: 0 0 8px rgba(255,30,142,0.6) !important;
}
::selection {
  background: #ff1e8e !important;
  color: #071428 !important;
}
input, textarea, select {
  background-color: #0a1f38 !important;
  color: #c8ddf0 !important;
  border-color: #00c8c880 !important;
}
body, p, span, li, td, th, label, div,
input, textarea, select, button, blockquote {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
  font-weight: 300 !important;
  letter-spacing: 0.04em !important;
}
strong, b { color: #ff1e8e !important; font-weight: 400 !important; }
code, pre {
  background: #0a1f38 !important;
  color: #00c8c8 !important;
  border-color: #00c8c840 !important;
}
`,
  },
  {
    id: "cyber-mode",
    label: "⚡ Cyber Mode",
    css: `
/* Cyber Mode — neon green on deep black */
html, body,
div#root, div#app, div#__next, div#main, div#wrapper, div#container,
main, article, section, header, footer, nav, aside,
[class*="layout"], [class*="Layout"],
[class*="wrapper"], [class*="Wrapper"],
[class*="container"], [class*="Container"],
[class*="page-"], [class*="site-"],
[class*="content-wrap"], [class*="app-body"] { background-color: #020408 !important; }
p, span, li, td, th, dt, dd, label, blockquote,
figcaption, address, cite, small, time,
strong, em, b, i { color: #b0ffcc !important; }
h1, h2, h3, h4, h5, h6 {
  color: #00ff88 !important;
  text-shadow: 0 0 10px rgba(0,255,136,0.6) !important;
  letter-spacing: 0.06em !important;
}
a         { color: #00e5ff !important; }
a:visited { color: #7b5ea7 !important; }
a:hover   { color: #00ff88 !important; text-shadow: 0 0 8px rgba(0,255,136,0.8) !important; }
::selection { background: #00ff88 !important; color: #020408 !important; }
input, textarea, select {
  background-color: #061208 !important;
  color: #00ff88 !important;
  border-color: #00ff8866 !important;
}
body, p, span, li, td, th, label, div,
input, textarea, select, button, blockquote {
  font-family: 'Share Tech Mono', 'Courier New', monospace !important;
}
code, pre { background: #061208 !important; color: #00e5ff !important; border-color: #00ff8844 !important; }
`,
  },
  {
    id: "clean-reader",
    label: "📖 Clean Reader",
    css: `
/* Clean Reader — distraction-free reading */
html, body,
div#root, div#app, div#__next, div#main, div#wrapper, div#container,
main, article, section, header, footer, nav, aside,
[class*="layout"], [class*="Layout"],
[class*="wrapper"], [class*="Wrapper"],
[class*="container"], [class*="Container"],
[class*="page-"], [class*="site-"],
[class*="content-wrap"], [class*="app-body"] { background-color: #fafaf8 !important; }
p, span, li, td, th, dt, dd, label, blockquote,
figcaption, address, cite, small, time,
strong, em, b, i { color: #2c2c2c !important; }
h1, h2, h3, h4, h5, h6 { color: #111111 !important; }
a         { color: #1a56cc !important; }
a:visited { color: #6b21a8 !important; }
input, textarea, select {
  background-color: #f0f0ee !important;
  color: #2c2c2c !important;
  border-color: #cccccc !important;
}
body, p, span, li, td, th, label, div,
input, textarea, select, button, blockquote {
  font-family: 'Georgia', 'Times New Roman', serif !important;
  font-size: 16px !important;
  line-height: 1.8 !important;
}
h1, h2, h3, h4, h5, h6 {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
}
p { max-width: 66ch !important; }
`,
  },
  {
    id: "newspaper",
    label: "🗞 Newspaper",
    css: `
/* Newspaper — classic editorial, dense serif */
html, body,
div#root, div#app, div#__next, div#main, div#wrapper, div#container,
main, article, section, header, footer, nav, aside,
[class*="layout"], [class*="Layout"],
[class*="wrapper"], [class*="Wrapper"],
[class*="container"], [class*="Container"],
[class*="page-"], [class*="site-"],
[class*="content-wrap"], [class*="app-body"] { background-color: #f4f1eb !important; }
p, span, li, td, th, dt, dd, label, blockquote,
figcaption, address, cite, small, time,
strong, em, b, i { color: #1a1a1a !important; }
h1, h2, h3, h4, h5, h6 {
  color: #000000 !important;
  font-family: 'Georgia', 'Times New Roman', serif !important;
  letter-spacing: -0.01em !important;
  border-bottom: 1px solid #1a1a1a !important;
  padding-bottom: 0.2em !important;
}
a         { color: #8b0000 !important; text-decoration: underline !important; }
a:visited { color: #4a0000 !important; }
input, textarea, select {
  background-color: #ede9e0 !important;
  color: #1a1a1a !important;
  border-color: #aaaaaa !important;
}
body, p, span, li, td, th, label {
  font-family: 'Georgia', 'Times New Roman', serif !important;
  font-size: 15px !important;
  line-height: 1.7 !important;
}
blockquote {
  border-left: 3px solid #1a1a1a !important;
  font-style: italic !important;
  color: #444 !important;
}
`,
  },
  {
    id: "night-owl",
    label: "🦉 Night Owl",
    css: `
/* Night Owl — warm dark for late reading */
html, body,
div#root, div#app, div#__next, div#main, div#wrapper, div#container,
main, article, section, header, footer, nav, aside,
[class*="layout"], [class*="Layout"],
[class*="wrapper"], [class*="Wrapper"],
[class*="container"], [class*="Container"],
[class*="page-"], [class*="site-"],
[class*="content-wrap"], [class*="app-body"] { background-color: #1a1209 !important; }
p, span, li, td, th, dt, dd, label, blockquote,
figcaption, address, cite, small, time,
strong, em, b, i { color: #e8d5a3 !important; }
h1, h2, h3, h4, h5, h6 { color: #f0c060 !important; }
a         { color: #d4956a !important; }
a:visited { color: #a06040 !important; }
a:hover   { color: #f0c060 !important; }
::selection { background: #f0c060 !important; color: #1a1209 !important; }
input, textarea, select {
  background-color: #241a0c !important;
  color: #e8d5a3 !important;
  border-color: #6b4c1e !important;
}
body, p, span, li, td, th, label, div,
input, textarea, select, button, blockquote {
  font-family: 'Georgia', 'Times New Roman', serif !important;
  font-size: 16px !important;
  line-height: 1.75 !important;
}
h1, h2, h3, h4, h5, h6 {
  font-family: -apple-system, BlinkMacSystemFont, sans-serif !important;
}
code, pre { background: #241a0c !important; color: #d4956a !important; border-color: #6b4c1e !important; }
`,
  },
];

// ── Store ──────────────────────────────────────────────────────────────────
async function getCurrentHostname(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      const url = tabs[0]?.url;
      if (!url) return resolve(null);
      try {
        resolve(new URL(url).hostname);
      } catch {
        resolve(null);
      }
    });
  });
}

export const usePolishStore = defineStore("polish", () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const selectedPreset = ref("");
  const toggles = reactive<PolishToggles>({ ...DEFAULT_TOGGLES });
  const fineTune = reactive<FineTuneState>({ ...DEFAULT_FINETUNE });
  const aiPrompt = ref("");
  const autoApply = ref(false);
  const isPolishing = ref(false);
  const isGenerating = ref(false);
  const lastAppliedCSS = ref<string | null>(null);
  const lastAppliedSource = ref<"toggles" | "ai" | null>(null);
  const presets = ref<UserPreset[]>([]);
  const activePresetId = ref<string | null>(null);

  // ── Init ───────────────────────────────────────────────────────────────────
  // Called explicitly from main.ts after app mounts — chrome.storage isn't
  // ready at module load time.
  async function init() {
    await new Promise<void>((resolve) => {
      chrome.storage.local.get(STORAGE_KEY, (result) => {
        if (Array.isArray(result[STORAGE_KEY])) {
          presets.value = result[STORAGE_KEY] as UserPreset[];
        }
        resolve();
      });
    });

    await loadSiteState();

    chrome.tabs.onActivated.addListener(() => loadSiteState());
    chrome.tabs.onUpdated.addListener((_tabId, changeInfo) => {
      if (changeInfo.status === "complete") {
        loadSiteState();
      }
    });
  }

  async function loadSiteState() {
    const hostname = await getCurrentHostname();
    if (!hostname) {
      return;
    }

    const key = SITE_KEY_PREFIX + hostname;
    chrome.storage.local.get(key, async (result) => {
      const saved = result[key] as SiteState | undefined;
      if (!!saved) {
        autoApply.value = saved.autoApply ?? false;
        lastAppliedCSS.value = saved.lastAppliedCSS ?? null;
        lastAppliedSource.value = saved.lastAppliedSource ?? null;
        activePresetId.value = saved.activePresetId ?? null;

        if (!!saved.autoApply && !!saved.lastAppliedCSS) {
          selectedPreset.value = saved.selectedPreset ?? "";
          Object.assign(toggles, { ...DEFAULT_TOGGLES, ...saved.toggles });
          await sendCSSToPage(saved.lastAppliedCSS);
        } else {
          selectedPreset.value = "";
          Object.assign(toggles, DEFAULT_TOGGLES);
        }
      } else {
        selectedPreset.value = "";
        lastAppliedCSS.value = null;
        lastAppliedSource.value = null;
        activePresetId.value = null;
        autoApply.value = false;
        Object.assign(toggles, DEFAULT_TOGGLES);
      }
    });
  }

  async function saveSiteState() {
    const hostname = await getCurrentHostname();
    if (!hostname) {
      return;
    }
    const state: SiteState = {
      selectedPreset: selectedPreset.value,
      toggles: { ...toRaw(toggles) },
      lastAppliedCSS: lastAppliedCSS.value,
      lastAppliedSource: lastAppliedSource.value,
      activePresetId: activePresetId.value,
      autoApply: autoApply.value,
    };
    chrome.storage.local.set({ [SITE_KEY_PREFIX + hostname]: state });
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  async function resetAll() {
    selectedPreset.value = "";
    lastAppliedCSS.value = null;
    lastAppliedSource.value = null;
    activePresetId.value = null;
    aiPrompt.value = "";
    Object.assign(toggles, DEFAULT_TOGGLES);
    Object.assign(fineTune, DEFAULT_FINETUNE);
    await sendCSSToPage("");
    await saveSiteState(); // BUG FIX: persist the reset state so it survives panel reload
  }

  async function applySystemPreset(id: string) {
    const preset = SYSTEM_PRESETS.find((preset) => preset.id === id);
    if (!preset) return;
    selectedPreset.value = id;
    lastAppliedCSS.value = preset.css.trim();
    lastAppliedSource.value = "toggles";
    activePresetId.value = null;
    await sendCSSToPage(preset.css.trim());
    await saveSiteState();
  }

  function resetFineTune() {
    Object.assign(fineTune, DEFAULT_FINETUNE);
    applyFineTune();
  }

  async function applyFineTune() {
    const css = buildFineTuneCSS(fineTune);
    const combined = [lastAppliedCSS.value ?? "", css]
      .filter(Boolean)
      .join("\n");
    await sendCSSToPage(combined, fineTune.fontFamily === "inter");
  }

  async function setToggle(key: keyof PolishToggles, value: boolean) {
    // Handle mutual exclusion
    if (key === "moreContrast" && value) {
      toggles.darkMode = false;
    }
    if (key === "darkMode" && value) {
      toggles.moreContrast = false;
    }

    // Always set the value and save
    toggles[key] = value;
    saveSiteState();
  }

  async function applyPolish() {
    isPolishing.value = true;
    try {
      const css = buildToggleCSS(toggles);
      await sendCSSToPage(css);
      lastAppliedCSS.value = css;
      lastAppliedSource.value = "toggles";
      activePresetId.value = null;
      await saveSiteState();
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
      lastAppliedSource.value = "ai";
      activePresetId.value = null;
      await saveSiteState();
    } finally {
      isGenerating.value = false;
    }
  }

  async function revertStyles() {
    lastAppliedCSS.value = null;
    lastAppliedSource.value = null;
    activePresetId.value = null;
    await sendCSSToPage("");
    await saveSiteState();
  }

  // ── Preset actions ─────────────────────────────────────────────────────────
  async function savePreset(name: string) {
    if (!lastAppliedCSS.value) return;
    const preset: UserPreset = {
      id: `preset_${Date.now()}`,
      name: name.trim(),
      css: lastAppliedCSS.value,
      source: lastAppliedSource.value ?? "toggles",
      createdAt: Date.now(),
    };
    presets.value.push(preset);
    activePresetId.value = preset.id;
    await persistPresets();
  }

  async function applyPreset(id: string) {
    const preset = presets.value.find((preset) => preset.id === id);
    if (!preset) return;
    lastAppliedCSS.value = preset.css;
    lastAppliedSource.value = preset.source;
    activePresetId.value = id;
    await sendCSSToPage(preset.css);
  }

  async function deletePreset(id: string) {
    presets.value = presets.value.filter((preset) => preset.id !== id);
    if (activePresetId.value === id) activePresetId.value = null;
    await persistPresets();
  }

  async function renamePreset(id: string, newName: string) {
    const preset = presets.value.find((preset) => preset.id === id);
    if (preset) {
      preset.name = newName.trim();
      await persistPresets();
    }
  }

  async function toggleAutoApply() {
    autoApply.value = !autoApply.value;
    await saveSiteState();
  }

  // ── CSS builders ───────────────────────────────────────────────────────────
  function buildToggleCSS(t: PolishToggles): string {
    const rules: string[] = [];

    if (t.moreContrast) {
      rules.push(`
/* ── More Contrast ── */
html, body { background-color: #ffffff !important; }
p, span, li, td, th, dt, dd, label, caption,
blockquote, figcaption, address, cite, small, time,
strong, em, b, i, u, s, mark, code, pre, kbd, samp,
legend, summary, output {
  color: #111111 !important;
}
h1, h2, h3, h4, h5, h6 { color: #000000 !important; }
a         { color: #0044cc !important; }
a:visited { color: #551a8b !important; }
input, textarea, select { color: #111111 !important; border-color: #888 !important; }
      `);
    }

    if (t.extraSpacing) {
      rules.push(`
/* ── Extra Spacing ── */
p, li, dt, dd, td, th, label, blockquote,
h1, h2, h3, h4, h5, h6,
span, a, strong, em, b, i, figcaption, summary {
  line-height: 1.85 !important;
}
p, li, td, th, label, blockquote {
  letter-spacing: 0.03em !important;
  word-spacing: 0.08em !important;
}
      `);
    }

    if (t.darkMode) {
      rules.push(`
/* ── Dark Mode ── */
html, body { background-color: #1a1a1a !important; }
p, span, li, td, th, dt, dd, label, caption,
blockquote, figcaption, address, cite, small, time,
strong, em, b, i, u, s, mark, code, kbd, samp,
legend, summary, output { color: #e8e8e8 !important; }
h1, h2, h3, h4, h5, h6 { color: #ffffff !important; }
a         { color: #6aa9ff !important; }
a:visited { color: #bb88ff !important; }
input, textarea, select {
  background-color: #2a2a2a !important;
  color: #e8e8e8 !important;
  border-color: #555 !important;
}
pre, code { background-color: #2d2d2d !important; color: #f8f8f2 !important; }
img, video, canvas, picture { filter: none !important; }
      `);
    }

    if (t.focusMode) {
      rules.push(`
/* ── Focus Mode ── */

/* === ADS & AD NETWORKS === */
ins.adsbygoogle,
[id^="google_ads"], [id^="google-ads"],
[class^="google_ads"], [class^="google-ads"],
iframe[src*="googlesyndication"],
iframe[src*="doubleclick.net"],
iframe[src*="googleadservices"],
iframe[src*="ad.doubleclick"],
[id*="adslot"], [class*="adslot"],
[id*="ad-slot"], [class*="ad-slot"],
[id*="ad_slot"], [class*="ad_slot"],
[id*="dfp-"], [class*="dfp-"],
[id*="adunit"], [class*="adunit"],
[id*="ad-unit"], [class*="ad-unit"],
[id*="outbrain"], [class*="outbrain"],
[id*="taboola"], [class*="taboola"],
[id*="revcontent"], [class*="revcontent"],
[id*="mgid"], [class*="mgid"],
[id*="zergnet"], [class*="zergnet"],
iframe[src*="amazon-adsystem"],
[class*="amzn-native"],
[id*="advert"]:not([id*="content"]):not([id*="article"]),
[class*="advert"]:not([class*="content"]):not([class*="article"]),
[class*="ad-wrap"], [id*="ad-wrap"],
[class*="ad-container"], [id*="ad-container"],
[class*="ad_container"], [id*="ad_container"],
[class*="ad-block"], [id*="ad-block"],
[class*="adbox"], [id*="adbox"],
[class*="ad-box"], [id*="ad-box"],
[class*="sponsor-"], [id*="sponsor-"],
[data-ad], [data-ad-unit], [data-ad-slot],
[data-google-query-id],
[class*="promo-banner"], [class*="promo-ad"],
[id*="promo-banner"], [id*="promo-ad"] { display: none !important; }

/* === EXTERNAL IFRAMES (ads/trackers) === */
iframe[src*="googlesyndication"],
iframe[src*="doubleclick"],
iframe[src*="amazon-adsystem"],
iframe[src*="outbrain"],
iframe[src*="taboola"],
iframe[src*="moatads"],
iframe[src*="adnxs"] { display: none !important; }

/* === STICKY / FLOATING JUNK === */
[class*="sticky-ad"], [class*="sticky-banner"],
[class*="fixed-ad"], [class*="fixed-banner"],
[class*="float-ad"], [class*="float-banner"],
[class*="bottom-ad"], [class*="bottom-strip"],
[class*="ad-sticky"], [id*="ad-sticky"] { display: none !important; }

/* === COOKIE & CONSENT BANNERS === */
[class*="cookie-banner"], [class*="cookie-bar"],
[class*="cookie-notice"], [class*="cookie-consent"],
[class*="cookie-modal"], [class*="cookie-popup"],
[id*="gdpr-banner"], [id*="gdpr-popup"], [class*="gdpr-banner"],
[id*="onetrust"], [class*="onetrust"],
[id*="cookielaw"], [class*="cookielaw"],
[class*="cc-window"], [class*="cc-banner"],
[id*="CookieBanner"], [class*="CookieBanner"],
[aria-label*="cookie" i], [aria-label*="consent" i] { display: none !important; }

/* === POPUPS & MODALS (non-functional) === */
[class*="modal-overlay"], [class*="modal-backdrop"],
[class*="popup-overlay"], [class*="popup-backdrop"],
[class*="lightbox-overlay"],
[class*="interstitial"] { display: none !important; }

/* === NEWSLETTER NAGS === */
[class*="newsletter-popup"], [class*="newsletter-modal"],
[class*="newsletter-banner"], [class*="newsletter-bar"],
[id*="newsletter-popup"], [id*="newsletter-modal"],
[class*="email-signup-popup"], [class*="signup-modal"],
[class*="email-capture"], [class*="lead-capture"] { display: none !important; }

/* === CHAT & SUPPORT WIDGETS === */
[id*="chat-widget"], [class*="chat-widget"],
[id*="chat-button"], [class*="chat-button"],
[id*="intercom"], [class*="intercom-container"],
[id*="drift-widget"], [class*="drift-widget"],
[id*="zendesk-widget"], [id*="zopim"],
[id*="freshchat"], [class*="freshchat"],
[id*="crisp-chatbox"], [class*="crisp-chatbox"],
[id*="tawk-widget"], [class*="tawk-min-container"],
[id*="hubspot-messages-iframe-container"],
[class*="livechat-widget"] { display: none !important; }

/* === FLOATING / STICKY SOCIAL SHARE ONLY === */
/* BUG FIX: was [class*="social-share"] which is too broad and hides
   in-article share bars (e.g. CNN's social-share_labelled-list).
   Now only targets explicitly floating/sticky/overlay variants. */
[class*="social-share-float"], [class*="share-bar-float"],
[class*="floating-share"], [class*="sticky-share"],
[class*="share-bar"], [class*="share-widget"],
[class*="sharing-bar"],
[class*="addthis"], [class*="sharethis"], [class*="addtoany"] { display: none !important; }

/* === CONTENT RECOMMENDATIONS (off-article widgets only) === */
/* BUG FIX: removed duplicate section and narrowed selectors.
   [class*="suggestions"] was hiding unrelated UI (e.g. search dropdowns).
   [class*="recommended"] was hiding too broadly. */
[class*="recommended-widget"], [id*="recommended-widget"],
[class*="you-may-like"], [class*="youmaylike"],
[class*="around-the-web"], [class*="from-the-web"],
[class*="more-stories-widget"], [id*="more-stories-widget"],
[id*="taboola-below"], [id*="outbrain-below"] { display: none !important; }
      `);
    }

    if (t.readable) {
      rules.push(`
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
h4, h5, h6 { font-weight: 600 !important; }
code, pre, kbd { font-family: 'JetBrains Mono', 'Fira Code', monospace !important; font-size: 13px !important; }
      `);
    }

    return rules.join("\n");
  }

  function buildFineTuneCSS(ft: FineTuneState): string {
    const rules: string[] = [];
    const BASE_FONT_SIZE = 16;

    if (ft.bodyFontSize !== BASE_FONT_SIZE) {
      rules.push(`
/* Fine-Tune: body size */
body, p, span, li, td, th, label, blockquote, div {
  font-size: ${ft.bodyFontSize}px !important;
}`);
    }

    if (ft.headingScale !== 1.0) {
      const s = ft.headingScale;
      rules.push(`
/* Fine-Tune: heading scale */
h1 { font-size: ${(2.0 * s).toFixed(2)}rem !important; }
h2 { font-size: ${(1.5 * s).toFixed(2)}rem !important; }
h3 { font-size: ${(1.25 * s).toFixed(2)}rem !important; }
h4 { font-size: ${(1.1 * s).toFixed(2)}rem !important; }
h5 { font-size: ${(1.0 * s).toFixed(2)}rem !important; }
h6 { font-size: ${(0.875 * s).toFixed(2)}rem !important; }`);
    }

    if (ft.bgColor) {
      rules.push(`
/* Fine-Tune: background */
html, body { background-color: ${ft.bgColor} !important; }`);
    }

    if (ft.textColor) {
      rules.push(`
/* Fine-Tune: text color */
p, span, li, td, th, dt, dd, label, blockquote,
figcaption, address, cite, small, time, strong, em {
  color: ${ft.textColor} !important;
}
h1, h2, h3, h4, h5, h6 { color: ${ft.textColor} !important; }`);
    }

    if (ft.fontFamily) {
      const fontMap: Record<string, string> = {
        inter: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        georgia: "Georgia, 'Times New Roman', serif",
        merriweather: "'Merriweather', Georgia, serif",
        mono: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
      };
      const stack = fontMap[ft.fontFamily];
      if (stack) {
        rules.push(`
/* Fine-Tune: font family */
body, p, span, li, td, th, label, div,
input, textarea, select, button, blockquote {
  font-family: ${stack} !important;
}`);
      }
    }

    return rules.join("\n");
  }

  // ── Private helpers ────────────────────────────────────────────────────────
  async function fetchAiCSS(prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: "GENERATE_CSS", prompt },
        (response: { css?: string; error?: string }) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else if (response?.error) {
            reject(new Error(response.error));
          } else {
            resolve(response?.css ?? "");
          }
        },
      );
    });
  }

  async function sendCSSToPage(css: string, forceFont = false): Promise<void> {
    const injectFontLink = (toggles.readable || forceFont) && !!css;
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: "APPLY_CSS", css, injectFontLink },
        (response: { ok: boolean; error?: string }) => {
          if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
          else if (!response?.ok)
            reject(new Error(response?.error ?? "Unknown error"));
          else resolve();
        },
      );
    });
  }

  async function persistPresets(): Promise<void> {
    const raw = JSON.parse(JSON.stringify(toRaw(presets.value)));
    await chrome.storage.local.set({ [STORAGE_KEY]: raw });
  }

  return {
    selectedPreset,
    toggles,
    fineTune,
    aiPrompt,
    autoApply,
    isPolishing,
    isGenerating,
    lastAppliedCSS,
    lastAppliedSource,
    presets,
    activePresetId,
    init,
    loadSiteState,
    resetFineTune,
    applyFineTune,
    resetAll,
    applySystemPreset,
    setToggle,
    applyPolish,
    generateAiStyle,
    revertStyles,
    savePreset,
    applyPreset,
    deletePreset,
    renamePreset,
    toggleAutoApply,
  };
});
