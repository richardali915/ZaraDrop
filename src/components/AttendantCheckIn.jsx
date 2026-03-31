import React, { useState } from "react";
import { CheckCircle, UserCheck } from "lucide-react";
import { C, GZ, CSS } from "../constants";
import { gl } from "../utils";
import { Btn } from "./Micro";

export default function AttendantCheckIn({ storeHook, onCheckedIn }) {
  const [sel,      setSel]      = useState(null);
  const [pin,      setPin]      = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [step,     setStep]     = useState("select"); // select | pin

  const { attendants = [] } = storeHook ?? {};
  const active = attendants.filter(a => a.is_active);

  const verifyAndCheckIn = async () => {
    if (!sel) return;
    setLoading(true); setError("");
    try {
      const ok = await storeHook.verifyAttendantPin(sel.id, pin);
      if (!ok) throw new Error("Wrong PIN — try again");
      onCheckedIn(sel);
    } catch (e) {
      setError(e.message);
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.97)",
      backdropFilter: "blur(24px)", display: "flex",
      alignItems: "center", justifyContent: "center",
      zIndex: 8000, padding: 20, animation: "fadeIn .25s ease",
    }}>
      <style>{CSS}</style>
      <div style={{ ...gl(), borderRadius: 24, padding: "24px 20px", width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: GZ, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 24, boxShadow: "0 6px 24px rgba(255,107,53,.4)" }}>🏪</div>
          <div style={{ fontWeight: 900, fontSize: 18, background: GZ, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Who's attending today?
          </div>
          <div style={{ fontSize: 12, color: C.su, marginTop: 4 }}>
            {step === "select" ? "Select your name to check in" : `Enter your PIN, ${sel?.name?.split(" ")[0]}`}
          </div>
        </div>

        {step === "select" && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {active.length === 0 && (
                <div style={{ textAlign: "center", padding: "20px", fontSize: 12, color: C.su }}>
                  No active attendants found. Please contact your Store Admin.
                </div>
              )}
              {active.map(att => (
                <div key={att.id} onClick={() => setSel(att)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderRadius: 13, cursor: "pointer", border: `1px solid ${sel?.id === att.id ? att.color + "50" : "rgba(255,255,255,.1)"}`, background: sel?.id === att.id ? `${att.color}12` : "rgba(255,255,255,.03)", transition: "all .16s" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${att.color}20`, border: `1px solid ${att.color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: att.color, flexShrink: 0 }}>
                    {att.name.split(" ").map(w => w[0]).join("")}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: C.tx, fontSize: 14 }}>{att.name}</div>
                    <div style={{ fontSize: 11, color: att.color, fontWeight: 600, marginTop: 1 }}>{att.role}</div>
                  </div>
                  {sel?.id === att.id && <CheckCircle size={18} color={att.color} />}
                </div>
              ))}
            </div>
            <Btn v="zap" full disabled={!sel} onClick={() => setStep("pin")}>
              <UserCheck size={14} />Continue
            </Btn>
          </>
        )}

        {step === "pin" && (
          <>
            {/* PIN dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 14 }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: i < pin.length ? C.ac : "rgba(255,255,255,.12)", transition: "background .14s", boxShadow: i < pin.length ? `0 0 10px ${C.ac}90` : "none" }} />
              ))}
            </div>
            {/* Keypad */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 12 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((d, i) => (
                <button key={i}
                  onClick={() => {
                    setError("");
                    if (d === "⌫") { setPin(s => s.slice(0, -1)); return; }
                    if (d === "") return;
                    const next = pin + d;
                    setPin(next);
                    if (next.length === 4) setTimeout(() => {
                      // auto-submit when 4 digits entered
                      storeHook.verifyAttendantPin(sel.id, next).then(ok => {
                        if (ok) onCheckedIn(sel);
                        else { setError("Wrong PIN — try again"); setPin(""); }
                      });
                    }, 150);
                  }}
                  style={{ padding: "12px", borderRadius: 11, border: `1px solid ${C.bd}`, background: d === "" ? "transparent" : "rgba(255,255,255,.05)", color: C.tx, fontSize: d === "⌫" ? 15 : 18, fontWeight: 700, cursor: d === "" ? "default" : "pointer", fontFamily: "inherit" }}>
                  {d}
                </button>
              ))}
            </div>
            {error && <div style={{ color: C.er, fontSize: 12, textAlign: "center", marginBottom: 8, fontWeight: 600 }}>{error}</div>}
            <button onClick={() => { setStep("select"); setPin(""); setError(""); }}
              style={{ background: "none", border: "none", color: C.su, fontSize: 12, cursor: "pointer", fontFamily: "inherit", width: "100%", textAlign: "center", padding: "6px 0" }}>
              ← Back to selection
            </button>
          </>
        )}

        <div style={{ fontSize: 10, color: "rgba(255,255,255,.2)", textAlign: "center", marginTop: 12 }}>
          Every session is tracked for accountability ⚡
        </div>
      </div>
    </div>
  );
}