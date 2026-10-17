/**
 * site-patches.ts
 *
 * Per-domain CSS overrides that are merged ON TOP of the generic base theme.
 *
 * Why this exists:
 *   Generic selectors (html, body, [class*="container"], etc.) can't win against
 *   frameworks like LinkedIn's Artdeco or Twitter's React tree. Site patches add
 *   the missing surface-level selectors (cards, navbars, dropdowns) using the
 *   real class names of each site.
 *
 * Structure:
 *   SITE_PATCHES[hostname][themeId] = CSS string
 *
 * themeId values:
 *   Toggle-based : 'darkMode' | 'moreContrast'
 *   System preset: 'miami-vice' | 'cyber-mode' | 'clean-reader' | 'newspaper' | 'night-owl'
 *   AI generated : 'ai'   (generic surface helpers only — no colour assumptions)
 */

export type ThemePatchId =
  | 'darkMode'
  | 'moreContrast'
  | 'miami-vice'
  | 'cyber-mode'
  | 'clean-reader'
  | 'newspaper'
  | 'night-owl'
  | 'ai';

type SitePatchMap = Partial<Record<ThemePatchId, string>>;
type PatchRegistry = Record<string, SitePatchMap>;

// ─── Shared LinkedIn surface selector list ────────────────────────────────────
// Reused across multiple themes so we don't repeat the selector list everywhere.
//
// Background hierarchy (3 levels — every theme MUST provide all 3):
//   bg-page     (LI_PAGE)    — the page scaffold / feed column background
//   bg-secondary (LI_NAV + LI_SURFACE) — nav, cards, panels, identity module
//   bg-elevated  (LI_ELEVATED)          — dropdowns, tooltips, modals
//
// LinkedIn light-mode defaults for reference:
//   bg-page:      #f3f2ef
//   bg-secondary: #ffffff
//   bg-elevated:  #ffffff (with shadow)

// Level 0 — page / feed column (usually == html/body in generic CSS)
const LI_PAGE = `
  .scaffold-layout__main,
  .scaffold-layout__content,
  .scaffold-finite-scroll__content,
  .authentication-outlet,
  [data-view-name="feed-full-page"]`;

// Level 1 — nav bar (bg-secondary: slightly different from page bg)
const LI_NAV = `
  [data-testid="primary-nav"],
  .global-nav,
  .global-nav__content,
  .global-nav__nav,
  .search-global-typeahead,
  .search-global-typeahead__input-container`;

// Level 1 — surface cards / panels (bg-secondary: same level as nav)
const LI_SURFACE = `
  .artdeco-card,
  .scaffold-layout__sidebar,
  .scaffold-layout__sidebar-rail-offset,
  .scaffold-layout__aside,
  .feed-shared-update-v2,
  .update-components-header,
  .update-components-actor,
  .update-components-mini-update-v2__link-container,
  .artdeco-tabpanel,
  .artdeco-tab__content,
  .feed-identity-module,
  .scaffold-layout-toolbar,
  .ad-banner-container,
  .artdeco-list,
  .premium-upsell-card,
  [class*="right-rail"],
  [class*="left-rail"]`;

const LI_ELEVATED = `
  .artdeco-dropdown__content,
  .artdeco-dropdown__content-inner,
  .artdeco-tooltip__text-container,
  .artdeco-modal,
  .artdeco-modal__content,
  .msg-overlay-bubble-header,
  .msg-overlay-conversation-bubble`;

// LinkedIn text classes (their own design system, ignores h1-h6 in many places)
const LI_TEXT = `
  .t-black, .t-black--light, .t-black--inherit,
  .t-normal,
  .feed-shared-text,
  .break-words,
  .update-components-text,
  .artdeco-entity-lockup__subtitle,
  .feed-shared-actor__description,
  .feed-shared-actor__sub-description`;

const LI_HEADINGS = `
  .t-24, .t-20, .t-18, .t-16,
  .artdeco-entity-lockup__title,
  .feed-shared-actor__name,
  .update-components-actor__name,
  .org-top-card-summary__title`;

// ─── Registry ─────────────────────────────────────────────────────────────────

