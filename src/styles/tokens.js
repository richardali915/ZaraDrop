// src/styles/tokens.js
// ─────────────────────────────────────────────────────────────────────────
// ZaraDrop "Aurora" design system — pure presentation layer.
//
// Why this file exists: the original `constants.js` (C, G, GZ, CSS, IS) is
// re-exported here with the *exact same keys* so every existing component
// keeps working unmodified — only the *values* change, from hardcoded hex
// strings to CSS custom properties. That one change is what makes the whole
// app theme-reactive: flipping `data-zd-theme` on <html> re-paints every
// surface instantly, with zero re-renders and zero per-component edits.
//
// Nothing here touches data, hooks, Supabase, or business logic.
// ─────────────────────────────────────────────────────────────────────────

// ── Color roles (semantic) — same 9 keys every screen already uses ───────
export const C = {
  bg:    "var(--zd-bg)",          // app background
  tx:    "var(--zd-text)",        // primary text
  su:    "var(--zd-text-dim)",    // secondary text
  ac:    "var(--zd-accent)",      // brand violet
  ok:    "var(--zd-success)",     // mint / money-in / online
  wa:    "var(--zd-warning)",     // gold / pending
  er:    "var(--zd-danger)",      // coral / errors
  bd:    "var(--zd-border)",      // hairline borders
  s1:    "var(--zd-surface-1)",   // solid alt surface

  // Additive tokens (new — nothing existing reads these, safe to add)
  bg2:      "var(--zd-bg-elevated)",
  surf:     "var(--zd-surface)",
  surfSoft: "var(--zd-surface-soft)",
  surfHov:  "var(--zd-surface-hover)",
  su2:      "var(--zd-text-faint)",
  bdStrong: "var(--zd-border-strong)",
  overlay:  "var(--zd-overlay)",
  ac2:      "var(--zd-accent-2)",
  acSoft:   "var(--zd-accent-soft)",
  okSoft:   "var(--zd-success-soft)",
  waSoft:   "var(--zd-warning-soft)",
  erSoft:   "var(--zd-danger-soft)",
  glow:     "var(--zd-glow)",
  shadow:   "var(--zd-shadow)",
  shadowLg: "var(--zd-shadow-lg)",
};

// ── Brand gradients (intentionally theme-stable — vivid on both bg modes,
//    exactly how Stripe / Binance / Bybit keep CTA gradients punchy
//    regardless of light or dark surface) ─────────────────────────────────
export const G  = "linear-gradient(135deg, #D24FE3 0%, #C13FE0 42%, #8B30C9 100%)";   // primary (violet)
export const GZ = "linear-gradient(135deg, #FF8A55 0%, #FF6B35 38%, #C13FE0 100%)";   // energy (ember → violet)
export const GM = "linear-gradient(135deg, #18E08A 0%, #1FD67A 60%, #0FA968 100%)";   // mint (money / success)

// ── Inputs ─────────────────────────────────────────────────────────────
export const IS = {
  width: "100%",
  background: "var(--zd-surface)",
  border: "1px solid var(--zd-border)",
  borderRadius: 12,
  padding: "11px 13px",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  color: "var(--zd-text)",
  transition: "border-color .16s ease, background .16s ease, box-shadow .16s ease",
};

