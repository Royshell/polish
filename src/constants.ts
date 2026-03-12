// ── Storage keys ───────────────────────────────────────────────────────────
export const STORAGE_KEY      = 'polish_presets';
export const SITE_KEY_PREFIX  = 'polish_site_';

// ── DOM element IDs injected into the target page ─────────────────────────
export const STYLE_ELEMENT_ID = 'polish-injected';
export const FONT_LINK_ID     = 'polish-font-link';

// ── API ────────────────────────────────────────────────────────────────────
// Groq key lives on the server — never in the extension bundle.
export const POLISH_API_URL = 'https://polish-api-alpha.vercel.app/api/generate';

// ── UI limits ──────────────────────────────────────────────────────────────
export const VISIBLE_PRESET_LIMIT = 3;

// ── AI prompt placeholders ─────────────────────────────────────────────────
export const AI_PLACEHOLDERS = [
  'Make this look like a retro arcade cabinet…',
  'Transform into a luxury magazine layout…',
  'Apply dark cyberpunk neon aesthetic…',
  'Give it a minimal Japanese newspaper feel…',
  'Style like an old Terminal green-on-black…',
] as const;

// ── Fine-tune font options ─────────────────────────────────────────────────
export const FONT_OPTIONS = [
  { value: '',             label: '— Default —'  },
  { value: 'inter',        label: 'Inter'         },
  { value: 'georgia',      label: 'Georgia'       },
  { value: 'merriweather', label: 'Merriweather'  },
  { value: 'mono',         label: 'Monospace'     },
] as const;
