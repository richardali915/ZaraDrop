import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { C, G, IS } from "../../constants";
import { fmt, gl } from "../../utils";

export const Pill = ({ label, color }) => (
  <span style={{
    background: `${color}1A`, color,
    border: `1px solid ${color}30`,
    borderRadius: 20, padding: "2px 7px",
    fontSize: 10, fontWeight: 700, whiteSpace: "nowrap",
  }}>{label}</span>
);

export const Tog = ({ on, tg, color = C.ok }) => (
  <div onClick={tg} style={{
    width: 44, height: 24, borderRadius: 20,
    background: on ? color : "rgba(255,255,255,.12)",
    cursor: "pointer", position: "relative",
    transition: "background .2s", flexShrink: 0,
    boxShadow: on ? `0 0 12px ${color}60` : "none",
  }}>
    <div style={{
      position: "absolute", top: 2, left: on ? 22 : 2,
      width: 20, height: 20, borderRadius: "50%",
      background: "#fff", transition: "left .2s",
      boxShadow: "0 1px 4px rgba(0,0,0,.4)",
    }} />
  </div>
);

export const SH = ({ title, sub, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
    <div>
      <div style={{ fontSize: 14, fontWeight: 800, color: C.tx }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: C.su, marginTop: 1 }}>{sub}</div>}
    </div>
    {right || null}
  </div>
);

export const SC = ({ icon, label, value, color = C.ac, sub, onClick }) => (
  <div onClick={onClick} style={{
    ...gl(), borderRadius: 11, padding: "8px 10px",
    flex: 1, minWidth: 70, cursor: onClick ? "pointer" : "default",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
      <div style={{
        width: 24, height: 24, borderRadius: 7,
        background: `${color}1A`, display: "flex",
        alignItems: "center", justifyContent: "center",
        color, flexShrink: 0, fontSize: 12,
      }}>{icon}</div>
      <span style={{ color: C.su, fontSize: 10, fontWeight: 600 }}>{label}</span>
    </div>
    <div style={{ fontSize: 17, fontWeight: 800, color: C.tx, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 10, color: C.su, marginTop: 2 }}>{sub}</div>}
  </div>
);

export const TR = ({ val, set }) => (
  <div style={{ display: "flex", gap: 3 }}>
    {["7d", "1m", "3m", "6m", "1y"].map(k => (
      <button key={k} onClick={() => set(k)} style={{
        padding: "3px 8px", borderRadius: 20,
        border: `1px solid ${val === k ? C.ac + "50" : "rgba(255,255,255,.12)"}`,
        background: val === k ? `${C.ac}18` : "transparent",
        color: val === k ? C.ac : "rgba(255,255,255,.38)",
        fontSize: 9, fontWeight: val === k ? 700 : 500,
        cursor: "pointer", fontFamily: "inherit", transition: "all .13s",
      }}>{k.toUpperCase()}</button>
    ))}
  </div>
);

export const CTip = ({ active, payload, label, color = C.ac }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ ...gl(), borderRadius: 9, padding: "6px 10px" }}>
      <div style={{ fontSize: 9, color: C.su }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 800, color }}>{fmt(payload[0].value)}</div>
    </div>
  );
};

export const Back = ({ onClick }) => (
  <button onClick={onClick} style={{
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.1)",
    cursor: "pointer", width: 30, height: 30, borderRadius: 9,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: C.su, flexShrink: 0, transition: "background .14s",
  }}
    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.1)"}
    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.06)"}>
    <ArrowLeft size={14} />
  </button>
);

export const FI = ({ label, val, set, ph, type = "text", opts }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{
      fontSize: 9, color: C.su, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: 1, marginBottom: 3,
    }}>{label}</div>
    {opts
      ? (
        <select value={val} onChange={e => set(e.target.value)} style={{ ...IS }}
          onFocus={e => e.target.style.borderColor = C.ac + "70"}
          onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.15)"}>
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={val} onChange={e => set(e.target.value)}
          placeholder={ph} style={{ ...IS }}
          onFocus={e => e.target.style.borderColor = C.ac + "70"}
          onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.15)"} />
      )}
  </div>
);

export function Btn({ children, onClick, v = "p", sm, full, disabled, sx = {} }) {
  const [h, sh] = useState(false);
  const V = {
    p:    { bg: h ? "linear-gradient(135deg,#D055E6,#9635CE)" : G,  fg: "#fff",                  br: "none",                          bs: "0 4px 18px rgba(193,68,212,.25)" },
    g:    { bg: "transparent",                                        fg: "rgba(255,255,255,.5)",  br: "1px solid rgba(255,255,255,.15)", bs: "none" },
    o:    { bg: h ? "rgba(193,68,212,.16)" : "rgba(193,68,212,.07)", fg: C.ac,                    br: "1px solid rgba(193,68,212,.25)", bs: "none" },
    ok:   { bg: h ? "rgba(34,212,124,.16)" : "rgba(34,212,124,.07)", fg: C.ok,                    br: "1px solid rgba(34,212,124,.25)", bs: "none" },
    warn: { bg: h ? "rgba(245,158,11,.16)" : "rgba(245,158,11,.07)", fg: C.wa,                    br: "1px solid rgba(245,158,11,.25)", bs: "none" },
    zap:  { bg: h ? "linear-gradient(135deg,#FF8C5A,#D055E6)" : "linear-gradient(135deg,#FF6B35,#C144D4)", fg: "#fff", br: "none",     bs: "0 4px 18px rgba(255,107,53,.25)" },
    d:    { bg: "rgba(239,68,68,.08)",                                fg: C.er,                    br: "1px solid rgba(239,68,68,.2)",  bs: "none" },
    ghost:{ bg: h ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.04)", fg: "rgba(255,255,255,.55)", br: "1px solid rgba(255,255,255,.12)", bs: "none" },
  };
  const vv = V[v] || V.p;
  return (
    <button onClick={onClick} onMouseEnter={() => sh(true)} onMouseLeave={() => sh(false)}
      disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5, justifyContent: "center",
        padding: sm ? "5px 10px" : "8px 14px",
        fontSize: sm ? 11 : 12, fontWeight: 700, borderRadius: 9,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all .16s", whiteSpace: "nowrap",
        border: vv.br,
        background: disabled ? "rgba(255,255,255,.04)" : vv.bg,
        color: disabled ? "rgba(255,255,255,.25)" : vv.fg,
        boxShadow: vv.bs, opacity: disabled ? 0.55 : 1,
        ...(full ? { width: "100%", boxSizing: "border-box" } : {}),
        fontFamily: "inherit", ...sx,
      }}>
      {children}
    </button>
  );
}

export function MiniChart({ data, color, range, setRange, title }) {
  const gradId = `mcg${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <div style={{ ...gl(), borderRadius: 15, padding: "13px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontWeight: 700, color: C.tx, fontSize: 13 }}>{title || "📊 Activity"}</div>
        <TR val={range} set={setRange} />
      </div>
      <div style={{ height: 95 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="l" tick={{ fill: "rgba(255,255,255,.35)", fontSize: 8 }} axisLine={false} tickLine={false} />
            <Tooltip content={(p) => <CTip {...p} color={color} />} />
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#${gradId})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}