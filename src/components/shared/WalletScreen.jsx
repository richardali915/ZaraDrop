import React, { useState } from "react";
import { Eye, EyeOff, Plus, Copy, ChevronRight } from "lucide-react";
import { C } from "../../constants";
import { gl } from "../../utils";
import { Back, Btn, MiniChart } from "./Micro";

export default function WalletScreen({ wallet: wHook, role }) {
  const [sub,    setSub]    = useState("home");
  const [showBal,sBal]      = useState(true);
  const [range,  setRange]  = useState("1m");
  const [amt,    setAmt]    = useState("");
  const [sendTo, setSendTo] = useState("");
  const [sendAmt,setSAmt]   = useState("");
  const [pin,    setPin]    = useState("");
  const [pinStep,setPinStep]= useState(null); // { action, payload }
  const [err,    setErr]    = useState("");
  const [loading,setLoad]   = useState(false);
  const [bankResult, setBankResult] = useState(null);

  const cc      = role === "rider" ? C.ok : role === "store" ? C.wa : C.ac;
  const balance = wHook.balance ?? 0;
  const txns    = wHook.txns ?? [];

  const fmtK = (k) => `₦${(k / 100).toLocaleString("en-NG")}`;
  const tin  = txns.filter(t => t.type === "credit").reduce((a, t) => a + t.amount, 0);
  const tout = txns.filter(t => t.type === "debit").reduce((a, t) => a + t.amount, 0);

  // Build chart-compatible data from real transactions
  const buildChartData = () => {
    const now = new Date();
    const weeks = [0, 1, 2, 3].map(i => {
      const start = new Date(now); start.setDate(start.getDate() - (i + 1) * 7);
      const end   = new Date(now); end.setDate(end.getDate() - i * 7);
      const v = txns.filter(t => {
        const d = new Date(t.created_at);
        return d >= start && d < end && t.type === "credit";
      }).reduce((a, t) => a + t.amount, 0);
      return { l: `W${4 - i}`, v };
    }).reverse();
    return weeks;
  };

  const handleTopUp = async () => {
    if (!amt || +amt < 100) { setErr("Minimum top-up is ₦100"); return; }
    setLoad(true); setErr("");
    try {
      await wHook.topUp(+amt, "4521", "Visa");
      setAmt(""); setSub("home");
    } catch (e) { setErr(e.message); }
    finally { setLoad(false); }
  };

  const handleSend = async () => {
    if (!sendTo || !sendAmt) return;
    setLoad(true); setErr("");
    try {
      await wHook.sendMoney(sendTo, +sendAmt);
      setSendTo(""); setSAmt(""); setSub("home");
    } catch (e) { setErr(e.message); }
    finally { setLoad(false); }
  };

  const handleBankDetails = async () => {
    try {
      const res = await wHook.getBankDetails();
      setBankResult(res);
      setSub("topup_bank");
    } catch (e) { setErr(e.message); }
  };

  if (sub === "topup") return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
        <Back onClick={() => setSub("home")} />
        <div style={{ fontWeight: 800, fontSize: 15, color: C.tx }}>Add Money</div>
      </div>
      {[{ i: "💳", l: "Debit / Credit Card", s: "Instant funding", k: "topup_card" }, { i: "🏦", l: "Bank Transfer", s: "5 minutes via NEFT", k: "bank" }].map(m => (
        <div key={m.k} onClick={() => m.k === "bank" ? handleBankDetails() : setSub(m.k)}
          style={{ ...gl(), borderRadius: 14, padding: "14px", marginBottom: 9, cursor: "pointer", display: "flex", alignItems: "center", gap: 11 }}>
          <span style={{ fontSize: 22 }}>{m.i}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.tx }}>{m.l}</div>
            <div style={{ fontSize: 11, color: C.su, marginTop: 1 }}>{m.s}</div>
          </div>
          <ChevronRight size={14} color={C.su} />
        </div>
      ))}
    </div>
  );

  if (sub === "topup_card") return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
        <Back onClick={() => setSub("topup")} />
        <div style={{ fontWeight: 800, fontSize: 15, color: C.tx }}>Card Top-up</div>
      </div>
      <div style={{ ...gl(), borderRadius: 14, padding: "15px", marginBottom: 11 }}>
        <div style={{ fontSize: 9, color: C.su, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>AMOUNT (₦)</div>
        <input value={amt} onChange={e => { setAmt(e.target.value.replace(/\D/g, "")); setErr(""); }} placeholder="0"
          style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 32, fontWeight: 800, color: C.tx, fontFamily: "inherit" }} />
        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
          {["500", "1000", "2000", "5000", "10000"].map(a => (
            <button key={a} onClick={() => setAmt(a)} style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${C.bd}`, background: "rgba(255,255,255,.04)", color: "rgba(255,255,255,.65)", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
              ₦{Number(a).toLocaleString()}
            </button>
          ))}
        </div>
      </div>
      {err && <div style={{ color: C.er, fontSize: 12, marginBottom: 8 }}>{err}</div>}
      <Btn v="p" full disabled={loading || !amt || +amt < 100} onClick={handleTopUp}>
        {loading ? "Processing…" : `Top up ₦${amt ? Number(amt).toLocaleString() : "0"}`}
      </Btn>
    </div>
  );

  if (sub === "topup_bank") return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
        <Back onClick={() => setSub("topup")} />
        <div style={{ fontWeight: 800, fontSize: 15, color: C.tx }}>Bank Transfer</div>
      </div>
      <div style={{ ...gl("ok"), borderRadius: 16, padding: "22px", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: C.su, marginBottom: 6 }}>Transfer to this account</div>
        <div style={{ fontSize: 13, color: C.tx, fontWeight: 700, marginBottom: 5 }}>
          {bankResult?.account_name ?? "ZaraDrop Payments Ltd"}
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: C.ok, letterSpacing: 3, marginBottom: 5 }}>
          {bankResult?.account_number ?? "0123 456 789"}
        </div>
        <div style={{ fontSize: 12, color: C.su, marginBottom: 13 }}>{bankResult?.bank ?? "Wema Bank"}</div>
        <Btn v="ok" sm onClick={() => navigator.clipboard?.writeText(bankResult?.account_number ?? "0123456789")}>
          <Copy size={11} />Copy Account
        </Btn>
        {bankResult?.reference && (
          <div style={{ ...gl(), borderRadius: 10, padding: "10px 12px", marginTop: 14, fontSize: 11, color: C.su, lineHeight: 1.7 }}>
            Use reference <strong style={{ color: C.wa }}>{bankResult.reference}</strong> as your narration.
          </div>
        )}
        <div style={{ fontSize: 11, color: C.su, marginTop: 13, lineHeight: 1.7 }}>Funds reflect within 5 minutes ⚡</div>
      </div>
    </div>
  );

  if (sub === "send") return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
        <Back onClick={() => setSub("home")} />
        <div style={{ fontWeight: 800, fontSize: 15, color: C.tx }}>Send Money</div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 9, color: C.su, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>RECIPIENT PHONE</div>
        <input value={sendTo} onChange={e => { setSendTo(e.target.value); setErr(""); }} placeholder="+234 800 000 0000"
          style={{ width: "100%", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 9, padding: "8px 11px", fontSize: 12.5, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#EEF0FF" }} />
      </div>
      <div style={{ ...gl(), borderRadius: 14, padding: "15px", marginBottom: 11 }}>
        <div style={{ fontSize: 9, color: C.su, fontWeight: 700, letterSpacing: 1, marginBottom: 5 }}>AMOUNT (₦)</div>
        <input value={sendAmt} onChange={e => { setSAmt(e.target.value.replace(/\D/g, "")); setErr(""); }} placeholder="0"
          style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 32, fontWeight: 800, color: C.tx, fontFamily: "inherit" }} />
        <div style={{ fontSize: 11, color: C.su, marginTop: 5 }}>Available: ₦{balance.toLocaleString()}</div>
      </div>
      {err && <div style={{ color: C.er, fontSize: 12, marginBottom: 8 }}>{err}</div>}
      <Btn v="p" full disabled={loading || !sendTo || !sendAmt || +sendAmt < 100 || +sendAmt > balance} onClick={handleSend}>
        {loading ? "Sending…" : `Send ₦${sendAmt ? Number(sendAmt).toLocaleString() : ""}`}
      </Btn>
    </div>
  );

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* Balance card */}
      <div style={{ background: "linear-gradient(135deg,rgba(193,68,212,.24),rgba(139,48,201,.1))", border: "1px solid rgba(193,68,212,.3)", borderRadius: 22, padding: "18px", marginBottom: 13, position: "relative", overflow: "hidden", boxShadow: "0 14px 44px rgba(193,68,212,.16)" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 140, height: 140, borderRadius: "50%", background: "rgba(193,68,212,.07)", pointerEvents: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.45)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>ZaraDrop Wallet</div>
          <button onClick={() => sBal(!showBal)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.4)", display: "flex", padding: 2 }}>
            {showBal ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
        </div>
        <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: -1, marginBottom: 11 }}>
          {showBal ? `₦${balance.toLocaleString()}` : "₦••••••"}
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <div><div style={{ fontSize: 9, color: "rgba(255,255,255,.4)" }}>Money In</div><div style={{ fontSize: 13, fontWeight: 700, color: C.ok }}>+{fmtK(tin)}</div></div>
          <div style={{ width: 1, background: "rgba(255,255,255,.1)" }} />
          <div><div style={{ fontSize: 9, color: "rgba(255,255,255,.4)" }}>Money Out</div><div style={{ fontSize: 13, fontWeight: 700, color: C.er }}>-{fmtK(tout)}</div></div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 7, marginBottom: 13 }}>
        {[{ i: "⬆️", l: "Top Up", g: () => setSub("topup") }, { i: "📤", l: "Send", g: () => setSub("send") }, { i: "📥", l: "Withdraw", g: () => setSub("topup_bank") }, { i: "📋", l: "History", g: () => {} }].map(a => (
          <button key={a.l} onClick={a.g} style={{ ...gl(), border: "none", borderRadius: 13, padding: "11px 4px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontFamily: "inherit", transition: "background .14s" }}>
            <span style={{ fontSize: 18 }}>{a.i}</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,.6)", fontWeight: 700 }}>{a.l}</span>
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ marginBottom: 13 }}>
        <MiniChart data={buildChartData()} color={cc} range={range} setRange={setRange} title="📊 Activity" />
      </div>

      {/* Transactions */}
      <div style={{ fontWeight: 700, color: C.tx, fontSize: 13, marginBottom: 9 }}>Recent Transactions</div>
      {txns.length === 0 && (
        <div style={{ textAlign: "center", padding: "30px 0", color: C.su, fontSize: 12 }}>No transactions yet</div>
      )}
      {txns.map(t => (
        <div key={t.id} style={{ ...gl(), borderRadius: 13, padding: "10px 12px", marginBottom: 7, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: t.type === "credit" ? "rgba(34,212,124,.12)" : "rgba(239,68,68,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{t.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, color: C.tx, fontSize: 12 }}>{t.description}</div>
            <div style={{ fontSize: 10, color: C.su, marginTop: 1 }}>
              {new Date(t.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })} · {t.method}
            </div>
          </div>
          <div style={{ fontWeight: 800, fontSize: 13, color: t.type === "credit" ? C.ok : C.er, flexShrink: 0 }}>
            {t.type === "credit" ? "+" : "-"}{fmtK(t.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}