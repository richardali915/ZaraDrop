import React, { useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { C, G } from "../../styles/tokens";
import { gl } from "../../styles/glass";
import { fmt } from "../../utils";

export const Pill = ({ label, color }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    background: `${color}1A`, color,
    border: `1px solid ${color}30`,
    borderRadius: 20, padding: "3px 9px 3px 7px",
    fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap",
    letterSpacing: .1,
  }}>
    <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
    {label}
  </span>
);

export const Tog = ({ on, tg, color = C.ok }) => (
  <div onClick={tg} role="switch" aria-checked={on} tabIndex={0}
    onKeyDown={e => (e.key === "Enter" || e.key === " ") && tg()}
    style={{
      width: 46, height: 26, borderRadius: 20,
      background: on ? color : "var(--zd-surface-hover)",
      border: `1px solid ${on ? color : "var(--zd-border)"}`,
      cursor: "pointer", position: "relative",
      transition: "background .22s ease, border-color .22s ease",
      flexShrink: 0, boxShadow: on ? `0 0 14px ${color}55` : "none",
      boxSizing: "border-box",
    }}>
    <div style={{
      position: "absolute", top: 2, left: on ? 21 : 2,
      width: 20, height: 20, borderRadius: "50%",
      background: "#fff", transition: "left .22s cubic-bezier(.34,1.4,.64,1)",
      boxShadow: "0 2px 6px rgba(0,0,0,.35)",
    }} />
  </div>
);

export const SH = ({ title, sub, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 9 }}>
    <div>
      <div style={{ fontSize: 14.5, fontWeight: 800, color: C.tx, letterSpacing: -.2 }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: C.su, marginTop: 2 }}>{sub}</div>}
    </div>
    {right || null}
  </div>
);

export const SC = ({ icon, label, value, color = C.ac, sub, onClick }) => {
  const [h, sh] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => sh(true)} onMouseLeave={() => sh(false)}
      style={{
        ...gl(), borderRadius: 13, padding: "10px 11px",
        flex: 1, minWidth: 76, cursor: onClick ? "pointer" : "default",
        transition: "transform .16s ease, box-shadow .16s ease, border-color .16s ease",
        transform: h && onClick ? "translateY(-2px)" : "none",
        borderColor: h ? `${color}35` : undefined,
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
        <div style={{
          width: 25, height: 25, borderRadius: 8,
          background: `${color}16`, border: `1px solid ${color}26`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color, flexShrink: 0, fontSize: 12,
        }}>{icon}</div>
        <span style={{ color: C.su, fontSize: 10, fontWeight: 600, letterSpacing: .1 }}>{label}</span>
      </div>
      <div className="zd-tabular" style={{ fontSize: 17.5, fontWeight: 800, color: C.tx, lineHeight: 1, letterSpacing: -.3 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: C.su, marginTop: 3 }}>{sub}</div>}
    </div>
  );
};

export const TR = ({ val, set }) => (
  <div style={{ display: "flex", gap: 3, background: "var(--zd-surface)", borderRadius: 20, padding: 3, border: "1px solid var(--zd-border)" }}>
    {["7d", "1m", "3m", "6m", "1y"].map(k => (
      <button key={k} onClick={() => set(k)} style={{
        padding: "4px 9px", borderRadius: 20,
        border: "none",
        background: val === k ? G : "transparent",
        color: val === k ? "#fff" : "var(--zd-text-dim)",
        fontSize: 9, fontWeight: val === k ? 700 : 600,
        cursor: "pointer", fontFamily: "inherit", transition: "all .15s ease",
        boxShadow: val === k ? "0 2px 10px rgba(193,63,224,.35)" : "none",
      }}>{k.toUpperCase()}</button>
    ))}
  </div>
);

export const CTip = ({ active, payload, label, color = C.ac }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ ...gl(), borderRadius: 10, padding: "7px 11px" }}>
      <div style={{ fontSize: 9, color: C.su, marginBottom: 1 }}>{label}</div>
      <div className="zd-tabular" style={{ fontSize: 12.5, fontWeight: 800, color }}>{fmt(payload[0].value)}</div>
    </div>
  );
};

export const Back = ({ onClick }) => (
  <button onClick={onClick} style={{
    background: "var(--zd-surface)",
    border: "1px solid var(--zd-border)",
    cursor: "pointer", width: 32, height: 32, borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: C.su, flexShrink: 0, transition: "background .15s ease, color .15s ease, transform .15s ease",
  }}
    onMouseEnter={e => { e.currentTarget.style.background = "var(--zd-surface-hover)"; e.currentTarget.style.color = C.tx; }}
    onMouseLeave={e => { e.currentTarget.style.background = "var(--zd-surface)"; e.currentTarget.style.color = C.su; }}
    onMouseDown={e => e.currentTarget.style.transform = "scale(.92)"}
    onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}>
    <ArrowLeft size={15} />
  </button>
);

