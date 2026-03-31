import React, { useState, useRef, useEffect } from "react";
import { X, CheckCircle, Zap, DollarSign, Search } from "lucide-react";
import { C, CSS } from "../constants";
import { gl, fmt } from "../utils";
import { KNOWN_RIDERS } from "../data";
import { Back, FI, Btn, Pill } from "./Micro";

// ─── CONFETTI BURST ───
export function ConfettiBurst({ onDone }) {
  const pieces = ["🎉", "⭐", "✅", "💚", "🏍️", "💸", "⚡"];
  const cols = ["#22D47C", "#C144D4", "#F59E0B", "#FF6B35", "#fff", "#22D47C", "#EEF0FF"];
  const confetti = useRef(Array.from({ length: 22 }, (_, i) => ({
    left: 8 + ((i * 37 + 13) % 84),
    dur: 1.2 + ((i * 17) % 14) / 10,
    delay: ((i * 7) % 6) / 10,
  }))).current;

  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.88)",
      backdropFilter: "blur(8px)", display: "flex",
      alignItems: "center", justifyContent: "center",
      zIndex: 9990, flexDirection: "column",
    }}>
      <style>{CSS}</style>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {confetti.map((c, i) => (
          <div key={i} style={{
            position: "absolute", left: `${c.left}%`, top: "-10px",
            fontSize: i % 3 === 0 ? 18 : 14,
            animation: `confettiDrop ${c.dur}s ${c.delay}s ease-in forwards`,
            color: cols[i % cols.length],
          }}>
            {pieces[i % pieces.length]}
          </div>
        ))}
      </div>
      <div style={{ position: "relative", textAlign: "center", animation: "popIn .5s cubic-bezier(.34,1.56,.64,1) forwards" }}>
        <div style={{
          width: 120, height: 120, borderRadius: "50%",
          background: "linear-gradient(135deg,rgba(34,212,124,.3),rgba(34,212,124,.1))",
          border: "3px solid #22D47C",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
          boxShadow: "0 0 60px rgba(34,212,124,.6),0 0 120px rgba(34,212,124,.2)",
          animation: "shimmer 1s ease-in-out infinite",
        }}>
          <span style={{ fontSize: 52 }}>✅</span>
        </div>
        <div style={{ fontWeight: 900, fontSize: 22, color: "#22D47C", marginBottom: 6, letterSpacing: -0.5 }}>
          Order Delivered!
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)" }}>Customer confirmed ⚡</div>
      </div>
    </div>
  );
}

// ─── ORDER CODE INPUT ───
export function OrderCodeInput({ expectedCode, onVerified, onCancel }) {
  const [code, sCode] = useState("");
  const [err, sErr] = useState("");
  const [shake, sShake] = useState(false);

  const verify = () => {
    if (code.trim() === expectedCode) { onVerified(); }
    else {
      sErr("Wrong code — ask the customer");
      sShake(true);
      setTimeout(() => { sErr(""); sCode(""); sShake(false); }, 1200);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.92)",
      backdropFilter: "blur(18px)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 9000, padding: 20,
    }}>
      <style>{CSS}</style>
      <div style={{
        ...gl(), borderRadius: 24, padding: "24px 20px",
        width: "100%", maxWidth: 310, textAlign: "center",
        animation: shake ? "none" : "popIn .3s ease",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 15,
          background: "rgba(34,212,124,.15)",
          border: "1px solid rgba(34,212,124,.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 12px", fontSize: 24,
        }}>🔑</div>
        <div style={{ fontWeight: 800, fontSize: 16, color: C.tx, marginBottom: 4 }}>Enter Order Code</div>
        <div style={{ fontSize: 11, color: C.su, marginBottom: 18, lineHeight: 1.6 }}>
          Ask the customer for their 4-digit delivery code to confirm you&#39;ve completed this drop.
        </div>
        <input
          value={code}
          onChange={e => sCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="0000"
          maxLength={4}
          style={{
            background: "rgba(255,255,255,.06)",
            backdropFilter: "blur(10px)",
            border: `2px solid ${err ? "rgba(239,68,68,.5)" : "rgba(255,255,255,.15)"}`,
            borderRadius: 9, padding: "12px",
            textAlign: "center", fontSize: 28, fontWeight: 900, letterSpacing: 8,
            marginBottom: 8, outline: "none", boxSizing: "border-box",
            fontFamily: "inherit", width: "100%", color: "#EEF0FF",
            transition: "border-color .2s",
          }}
          onFocus={e => e.target.style.borderColor = C.ok + "80"}
          onBlur={e => e.target.style.borderColor = err ? "rgba(239,68,68,.5)" : "rgba(255,255,255,.15)"}
        />
        {err && (
          <div style={{ color: C.er, fontSize: 12, marginBottom: 10, fontWeight: 600, animation: "popIn .2s ease" }}>
            {err}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: err ? 0 : 8 }}>
          <Btn v="ghost" onClick={onCancel}>← Back</Btn>
          <Btn v="ok" full disabled={code.length !== 4} onClick={verify}>
            <CheckCircle size={13} />Confirm Code
          </Btn>
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.22)", marginTop: 12 }}>
          The customer sees this code in their order details ⚡
        </div>
      </div>
    </div>
  );
}

