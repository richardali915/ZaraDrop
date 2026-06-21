import React, { useState } from "react";
import { C, G, CSS } from "../../constants";

export default function PINModal({ title, sub, onOk, onCancel, stored }) {
  const [p, sP] = useState("");
  const [err, sE] = useState("");

  const tap = (d) => {
    if (p.length >= 4) return;
    const n = p + d;
    sP(n);
    if (n.length === 4) {
      if (!stored || n === stored) setTimeout(() => onOk(n), 180);
      else { sE("Wrong PIN"); setTimeout(() => { sP(""); sE(""); }, 900); }
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.93)",
      backdropFilter: "blur(18px)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 9999, padding: 20,
      animation: "fadeIn .2s ease",
    }}>
      <style>{CSS}</style>
      <div style={{
        background: "rgba(255,255,255,.04)", backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,.08)",
        boxShadow: "0 8px 28px rgba(0,0,0,.4)",
        borderRadius: 24, padding: "24px 20px",
        width: "100%", maxWidth: 270, textAlign: "center",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, background: G,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 12px", fontSize: 20,
          boxShadow: "0 6px 24px rgba(193,68,212,.45)",
        }}>🔒</div>
        <div style={{ fontWeight: 800, fontSize: 15, color: C.tx }}>{title || "Enter PIN"}</div>
        {sub && <div style={{ fontSize: 11, color: C.su, marginTop: 2, marginBottom: 4 }}>{sub}</div>}
        <div style={{ fontSize: 11, color: C.su, marginBottom: 14, marginTop: sub ? 0 : 3 }}>4-digit ZaraDrop PIN</div>

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 14 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: 12, height: 12, borderRadius: "50%",
              background: i < p.length ? C.ac : "rgba(255,255,255,.12)",
              transition: "background .14s",
              boxShadow: i < p.length ? `0 0 10px ${C.ac}90` : "none",
            }} />
          ))}
        </div>
        {err && <div style={{ color: C.er, fontSize: 11, marginBottom: 8, fontWeight: 600 }}>{err}</div>}

        {/* Keypad */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 12 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((d, i) => (
            <button key={i}
              onClick={() => d === "⌫" ? sP(s => s.slice(0, -1)) : d !== "" && tap(String(d))}
              style={{
                padding: "11px", borderRadius: 11,
                border: `1px solid ${C.bd}`,
                background: d === "" ? "transparent" : "rgba(255,255,255,.05)",
                color: C.tx, fontSize: d === "⌫" ? 15 : 18,
                fontWeight: 700, cursor: d === "" ? "default" : "pointer",
                fontFamily: "inherit", transition: "background .12s",
              }}
              onMouseEnter={e => { if (d !== "") e.currentTarget.style.background = "rgba(255,255,255,.12)"; }}
              onMouseLeave={e => e.currentTarget.style.background = d === "" ? "transparent" : "rgba(255,255,255,.05)"}>
              {d}
            </button>
          ))}
        </div>
        <button onClick={onCancel} style={{
          background: "none", border: "none", color: C.su,
          fontSize: 12, cursor: "pointer", fontFamily: "inherit", padding: "4px 0",
        }}>Cancel</button>
      </div>
    </div>
  );
}