export const SITE_PATCHES: PatchRegistry = {
  // ══════════════════════════════════════════════════════════════════════════
  // LinkedIn
  // ══════════════════════════════════════════════════════════════════════════
  'www.linkedin.com': {
    // ── Dark Mode ──────────────────────────────────────────────────────────
    darkMode: `
/* ─── LinkedIn Dark Mode Patch ─────────────────────────────────────────── */

/* Level 0 — page / feed column */
${LI_PAGE} {
  background-color: #141414 !important;
}

/* Level 1a — nav bar (bg-secondary) */
${LI_NAV} {
  background-color: #1a1a1a !important;
  border-color: #2e2e2e !important;
}

/* Level 1b — surface cards / panels (bg-secondary, same tier as nav) */
${LI_SURFACE} {
  background-color: #1f1f1f !important;
  border-color: #2e2e2e !important;
}

/* Level 2 — dropdowns / modals / tooltips (bg-elevated) */
${LI_ELEVATED} {
  background-color: #2c2c2c !important;
  border-color: #444 !important;
}

/* Body text */
${LI_TEXT} {
  color: #d8d8d8 !important;
}

/* Headings / names */
${LI_HEADINGS} {
  color: #f0f0f0 !important;
}

/* Link / secondary actions */
.artdeco-button--tertiary,
.app-aware-link,
.link-without-hover-visited {
  color: #6aa9ff !important;
}

/* Inputs */
.search-global-typeahead__input,
.artdeco-text-input--input {
  background-color: #2a2a2a !important;
  color: #d8d8d8 !important;
  border-color: #555 !important;
}

/* Icon buttons that have a white bg */
.artdeco-button--muted,
.artdeco-button--secondary {
  background-color: #2a2a2a !important;
  border-color: #555 !important;
  color: #d8d8d8 !important;
}`,

    // ── More Contrast ──────────────────────────────────────────────────────
    moreContrast: `
/* ─── LinkedIn More Contrast Patch ─────────────────────────────────────── */
${LI_PAGE}     { background-color: #f0f0f0 !important; }
${LI_NAV},
${LI_SURFACE}  { background-color: #ffffff !important; border-color: #000 !important; }
${LI_ELEVATED} { background-color: #ffffff !important; border-color: #000 !important; }
${LI_TEXT}      { color: #000000 !important; }
${LI_HEADINGS}  { color: #000000 !important; font-weight: 700 !important; }`,

    // ── Miami Vice ─────────────────────────────────────────────────────────
    'miami-vice': `
/* ─── LinkedIn Miami Vice Patch ─────────────────────────────────────────── */
@import url('https://fonts.cdnfonts.com/css/broadway-bt');

${LI_PAGE}     { background-color: #030c1a !important; }
${LI_NAV}      { background-color: #050e1e !important; border-color: #0a1f38 !important; }
${LI_SURFACE}  { background-color: #071428 !important; border-color: #0a1f38 !important; }
${LI_ELEVATED} { background-color: #0a1f38 !important; border-color: #00c8c840 !important; }
${LI_TEXT}     { color: #c8ddf0 !important; }

/* Force Broadway on all LinkedIn heading classes */
${LI_HEADINGS},
.t-24, .t-20, .t-18 {
  font-family: 'Broadway BT', 'Broadway', fantasy !important;
  color: #ff1e8e !important;
  text-shadow: 0 0 12px rgba(255,30,142,0.7), 0 0 30px rgba(255,30,142,0.3) !important;
  letter-spacing: 0.02em !important;
}

.artdeco-button--secondary,
.artdeco-button--muted {
  background-color: #0a1f38 !important;
  border-color: #00c8c880 !important;
  color: #00c8c8 !important;
}
.search-global-typeahead__input,
.artdeco-text-input--input {
  background-color: #0a1f38 !important;
  color: #c8ddf0 !important;
  border-color: #00c8c840 !important;
}`,

    // ── Cyber Mode ─────────────────────────────────────────────────────────
    'cyber-mode': `
/* ─── LinkedIn Cyber Mode Patch ─────────────────────────────────────────── */
${LI_PAGE}     { background-color: #000000 !important; }
${LI_NAV}      { background-color: #010204 !important; border-color: #00ff8820 !important; }
${LI_SURFACE}  { background-color: #020408 !important; border-color: #00ff8820 !important; }
${LI_ELEVATED} { background-color: #061208 !important; border-color: #00ff8840 !important; }
${LI_TEXT}     { color: #b0ffcc !important; }
${LI_HEADINGS} { color: #00ff88 !important; text-shadow: 0 0 10px rgba(0,255,136,0.6) !important; }
.artdeco-button--secondary,
.artdeco-button--muted {
  background-color: #061208 !important;
  border-color: #00ff8866 !important;
  color: #00ff88 !important;
}
.search-global-typeahead__input,
.artdeco-text-input--input {
  background-color: #061208 !important;
  color: #00ff88 !important;
  border-color: #00ff8844 !important;
}`,

    // ── Night Owl ──────────────────────────────────────────────────────────
    'night-owl': `
/* ─── LinkedIn Night Owl Patch ───────────────────────────────────────────── */
${LI_PAGE}     { background-color: #100a02 !important; }
${LI_NAV}      { background-color: #110c04 !important; border-color: #2a1f0a !important; }
${LI_SURFACE}  { background-color: #1a1209 !important; border-color: #2a1f0a !important; }
${LI_ELEVATED} { background-color: #241a0c !important; border-color: #6b4c1e !important; }
${LI_TEXT}     { color: #e8d5a3 !important; }
${LI_HEADINGS} { color: #f0c060 !important; }
.artdeco-button--secondary { background-color: #241a0c !important; border-color: #6b4c1e !important; color: #e8d5a3 !important; }
.search-global-typeahead__input { background-color: #241a0c !important; color: #e8d5a3 !important; border-color: #6b4c1e !important; }`,

    // ── Clean Reader ───────────────────────────────────────────────────────
    'clean-reader': `
/* ─── LinkedIn Clean Reader Patch ───────────────────────────────────────── */
${LI_PAGE}     { background-color: #f0f0ee !important; }
${LI_NAV}      { background-color: #fafaf8 !important; border-color: #e0e0dc !important; }
${LI_SURFACE}  { background-color: #ffffff !important; border-color: #e8e8e4 !important; }
${LI_ELEVATED} { background-color: #ffffff !important; border-color: #d0d0cc !important; }
${LI_TEXT}     { color: #2c2c2c !important; font-family: Georgia, serif !important; line-height: 1.8 !important; }
${LI_HEADINGS} { color: #111 !important; font-family: Georgia, serif !important; }`,

    // ── Newspaper ──────────────────────────────────────────────────────────
    newspaper: `
/* ─── LinkedIn Newspaper Patch ──────────────────────────────────────────── */
${LI_PAGE}     { background-color: #ece9e0 !important; }
${LI_NAV}      { background-color: #f4f1eb !important; border-color: #ccc !important; }
${LI_SURFACE}  { background-color: #f9f6ef !important; border-color: #ddd !important; }
${LI_ELEVATED} { background-color: #ffffff !important; border-color: #bbb !important; }
${LI_TEXT}     { color: #1a1a1a !important; font-family: Georgia, serif !important; }
${LI_HEADINGS} { color: #000 !important; font-family: Georgia, serif !important; border-bottom: 1px solid #1a1a1a !important; }`,

    // ── AI (generic surface helpers — no colour assumptions) ───────────────
    // Applied on top of any AI-generated CSS so card/nav surfaces at least
    // pick up whatever background-color the AI set on html/body via inheritance.
    ai: `
/* ─── LinkedIn AI Surface Patch (inherit helper) ────────────────────────── */
${LI_PAGE},
${LI_NAV},
${LI_SURFACE},
${LI_ELEVATED} {
  background-color: inherit !important;
  color: inherit !important;
}`,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Twitter / X  (add more sites here as needed)
  // ══════════════════════════════════════════════════════════════════════════
  'twitter.com': {
    darkMode: `
/* ─── Twitter Dark Mode Patch ───────────────────────────────────────────── */
[data-testid="primaryColumn"],
[data-testid="sidebarColumn"] > *,
header[role="banner"],
nav[aria-label="Primary"],
[data-testid="cellInnerDiv"] {
  background-color: #1a1a1a !important;
  border-color: #333 !important;
}
[data-testid="tweet"],
[data-testid="tweetDetail"] {
  background-color: #242424 !important;
}`,
  },

  'x.com': {
    darkMode: `
/* ─── X.com Dark Mode Patch ─────────────────────────────────────────────── */
[data-testid="primaryColumn"],
[data-testid="sidebarColumn"] > *,
header[role="banner"],
nav[aria-label="Primary"],
[data-testid="cellInnerDiv"] {
  background-color: #1a1a1a !important;
  border-color: #333 !important;
}
[data-testid="tweet"],
[data-testid="tweetDetail"] {
  background-color: #242424 !important;
}`,
  },
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the site-specific CSS patch for a given hostname + theme.
 * Returns '' if no patch exists (safe to concat with any CSS string).
 */
export function getSitePatch(hostname: string | null, themeId: ThemePatchId): string {
  if (!hostname) {
    return '';
  }
  return SITE_PATCHES[hostname]?.[themeId] ?? '';
}

/**
 * Merges base CSS with a site patch.
 * Patch is appended last so its selectors win over the generic base.
 */
export function mergeWithPatch(baseCSS: string, patch: string): string {
  if (!patch) {
    return baseCSS;
  }
  return baseCSS + '\n\n' + patch;
}