// ── Root variable blocks for both themes + global keyframes ──────────────
// Same keyframe *names* as before (fadeIn, popIn, shimmer, confettiDrop,
// tdot, slideUp, scanl, toastProgress) so every existing `animation:` string
// keeps resolving — plus a handful of new, additive ones for the redesign.
export const THEME_VARS = `
@font-face { font-display: swap; }

:root[data-zd-theme="dark"]{
  --zd-bg: #07060c;
  --zd-bg-elevated: #0c0b16;
  --zd-surface: rgba(255,255,255,.04);
  --zd-surface-hover: rgba(255,255,255,.065);
  --zd-surface-1: #100f1d;
  --zd-border: rgba(255,255,255,.085);
  --zd-border-strong: rgba(255,255,255,.16);
  --zd-text: #F4F2FB;
  --zd-text-dim: rgba(244,242,251,.54);
  --zd-text-faint: rgba(244,242,251,.3);
  --zd-accent: #C13FE0;
  --zd-accent-2: #8B30C9;
  --zd-accent-soft: rgba(193,63,224,.14);
  --zd-success: #1FD67A;
  --zd-success-soft: rgba(31,214,122,.14);
  --zd-warning: #F5A623;
  --zd-warning-soft: rgba(245,166,35,.16);
  --zd-danger: #FF4D5E;
  --zd-danger-soft: rgba(255,77,94,.16);
  --zd-glow: rgba(193,63,224,.45);
  --zd-shadow: 0 8px 28px rgba(0,0,0,.40);
  --zd-shadow-lg: 0 24px 70px rgba(0,0,0,.55);
  --zd-overlay: rgba(0,0,0,.92);
  --zd-scrollbar: rgba(255,255,255,.14);
  color-scheme: dark;
}

:root[data-zd-theme="light"]{
  --zd-accent: #9B2BC4;
  --zd-accent-2: #7A22A8;
  --zd-accent-soft: rgba(155,43,196,.14);
  --zd-success: #0E9C61;
  --zd-success-soft: rgba(14,156,97,.14);
  --zd-warning: #B8740A;
  --zd-warning-soft: rgba(184,116,10,.16);
  --zd-danger: #DB2E45;
  --zd-danger-soft: rgba(219,46,69,.16);
  --zd-glow: rgba(155,43,196,.16);
  --zd-shadow: 0 4px 18px rgba(30,20,60,.07);
  --zd-shadow-lg: 0 24px 60px rgba(30,20,60,.13);
  --zd-overlay: rgba(255,255,255,.92);
  --zd-scrollbar: rgba(20,18,40,.16);
  color-scheme: light;

  --zd-overlay: rgba(255,255,255,.92);

  --zd-bg: #F5F4FA;
  --zd-bg-elevated: #FFFFFF;
  --zd-surface: rgba(20,18,40,.04);
  --zd-surface-hover: rgba(20,18,40,.07);
  --zd-surface-1: #FFFFFF;
  --zd-border: rgba(20,18,40,.10);
  --zd-border-strong: rgba(20,18,40,.18);
  --zd-text: #141226;
  --zd-text-dim: rgba(20,18,38,.58);
  --zd-text-faint: rgba(20,18,38,.38);
  --zd-accent: #9B2BC4;
  --zd-accent-2: #7A22A8;
  --zd-success: #0E9C61;
  --zd-warning: #B8740A;
  --zd-danger: #DB2E45;
  --zd-glow: rgba(155,43,196,.16);
  --zd-shadow: 0 4px 18px rgba(30,20,60,.07);
  --zd-shadow-lg: 0 24px 60px rgba(30,20,60,.13);
  --zd-scrollbar: rgba(20,18,40,.16);
  color-scheme: light;
}

html, body, #root { background: var(--zd-bg); }
body { -webkit-tap-highlight-color: transparent; }
*::selection { background: var(--zd-accent); color: #fff; }
*::-webkit-scrollbar { width: 7px; height: 7px; }
*::-webkit-scrollbar-thumb { background: var(--zd-scrollbar); border-radius: 8px; }
*::-webkit-scrollbar-track { background: transparent; }

[data-zd-theme] body, [data-zd-theme] {
  transition: background-color .35s ease, border-color .35s ease;
}
`;

export const CSS = `
${THEME_VARS}
@keyframes fadeIn       { from { opacity:0 } to { opacity:1 } }
@keyframes popIn        { 0%{opacity:0;transform:scale(.92)} 100%{opacity:1;transform:scale(1)} }
@keyframes shimmer      { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.18)} }
@keyframes confettiDrop { to { transform:translateY(110vh) rotate(420deg); opacity:0 } }
@keyframes tdot         { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-4px);opacity:1} }
@keyframes slideUp      { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
@keyframes scanl        { 0%{top:6%} 50%{top:88%} 100%{top:6%} }
@keyframes toastProgress{ from{width:100%} to{width:0%} }

@keyframes zdLift       { from{ transform:translateY(0) } to{ transform:translateY(-2px) } }
@keyframes zdPulseRing  { 0%{ box-shadow:0 0 0 0 var(--zd-glow) } 100%{ box-shadow:0 0 0 14px rgba(0,0,0,0) } }
@keyframes zdSpin       { to { transform: rotate(360deg) } }
@keyframes zdGlowSweep  { 0%{ background-position: 0% 50% } 100%{ background-position: 200% 50% } }
@keyframes zdSkeleton   { 0%{ background-position:-200px 0 } 100%{ background-position: calc(200px + 100%) 0 } }
@keyframes zdCheckDraw  { from { stroke-dashoffset: 24 } to { stroke-dashoffset: 0 } }

.zd-hide-scroll{ scrollbar-width:none; -ms-overflow-style:none; }
.zd-hide-scroll::-webkit-scrollbar{ display:none; }
.zd-tabular{ font-variant-numeric: tabular-nums; letter-spacing: .2px; }
`;