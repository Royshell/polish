import { ref, reactive } from 'vue';
import { defineStore } from 'pinia';

export interface PolishToggles {
  moreContrast: boolean;
  extraSpacing: boolean;
  vibrantColors: boolean;
  betterFonts: boolean;
}

const DEFAULT_TOGGLES: PolishToggles = {
  moreContrast: true,
  extraSpacing: true,
  vibrantColors: true,
  betterFonts: true,
};

export const usePolishStore = defineStore('polish', () => {

  const selectedPreset = ref('Cyber Mode');
  const toggles = reactive<PolishToggles>({ ...DEFAULT_TOGGLES });
  const aiPrompt = ref('');
  const autoApply = ref(false);
  const isPolishing = ref(false);
  const isGenerating = ref(false);
  const lastAppliedCSS = ref<string | null>(null);


  function resetToDefaults() {
    Object.assign(toggles, DEFAULT_TOGGLES);
    selectedPreset.value = 'Cyber Mode';
    aiPrompt.value = '';
  }

  function setToggle(key: keyof PolishToggles, value: boolean) {
    toggles[key] = value;
  }

  async function applyPolish() {
    isPolishing.value = true;
    try {
      const css = buildToggleCSS(toggles);
      await sendCSSToPage(css);
      lastAppliedCSS.value = css;
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
    } finally {
      isGenerating.value = false;
    }
  }

  async function revertStyles() {
    await sendCSSToPage('');
    lastAppliedCSS.value = null;
  }

  function buildToggleCSS(t: PolishToggles): string {
    const rules: string[] = [];

    if (t.moreContrast) {
      rules.push(`
        body { background: #fff !important; color: #111 !important; }
        a    { color: #0055cc !important; }
      `);
    }
    if (t.extraSpacing) {
      rules.push(`
        p, li { line-height: 1.9 !important; letter-spacing: 0.02em !important; }
        p     { margin-bottom: 1.2em !important; }
      `);
    }
    if (t.vibrantColors) {
      rules.push(`:root { filter: saturate(1.4) contrast(1.05); }`);
    }
    if (t.betterFonts) {
      rules.push(`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
        body, p, span, li, td {
          font-family: 'Inter', sans-serif !important;
          font-size: 15px !important;
        }
        h1, h2, h3 { font-weight: 600 !important; }
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
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    chrome.tabs.sendMessage(tab.id, { type: 'APPLY_CSS', css });
  }

  return {
    // state
    selectedPreset,
    toggles,
    aiPrompt,
    autoApply,
    isPolishing,
    isGenerating,
    lastAppliedCSS,
    // actions
    resetToDefaults,
    setToggle,
    applyPolish,
    generateAiStyle,
    revertStyles,
  };
});
