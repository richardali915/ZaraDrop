export const C = {
  bg: "#06060F",
  s1: "#0C0C1E",
  bd: "#1E1E3A",
  ac: "#C144D4",
  tx: "#EEF0FF",
  su: "rgba(255,255,255,.45)",
  mu: "rgba(255,255,255,.22)",
  ok: "#22D47C",
  wa: "#F59E0B",
  er: "#EF4444",
};

export const G = "linear-gradient(135deg,#C144D4,#8B30C9)";
export const GZ = "linear-gradient(135deg,#FF6B35,#C144D4)";

// Fixed: removed duplicate closing brace at end of modeIn keyframe
export const CSS = `*{box-sizing:border-box;margin:0;padding:0}body{background:#06060F}::-webkit-scrollbar{display:none}input,textarea,select{color:#EEF0FF!important;caret-color:#C144D4;background:rgba(255,255,255,.06)!important}input::placeholder,textarea::placeholder{color:rgba(255,255,255,.32)!important}select option{background:#0C0C1E;color:#EEF0FF}@keyframes tdot{0%,80%,100%{transform:scale(.7);opacity:.5}40%{transform:scale(1);opacity:1}}@keyframes scanl{0%{top:5%}50%{top:88%}100%{top:5%}}@keyframes pulse{0%,100%{opacity:.7}50%{opacity:1}}@keyframes fadeIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}@keyframes burst{0%{transform:scale(0) rotate(0deg);opacity:1}60%{transform:scale(1.4) rotate(180deg);opacity:1}100%{transform:scale(1) rotate(360deg);opacity:0}}@keyframes confettiDrop{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(140px) rotate(720deg);opacity:0}}@keyframes popIn{0%{transform:scale(0.3);opacity:0}60%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}@keyframes shimmer{0%,100%{opacity:.8}50%{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes modeIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}`;

export const IS = {
  background: "rgba(255,255,255,.06)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,.15)",
  borderRadius: 9,
  padding: "8px 11px",
  fontSize: 12.5,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  width: "100%",
  color: "#EEF0FF",
  transition: "border-color .15s",
};

export const DEMO = {
  rider: { id: "RD-00001", pin: "1234" },
  store: { id: "ST-0001", pass: "zara2024" },
  storeAdmin: { pass: "admin2024" },
};