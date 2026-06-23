// src/styles/glass.js
// ─────────────────────────────────────────────────────────────────────────
// Premium "glass surface" generator — same call signature as the original
// gl()/gl("ok")/gl("wa")/gl("zap") helper, upgraded with a richer, theme-
// reactive material (blur + saturation + soft elevation) so every card in
// the app instantly looks more premium in both light and dark mode.
// ─────────────────────────────────────────────────────────────────────────

const TINT = {
  default: { border: "var(--zd-border)",              tint: "var(--zd-surface)" },
  ok:      { border: "rgba(31,214,122,.24)",           tint: "rgba(31,214,122,.055)" },
  wa:      { border: "rgba(245,166,35,.26)",            tint: "rgba(245,166,35,.06)" },
  er:      { border: "rgba(255,77,94,.26)",             tint: "rgba(255,77,94,.06)" },
  ac:      { border: "rgba(193,63,224,.26)",            tint: "rgba(193,63,224,.06)" },
  zap:     { border: "rgba(255,107,53,.24)",            tint: "linear-gradient(135deg, rgba(255,107,53,.07), rgba(193,63,224,.05))" },
};

/**
 * gl(tint?) → style object to spread into a card-like element.
 * tint: undefined | "ok" | "wa" | "er" | "ac" | "zap"
 */
export function gl(tint) {
  const t = TINT[tint] || TINT.default;
  return {
    background: t.tint,
    backgroundColor: tint ? undefined : "var(--zd-surface)",
    backdropFilter: "blur(22px) saturate(160%)",
    WebkitBackdropFilter: "blur(22px) saturate(160%)",
    border: `1px solid ${t.border}`,
    boxShadow: "var(--zd-shadow)",
  };
}

/** Gradient hairline border card (the app's signature "aurora edge" treatment). */
export function glEdge(angle = 135) {
  return {
    position: "relative",
    background: "var(--zd-surface-1)",
    border: "1px solid transparent",
    backgroundImage: `linear-gradient(var(--zd-surface-1), var(--zd-surface-1)), linear-gradient(${angle}deg, #C13FE0, #FF6B35)`,
    backgroundOrigin: "border-box",
    backgroundClip: "padding-box, border-box",
    boxShadow: "var(--zd-shadow)",
  };
}

/** Soft elevated solid surface (for menus, sheets, popovers). */
export function solid() {
  return {
    background: "var(--zd-surface-1)",
    border: "1px solid var(--zd-border)",
    boxShadow: "var(--zd-shadow-lg)",
  };
}

export default gl;