// ─── REQUEST RIDER MODAL (Customer) ───
export function RequestRiderModal({ onClose }) {
  const [sel, sSel] = useState(null);
  const [step, sStep] = useState("select");
  const [from, sFrom] = useState("");
  const [to, sTo] = useState("");
  const [item, sItem] = useState("");
  const [note, sNote] = useState("");
  const [riderQ, sRiderQ] = useState("");

  const allRiders = [
    ...KNOWN_RIDERS,
    { id: "RD-00055", name: "Bello Ibrahim", rating: 4.7, trips: 63, area: "Any area", vehicle: "Motorcycle", online: true, avatar: "🏍️" },
    { id: "RD-00071", name: "Amaka Osei", rating: 4.8, trips: 102, area: "Any area", vehicle: "Car", online: true, avatar: "🚗" },
    { id: "RD-00012", name: "Chukwuemeka D.", rating: 4.6, trips: 188, area: "Any area", vehicle: "Motorcycle", online: false, avatar: "🏍️" },
  ];

  const filteredRiders = allRiders.filter(r =>
    !riderQ || r.name.toLowerCase().includes(riderQ.toLowerCase()) || r.id.toLowerCase().includes(riderQ.toLowerCase())
  );

  if (step === "sent") {
    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.88)",
        backdropFilter: "blur(16px)", display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: 950, padding: 20,
      }}>
        <style>{CSS}</style>
        <div style={{ ...gl(), borderRadius: 22, padding: "28px 22px", width: "100%", maxWidth: 340, textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🎯</div>
          <div style={{ fontWeight: 900, fontSize: 18, color: C.tx, marginBottom: 6 }}>Request Sent!</div>
          <div style={{ fontSize: 12, color: C.su, lineHeight: 1.7, marginBottom: 20 }}>
            Request sent to <span style={{ color: C.ok, fontWeight: 700 }}>{sel?.name}</span>. They&#39;ll quote you a price shortly.
          </div>
          <Btn v="ok" full onClick={onClose}>Got it ✓</Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.88)",
      backdropFilter: "blur(16px)", display: "flex",
      alignItems: "flex-end", justifyContent: "center", zIndex: 950,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <style>{CSS}</style>
      <div style={{
        background: "#0D0D22", border: "1px solid #252548",
        borderRadius: "22px 22px 0 0", padding: "18px 14px 30px",
        width: "100%", maxWidth: 480, maxHeight: "92vh",
        overflowY: "auto", boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.tx }}>⚡ Request a Rider</div>
            <div style={{ fontSize: 11, color: C.su, marginTop: 2 }}>Pick your rider — they set their price</div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)",
            cursor: "pointer", width: 30, height: 30, borderRadius: 9,
            display: "flex", alignItems: "center", justifyContent: "center", color: C.su,
          }}><X size={13} /></button>
        </div>

        <div style={{
          background: "linear-gradient(135deg,rgba(255,107,53,.12),rgba(193,68,212,.12))",
          border: "1px solid rgba(255,107,53,.2)", borderRadius: 13,
          padding: "10px 12px", marginBottom: 14, fontSize: 11, color: C.su, lineHeight: 1.6,
        }}>
          <span style={{ color: "#FF6B35", fontWeight: 700 }}>⚡ ZaraDrop Exclusive —</span> Pick your rider and negotiate live.
        </div>

        {step === "select" && (
          <>
            <div style={{ position: "relative", marginBottom: 8 }}>
              <Search size={11} color="rgba(255,255,255,.28)" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }} />
              <input value={riderQ} onChange={e => sRiderQ(e.target.value)}
                placeholder="Search any rider by name or ID…"
                style={{
                  width: "100%", background: "rgba(255,255,255,.06)",
                  border: "1px solid rgba(255,255,255,.12)", borderRadius: 9,
                  padding: "7px 10px 7px 28px", fontSize: 11, outline: "none",
                  boxSizing: "border-box", fontFamily: "inherit", color: "#EEF0FF",
                }}
                onFocus={e => e.target.style.borderColor = C.ac + "60"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.12)"} />
            </div>
            <div style={{ ...gl("ok"), borderRadius: 9, padding: "7px 10px", marginBottom: 8, fontSize: 10, color: C.su, lineHeight: 1.5 }}>
              🌍 <strong style={{ color: C.ok }}>No location limit.</strong> Request any rider — some customers prefer riders they know.
            </div>
            <div style={{ fontSize: 9, color: C.su, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              {filteredRiders.length} rider{filteredRiders.length !== 1 ? "s" : ""} available
            </div>
            {filteredRiders.map(r => (
              <div key={r.id} onClick={() => sSel(r)} style={{
                ...gl(), border: `1px solid ${sel?.id === r.id ? C.ok + "50" : "rgba(255,255,255,.08)"}`,
                borderRadius: 14, padding: "12px", marginBottom: 8,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 11,
                background: sel?.id === r.id ? "rgba(34,212,124,.06)" : "transparent",
                transition: "all .16s",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 13,
                  background: "rgba(34,212,124,.1)", border: "1px solid rgba(34,212,124,.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, flexShrink: 0,
                }}>{r.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: C.tx, fontSize: 13 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: C.su, marginTop: 2 }}>⭐ {r.rating} · {r.trips} trips · {r.area}</div>
                  <div style={{ fontSize: 10, color: r.online ? C.ok : C.su, marginTop: 2, fontWeight: 600 }}>
                    {r.vehicle} · {r.online ? "🟢 Online" : "⚫ Offline"}
                  </div>
                </div>
                {sel?.id === r.id && <CheckCircle size={18} color={C.ok} />}
              </div>
            ))}
            <Btn v="ok" full disabled={!sel} sx={{ marginTop: 6 }} onClick={() => sStep("details")}>
              Continue with {sel?.name || "Rider"} →
            </Btn>
          </>
        )}

        {step === "details" && (
          <>
            <div style={{ ...gl("ok"), borderRadius: 12, padding: "10px 12px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>{sel.avatar}</span>
              <div>
                <div style={{ fontWeight: 700, color: C.tx, fontSize: 13 }}>{sel.name}</div>
                <div style={{ fontSize: 10, color: C.ok }}>⭐ {sel.rating} · Will quote after reviewing your request</div>
              </div>
            </div>
            <FI label="Pickup Location" val={from} set={sFrom} ph="Full pickup address in Abuja" />
            <FI label="Delivery Destination" val={to} set={sTo} ph="Full delivery address" />
            <FI label="What to Deliver" val={item} set={sItem} ph="e.g. Documents, small package, parcel…" />
            <FI label="Special Instructions (Optional)" val={note} set={sNote} ph="e.g. Fragile, call on arrival…" />
            <div style={{ ...gl(), borderRadius: 11, padding: "10px 12px", marginBottom: 14, fontSize: 11, color: C.su, lineHeight: 1.7 }}>
              💡 {sel.name} will review and send a quote. No obligation until you agree.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn v="ghost" onClick={() => sStep("select")}>← Back</Btn>
              <Btn v="zap" full disabled={!from.trim() || !to.trim() || !item.trim()} onClick={() => sStep("sent")}>
                <Zap size={13} />Send Request
              </Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── RIDER QUOTE MODAL (Rider-side) ───
export function RiderQuoteModal({ req, onDecline, onAccept }) {
  const [price, sPrice] = useState("");
  const [reason, sReason] = useState("");
  const [mode, sMode] = useState("review");
  

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.88)",
      backdropFilter: "blur(16px)", display: "flex",
      alignItems: "flex-end", justifyContent: "center", zIndex: 950,
    }}>
      <style>{CSS}</style>
      <div style={{
        background: "#0D0D22", border: "1px solid #252548",
        borderRadius: "22px 22px 0 0", padding: "18px 14px 30px",
        width: "100%", maxWidth: 480, maxHeight: "90vh",
        overflowY: "auto", boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: C.tx }}>⚡ Custom Delivery Request</div>
          <Pill label="New Request" color={C.wa} />
        </div>
        <div style={{ ...gl("zap"), borderRadius: 13, padding: "13px", marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: "rgba(255,107,53,.8)", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
            REQUEST FROM {req.cust.toUpperCase()}
          </div>
          {[["📍 Pickup", req.from], ["🏁 Deliver To", req.to], ["📦 Item", req.item], req.note && ["📝 Note", req.note]].filter(Boolean).map(([l, v]) => (
            <div key={l} style={{ marginBottom: 7 }}>
              <div style={{ fontSize: 9, color: C.su, marginBottom: 2 }}>{l}</div>
              <div style={{ fontSize: 12, color: C.tx, fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>
        {mode === "review" && (
          <div style={{ display: "flex", gap: 8 }}>
            <Btn v="d" full onClick={() => sMode("decline")}>✗ Decline</Btn>
            <Btn v="ok" full onClick={() => sMode("quote")}><DollarSign size={13} />Set My Price</Btn>
          </div>
        )}
        {mode === "decline" && (
          <>
            <FI label="Reason (helps the customer)" val={reason} set={sReason} ph="e.g. Too far from my current area…" />
            <div style={{ display: "flex", gap: 8 }}>
              <Btn v="ghost" onClick={() => sMode("review")}>← Back</Btn>
              <Btn v="d" full disabled={!reason.trim()} onClick={() => onDecline(reason)}>Send Decline</Btn>
            </div>
          </>
        )}
        {mode === "quote" && (
          <>
            <div style={{ ...gl(), borderRadius: 12, padding: "13px", marginBottom: 12 }}>
              <div style={{ fontSize: 9, color: C.su, fontWeight: 700, letterSpacing: 1, marginBottom: 5 }}>YOUR DELIVERY PRICE (₦)</div>
              <input value={price} onChange={e => sPrice(e.target.value.replace(/\D/g, ""))}
                placeholder="0"
                style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 32, fontWeight: 900, color: C.ok, fontFamily: "inherit" }} />
              <div style={{ fontSize: 11, color: C.su, marginTop: 4 }}>You keep 70% — ZaraDrop takes 30%</div>
              {price && <div style={{ fontSize: 11, color: C.ok, marginTop: 2, fontWeight: 700 }}>
                Your earnings: ₦{Number(Math.floor(+price * 0.7)).toLocaleString()}
              </div>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn v="ghost" onClick={() => sMode("review")}>← Back</Btn>
              <Btn v="ok" full disabled={!price || +price < 200} onClick={() => onAccept(+price)}>
                <Zap size={13} />Send Quote · {price ? `₦${Number(+price).toLocaleString()}` : ""}
              </Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}