export const FI = ({ label, val, set, ph, type = "text", opts }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{
      fontSize: 9.5, color: "var(--zd-text-faint)", fontWeight: 700,
      textTransform: "uppercase", letterSpacing: 1.1, marginBottom: 5,
    }}>{label}</div>
    {opts
      ? (
        <div style={{ position: "relative" }}>
          <select value={val} onChange={e => set(e.target.value)} style={{ ...IS_LOCAL, appearance: "none", cursor: "pointer" }}
            onFocus={e => { e.target.style.borderColor = "var(--zd-accent)"; e.target.style.boxShadow = "0 0 0 3px var(--zd-glow)"; }}
            onBlur={e => { e.target.style.borderColor = "var(--zd-border)"; e.target.style.boxShadow = "none"; }}>
            {opts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <ChevronDown size={14} color="var(--zd-text-faint)" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        </div>
      ) : (
        <input type={type} value={val} onChange={e => set(e.target.value)}
          placeholder={ph} style={IS_LOCAL}
          onFocus={e => { e.target.style.borderColor = "var(--zd-accent)"; e.target.style.boxShadow = "0 0 0 3px var(--zd-glow)"; }}
          onBlur={e => { e.target.style.borderColor = "var(--zd-border)"; e.target.style.boxShadow = "none"; }} />
      )}
  </div>
);

const IS_LOCAL = {
  width: "100%", background: "var(--zd-surface)",
  border: "1px solid var(--zd-border)", borderRadius: 11,
  padding: "10px 13px", fontSize: 12.5, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit", color: "var(--zd-text)",
  transition: "border-color .16s ease, box-shadow .16s ease",
};

export function Btn({ children, onClick, v = "p", sm, full, disabled, sx = {} }) {
  const [h, sh] = useState(false);
  const [pressed, sp] = useState(false);
  const V = {
    p:    { bg: h ? "linear-gradient(135deg,#D862E8,#9A3ED6)" : G,   fg: "#fff",                 br: "1px solid transparent",                bs: "0 6px 22px rgba(193,63,224,.32)" },
    g:    { bg: "transparent",                                        fg: "var(--zd-text-dim)",   br: "1px solid var(--zd-border-strong)",    bs: "none" },
    o:    { bg: h ? "rgba(193,63,224,.18)" : "rgba(193,63,224,.08)", fg: "var(--zd-accent)",     br: "1px solid rgba(193,63,224,.28)",       bs: "none" },
    ok:   { bg: h ? "rgba(31,214,122,.18)" : "rgba(31,214,122,.08)", fg: "var(--zd-success)",    br: "1px solid rgba(31,214,122,.28)",       bs: "none" },
    warn: { bg: h ? "rgba(245,166,35,.18)" : "rgba(245,166,35,.08)", fg: "var(--zd-warning)",    br: "1px solid rgba(245,166,35,.28)",       bs: "none" },
    zap:  { bg: h ? "linear-gradient(135deg,#FF9D6E,#D862E8)" : "linear-gradient(135deg,#FF6B35,#C13FE0)", fg: "#fff", br: "1px solid transparent", bs: "0 6px 22px rgba(255,107,53,.3)" },
    d:    { bg: "rgba(255,77,94,.09)",                                fg: "var(--zd-danger)",     br: "1px solid rgba(255,77,94,.24)",        bs: "none" },
    ghost:{ bg: h ? "var(--zd-surface-hover)" : "var(--zd-surface)",   fg: "var(--zd-text-dim)",   br: "1px solid var(--zd-border)",           bs: "none" },
  };
  const vv = V[v] || V.p;
  return (
    <button onClick={onClick}
      onMouseEnter={() => sh(true)} onMouseLeave={() => { sh(false); sp(false); }}
      onMouseDown={() => sp(true)} onMouseUp={() => sp(false)}
      disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "center",
        padding: sm ? "6px 12px" : "9.5px 16px",
        fontSize: sm ? 11.5 : 12.5, fontWeight: 700, borderRadius: 10,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "transform .14s ease, box-shadow .16s ease, background .16s ease",
        border: vv.br,
        background: disabled ? "var(--zd-surface)" : vv.bg,
        color: disabled ? "var(--zd-text-faint)" : vv.fg,
        boxShadow: disabled ? "none" : (h ? vv.bs : "none"),
        opacity: disabled ? .5 : 1,
        transform: !disabled && pressed ? "scale(.97)" : (!disabled && h ? "translateY(-1px)" : "none"),
        ...(full ? { width: "100%", boxSizing: "border-box" } : {}),
        fontFamily: "inherit", letterSpacing: .1, ...sx,
      }}>
      {children}
    </button>
  );
}

export function MiniChart({ data, color, range, setRange, title }) {
  const gradId = `mcg${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <div style={{ ...gl(), borderRadius: 16, padding: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontWeight: 700, color: C.tx, fontSize: 13 }}>{title || "📊 Activity"}</div>
        <TR val={range} set={setRange} />
      </div>
      <div style={{ height: 98 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.32} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="l" tick={{ fill: "var(--zd-text-faint)", fontSize: 8 }} axisLine={false} tickLine={false} />
            <Tooltip content={(p) => <CTip {...p} color={color} />} />
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2.25} fill={`url(#${gradId})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}