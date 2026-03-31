import React, { useState } from "react";
import { Camera } from "lucide-react";
import { C, CSS } from "../constants";
import { Btn } from "./Micro";

export default function FaceScan({ color, onDone }) {
  const [st, sSt] = useState("idle");

  const go = () => {
    sSt("scanning");
    setTimeout(() => { sSt("done"); setTimeout(onDone, 500); }, 2600);
  };

  const brd = st === "done" ? C.ok : st === "scanning" ? color : "rgba(255,255,255,.2)";

  return (
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      <style>{CSS}</style>
      <div style={{
        width: 144, height: 176, borderRadius: 72,
        border: `3px solid ${brd}`, position: "relative",
        margin: "0 auto 16px", overflow: "hidden",
        background: "rgba(0,0,0,.4)",
        boxShadow: st !== "idle" ? `0 0 32px ${brd}50` : "",
        transition: "border-color .4s,box-shadow .4s",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 56,
        }}>
          {st === "done" ? "✅" : "👤"}
        </div>
        {st === "scanning" && (
          <div style={{
            position: "absolute", left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg,transparent,${color},transparent)`,
            animation: "scanl 1.4s ease-in-out infinite",
            boxShadow: `0 0 12px ${color}`,
          }} />
        )}
        {["tl", "tr", "bl", "br"].map(p => (
          <div key={p} style={{
            position: "absolute",
            top: p[0] === "t" ? 10 : "auto",
            bottom: p[0] === "b" ? 10 : "auto",
            left: p[1] === "l" ? 10 : "auto",
            right: p[1] === "r" ? 10 : "auto",
            width: 20, height: 20,
            borderTop: p[0] === "t" ? `2px solid ${brd}` : "none",
            borderLeft: p[1] === "l" ? `2px solid ${brd}` : "none",
            borderBottom: p[0] === "b" ? `2px solid ${brd}` : "none",
            borderRight: p[1] === "r" ? `2px solid ${brd}` : "none",
            transition: "border-color .4s",
          }} />
        ))}
      </div>
      <div style={{ fontSize: 12, color: C.su, marginBottom: 16, lineHeight: 1.6 }}>
        {st === "idle" ? "Position your face in the frame"
          : st === "scanning" ? "Scanning — hold still…"
          : "✓ Identity verified!"}
      </div>
      {st === "idle" && (
        <Btn v="p" onClick={go}><Camera size={13} />Start Face Scan</Btn>
      )}
    </div>
  );
}