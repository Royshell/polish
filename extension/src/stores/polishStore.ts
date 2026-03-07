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

  // ── Init — called explicitly from main.ts after app mounts ────────────────
  // NOT called at module load time — chrome.storage isn't ready yet then.
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

  // ── Private Helpers ────────────────────────────────────────────────────────
  function buildToggleCSS(t: PolishToggles): string {
    const rules: string[] = [];

    if (t.moreContrast) {
      // body { color } alone doesn't cascade — sites set color directly on elements.
      // Target all common text elements explicitly. Avoid touching backgrounds on
      // div/section/article — that breaks colored cards and hero sections.
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
      // Only touch line-height / letter-spacing on pure text elements.
      // Avoid margins/padding/max-width — those shift layout.
      // Avoid block containers (div, section) — they often have overflow:hidden
      // with a fixed height and clipping expanded lines.
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
      // Mutual exclusive with moreContrast — setToggle() enforces this.
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
/* Google AdSense / DoubleClick */
ins.adsbygoogle,
[id^="google_ads"], [id^="google-ads"],
[class^="google_ads"], [class^="google-ads"],
iframe[src*="googlesyndication"],
iframe[src*="doubleclick.net"],
iframe[src*="googleadservices"],
iframe[src*="ad.doubleclick"],
/* Generic ad slots */
[id*="adslot"], [class*="adslot"],
[id*="ad-slot"], [class*="ad-slot"],
[id*="ad_slot"], [class*="ad_slot"],
[id*="dfp-"], [class*="dfp-"],
[id*="adunit"], [class*="adunit"],
[id*="ad-unit"], [class*="ad-unit"],
/* Outbrain / Taboola / RevContent */
[id*="outbrain"], [class*="outbrain"],
[id*="taboola"], [class*="taboola"],
[id*="revcontent"], [class*="revcontent"],
[id*="mgid"], [class*="mgid"],
[id*="zergnet"], [class*="zergnet"],
/* Amazon ads */
iframe[src*="amazon-adsystem"],
[class*="amzn-native"],
/* Generic patterns — broad but effective */
[id*="advert"], [class*="advert"],
[class*="ad-wrap"], [id*="ad-wrap"],
[class*="ad-container"], [id*="ad-container"],
[class*="ad_container"], [id*="ad_container"],
[class*="adblock"], [id*="adblock"],
[class*="ad-block"], [id*="ad-block"],
[class*="adbox"], [id*="adbox"],
[class*="ad-box"], [id*="ad-box"],
[class*="sponsored"], [id*="sponsored"],
[class*="sponsor-"], [id*="sponsor-"],
[data-ad], [data-ad-unit], [data-ad-slot],
[data-google-query-id],
[class*="promo-"], [id*="promo-"],
[class*="-promo"], [id*="-promo"] { display: none !important; }

/* === ALL EXTERNAL IFRAMES (almost always ads or trackers) === */
/* Whitelist: YouTube, Vimeo, Loom, Twitter/X embeds — hide everything else */
iframe:not([src*="youtube.com"]):not([src*="youtu.be"])
       :not([src*="vimeo.com"])
       :not([src*="loom.com"])
       :not([src*="twitter.com"]):not([src*="x.com"])
       :not([src*="google.com/maps"])
       :not([src*="maps.google"])
       :not([src*="player.twitch"]) { display: none !important; }

/* === STICKY / FLOATING JUNK === */
/* Fixed elements at bottom = cookie banners, chat bubbles, sticky ads */
[style*="position: fixed"][style*="bottom"],
[style*="position:fixed"][style*="bottom"] { display: none !important; }
/* Named sticky bars */
[class*="sticky-ad"], [class*="sticky-banner"],
[class*="fixed-ad"], [class*="fixed-banner"],
[class*="float-ad"], [class*="float-banner"],
[class*="bottom-bar"], [class*="bottom-strip"],
[class*="top-bar"]:not(header):not(nav),
[class*="ad-sticky"], [id*="ad-sticky"] { display: none !important; }

/* === COOKIE & CONSENT BANNERS === */
[id*="cookie"], [class*="cookie-banner"],
[class*="cookie-bar"], [class*="cookie-notice"],
[class*="cookie-consent"], [class*="cookie-modal"],
[id*="gdpr"], [class*="gdpr"],
[id*="consent-"], [class*="consent-"],
[id*="onetrust"], [class*="onetrust"],
[id*="cookielaw"], [class*="cookielaw"],
[id*="cookie-law"], [class*="cookie-law"],
[class*="cc-window"], [class*="cc-banner"],
[id*="CookieBanner"], [class*="CookieBanner"],
[aria-label*="cookie" i], [aria-label*="consent" i] { display: none !important; }

/* === POPUPS & MODALS === */
[class*="modal"]:not([aria-modal="true"]):not([role="dialog"][open]),
[class*="popup"]:not(details),
[class*="lightbox"],
[class*="interstitial"],
[class*="overlay-"] { display: none !important; }

/* === NEWSLETTER & SUBSCRIBE NAGS === */
[class*="newsletter"], [id*="newsletter"],
[class*="subscribe-"], [id*="subscribe-"],
[class*="-subscribe"], [id*="-subscribe"],
[class*="email-signup"], [id*="email-signup"],
[class*="signup-form"], [id*="signup-form"],
[class*="email-capture"], [class*="lead-capture"],
[class*="cta-bar"]:not(header):not(nav) { display: none !important; }

/* === CHAT & SUPPORT WIDGETS === */
[id*="chat-widget"], [class*="chat-widget"],
[id*="chat-button"], [class*="chat-button"],
[id*="intercom"], [class*="intercom"],
[id*="drift-widget"], [class*="drift"],
[id*="zendesk"], [id*="zopim"],
[id*="freshchat"], [class*="freshchat"],
[id*="crisp-"], [class*="crisp-chat"],
[id*="tawk"], [class*="tawk-"],
[id*="helpscout"], [class*="beacon-"],
[id*="hubspot-"], [class*="hubspot-messages"],
[class*="livechat"], [id*="livechat"] { display: none !important; }

/* === SIDEBARS === */
aside,
[id="sidebar"], [class="sidebar"],
[id*="-sidebar"], [class*="-sidebar"],
[id*="sidebar-"], [class*="sidebar-"],
[id*="side-bar"], [class*="side-bar"],
[role="complementary"],
[class*="widget-area"], [id*="widget-area"],
[class*="related-posts"], [id*="related-posts"],
[class*="related-articles"], [id*="related-articles"] { display: none !important; }

/* === SOCIAL SHARE FLOATERS === */
[class*="social-share"], [id*="social-share"],
[class*="share-bar"], [class*="share-widget"],
[class*="sharing-bar"], [class*="addthis"],
[class*="sharethis"], [class*="addtoany"],
[class*="floating-share"], [class*="sticky-share"] { display: none !important; }

/* === "YOU MAY ALSO LIKE" / CONTENT RECOMMENDATIONS === */
[class*="recommended"], [id*="recommended"],
[class*="suggestions"], [id*="suggestions"],
[class*="more-stories"], [id*="more-stories"],
[class*="around-the-web"], [class*="from-the-web"],
[class*="you-may-like"], [class*="youmaylike"] { display: none !important; }
      `);
    }

    if (t.readable) {
      // Font loaded via <link> in background.ts — @import inside textContent is ignored.
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

    return rules.join('\n');
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

  async function sendCSSToPage(css: string): Promise<void> {
    const injectFontLink = toggles.readable && !!css;
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: 'APPLY_CSS', css, injectFontLink },
        (response: { ok: boolean; error?: string }) => {
          if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
          else if (!response?.ok) reject(new Error(response?.error ?? 'Unknown error'));
          else resolve();
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
