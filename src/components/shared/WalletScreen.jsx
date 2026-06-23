import React, { useState } from "react";
import { Eye, EyeOff, Copy, ChevronRight, ArrowUpRight, ArrowRight, Download, Banknote, CreditCard } from "lucide-react";
import { C, G } from "../../constants";
import { gl } from "../../utils";
import { Back, Btn, MiniChart } from "./Micro";

export default function WalletScreen({ wallet: wHook, role }) {
  const defaultAccounts = [
    { id: "a1", label: "ZaraDrop Account", bank: "Wema Bank", account: "0123456789", reference: "ZDRP-54321" },
  ];
  const [sub, setSub] = useState("home");
  const [showBal, setShowBal] = useState(true);
  const [range, setRange] = useState("1m");
  const [amt, setAmt] = useState("");
  const [sendTo, setSendTo] = useState("");
  const [sendAmt, setSendAmt] = useState("");
  const [withdrawAmt, setWithdrawAmt] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [newAccountName, setNewAccountName] = useState("");
  const [newBank, setNewBank] = useState("");
  const [newAccountNo, setNewAccountNo] = useState("");
  const [linkedAccounts, setLinkedAccounts] = useState(defaultAccounts);
  const [selectedAccountId, setSelectedAccountId] = useState(defaultAccounts[0]?.id ?? null);
  const [err, setErr] = useState("");
  const [loading, setLoad] = useState(false);
  const [bankResult, setBankResult] = useState(null);

  const cc = role === "rider" ? C.ok : role === "store" ? C.wa : C.ac;
  const balance = wHook.balance ?? 0;
  const txns = wHook.txns ?? [];

  const fmtK = (k) => `₦${(k / 100).toLocaleString("en-NG")}`;
  const tin = txns.filter((t) => t.type === "credit").reduce((a, t) => a + t.amount, 0);
  const tout = txns.filter((t) => t.type === "debit").reduce((a, t) => a + t.amount, 0);

  const inputStyle = {
    width: "100%",
    background: "var(--zd-input)",
    border: "1px solid var(--zd-input-border)",
    borderRadius: 14,
    padding: "12px 13px",
    fontSize: 13,
    outline: "none",
    color: C.tx,
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const buildChartData = () => {
    const now = new Date();
    return [0, 1, 2, 3]
      .map((i) => {
        const start = new Date(now);
        start.setDate(start.getDate() - (i + 1) * 7);
        const end = new Date(now);
        end.setDate(end.getDate() - i * 7);
        const value = txns
          .filter((t) => {
            const d = new Date(t.created_at);
            return d >= start && d < end && t.type === "credit";
          })
          .reduce((sum, t) => sum + t.amount, 0);
        return { l: `W${4 - i}`, v: value };
      })
      .reverse();
  };

  const handleTopUp = async () => {
    if (!amt || +amt < 100) {
      setErr("Minimum top-up is ₦100");
      return;
    }
    setLoad(true);
    setErr("");
    try {
      await wHook.topUp(+amt, "4521", "Visa");
      setAmt("");
      setSub("home");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoad(false);
    }
  };

  const handleSend = async () => {
    if (!sendTo || !sendAmt) return;
    setLoad(true);
    setErr("");
    try {
      await wHook.sendMoney(sendTo, +sendAmt);
      setSendTo("");
      setSendAmt("");
      setSub("home");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoad(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmt || +withdrawAmt < 500) {
      setErr("Minimum withdrawal is ₦500");
      return;
    }
    const target = activeAccount || { bank: bankName.trim(), account: accountNo.trim() };
    if (!target?.bank || !target?.account) {
      setErr("Select or enter a valid bank account.");
      return;
    }
    setLoad(true);
    setErr("");
    try {
      await wHook.withdraw(+withdrawAmt, target.bank, target.account);
      setWithdrawAmt("");
      setBankName("");
      setAccountNo("");
      setSub("home");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoad(false);
    }
  };

  const activeAccount = linkedAccounts.find((a) => a.id === selectedAccountId) || linkedAccounts[0] || null;

  const handleBankDetails = async () => {
    setErr("");
    try {
      const details = await wHook.getBankDetails?.();
      setBankResult(details || activeAccount);
      setSub("receive");
    } catch (e) {
      setBankResult(activeAccount);
      setErr(e.message || "Unable to fetch bank details.");
      setSub("receive");
    }
  };

  const handleAddAccount = () => {
    if (!newAccountName.trim() || !newBank.trim() || !newAccountNo.trim()) {
      setErr("Complete all account fields.");
      return;
    }
    const next = {
      id: `a${Date.now()}`,
      label: newAccountName.trim(),
      bank: newBank.trim(),
      account: newAccountNo.trim(),
      reference: `ZDRP-${Math.floor(Math.random() * 90000) + 10000}`,
    };
    setLinkedAccounts((prev) => [next, ...prev]);
    setSelectedAccountId(next.id);
    setNewAccountName("");
    setNewBank("");
    setNewAccountNo("");
    setErr("");
  };

  const handleRemoveAccount = (id) => {
    setLinkedAccounts((prev) => prev.filter((account) => account.id !== id));
    if (selectedAccountId === id) {
      const next = linkedAccounts.find((account) => account.id !== id);
      setSelectedAccountId(next?.id ?? null);
    }
  };

  if (sub === "accounts") return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
        <Back onClick={() => setSub("home")} />
        <div style={{ fontWeight: 800, fontSize: 15, color: C.tx }}>Linked Accounts</div>
      </div>
      <div style={{ ...gl(), borderRadius: 18, padding: "18px 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: C.su, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.1, marginBottom: 12 }}>
          Connected bank accounts
        </div>
        {linkedAccounts.map((account) => (
          <div key={account.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10, padding: "12px 14px", borderRadius: 14, background: selectedAccountId === account.id ? "rgba(193,63,224,.14)" : "var(--zd-surface)", border: `1px solid ${selectedAccountId === account.id ? C.ac : "var(--zd-border)"}` }}>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: C.tx }}>{account.label}</div>
              <div style={{ fontSize: 11, color: C.su, marginTop: 3 }}>{account.bank} · {account.account}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setSelectedAccountId(account.id)} style={{ background: selectedAccountId === account.id ? G : "var(--zd-surface)", border: `1px solid ${selectedAccountId === account.id ? C.ac : "var(--zd-border)"}`, borderRadius: 11, padding: "8px 10px", cursor: "pointer", color: selectedAccountId === account.id ? "#fff" : C.tx, fontSize: 11, fontWeight: 700 }}>
                {selectedAccountId === account.id ? "Active" : "Use"}
              </button>
              <button onClick={() => handleRemoveAccount(account.id)} style={{ background: "var(--zd-surface)", border: `1px solid var(--zd-border)`, borderRadius: 11, padding: "8px 10px", cursor: "pointer", color: C.er, fontSize: 11, fontWeight: 700 }}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ ...gl(), borderRadius: 18, padding: "18px 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: C.su, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.1, marginBottom: 12 }}>
          Add a linked bank account
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: C.su, marginBottom: 5 }}>Account label</div>
          <input value={newAccountName} onChange={(e) => { setNewAccountName(e.target.value); setErr(""); }} placeholder="e.g. Salary account" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: C.su, marginBottom: 5 }}>Bank name</div>
          <input value={newBank} onChange={(e) => { setNewBank(e.target.value); setErr(""); }} placeholder="Bank name" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: C.su, marginBottom: 5 }}>Account number</div>
          <input value={newAccountNo} onChange={(e) => { setNewAccountNo(e.target.value.replace(/\D/g, "")); setErr(""); }} placeholder="1234567890" style={inputStyle} />
        </div>
        {err && <div style={{ color: C.er, fontSize: 12, marginBottom: 10 }}>{err}</div>}
        <Btn v="p" full onClick={handleAddAccount}>Add account</Btn>
      </div>
    </div>
  );

  if (sub === "topup") return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
        <Back onClick={() => setSub("home")} />
        <div style={{ fontWeight: 800, fontSize: 15, color: C.tx }}>Add Money</div>
      </div>
      {[
        { icon: <CreditCard size={18} />, l: "Debit / Credit Card", s: "Instant funding", k: "topup_card" },
        { icon: <Banknote size={18} />, l: "Bank Transfer", s: "Pay from your bank", k: "receive" },
      ].map((item) => (
        <button
          key={item.k}
          onClick={() => (item.k === "receive" ? handleBankDetails() : setSub(item.k))}
          style={{
            ...gl(),
            borderRadius: 16,
            padding: "16px",
            marginBottom: 10,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 12,
            width: "100%",
            border: "1px solid var(--zd-border)",
            textAlign: "left",
            background: "var(--zd-surface-1)",
          }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 14, background: "var(--zd-surface)", display: "grid", placeItems: "center", color: C.ac }}>
            {item.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.tx }}>{item.l}</div>
            <div style={{ fontSize: 12, color: C.su, marginTop: 3 }}>{item.s}</div>
          </div>
          <ChevronRight size={16} color={C.su} />
        </button>
      ))}
    </div>
  );

  if (sub === "topup_card") return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
        <Back onClick={() => setSub("topup")} />
        <div style={{ fontWeight: 800, fontSize: 15, color: C.tx }}>Card Top-up</div>
      </div>
      <div style={{ ...gl(), borderRadius: 18, padding: "18px 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: C.su, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 }}>
          Top up with card
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 18 }}>
          <div style={{ width: 46, height: 34, borderRadius: 12, background: "var(--zd-surface)", display: "flex", alignItems: "center", justifyContent: "center", color: C.ok, fontWeight: 800 }}>
            VISA
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.tx }}>Visa ending 4521</div>
            <div style={{ fontSize: 11, color: C.su }}>Secure payment · Instant</div>
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: C.su, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.1, marginBottom: 5 }}>
            Amount
          </div>
          <input
            value={amt}
            onChange={(e) => { setAmt(e.target.value.replace(/\D/g, "")); setErr(""); }}
            placeholder="0"
            style={{
              width: "100%",
              background: "var(--zd-input)",
              border: "1px solid var(--zd-input-border)",
              borderRadius: 16,
              padding: "18px 14px",
              fontSize: 34,
              fontWeight: 900,
              color: C.tx,
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {[500, 1000, 2000, 5000, 10000].map((value) => (
            <button
              key={value}
              onClick={() => setAmt(String(value))}
              style={{
                padding: "10px 12px",
                borderRadius: 999,
                border: "1px solid var(--zd-input-border)",
                background: "var(--zd-surface)",
                color: C.tx,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ₦{value.toLocaleString()}
            </button>
          ))}
        </div>
      </div>
      {err && <div style={{ color: C.er, fontSize: 12, marginBottom: 10 }}>{err}</div>}
      <Btn v="p" full disabled={loading || !amt || +amt < 100} onClick={handleTopUp}>
        {loading ? "Processing…" : `Top up ₦${amt ? Number(amt).toLocaleString() : "0"}`}
      </Btn>
    </div>
  );

  if (sub === "receive") return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
        <Back onClick={() => setSub("home")} />
        <div style={{ fontWeight: 800, fontSize: 15, color: C.tx }}>Receive Funds</div>
      </div>
      <div style={{ ...gl("ok"), borderRadius: 18, padding: "22px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: C.su, marginBottom: 8 }}>Deposit directly into your wallet</div>
        <div style={{ fontSize: 13, color: C.tx, fontWeight: 700, marginBottom: 6 }}>
          {bankResult?.account_name ?? activeAccount?.label ?? "ZaraDrop Payments Ltd"}
        </div>
        <div style={{ fontSize: 30, fontWeight: 900, color: C.ok, letterSpacing: 3, marginBottom: 5 }}>
          {bankResult?.account ?? activeAccount?.account ?? "0123 456 789"}
        </div>
        <div style={{ fontSize: 12, color: C.su, marginBottom: 14 }}>{bankResult?.bank ?? activeAccount?.bank ?? "Wema Bank"}</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Btn v="ok" sm onClick={() => navigator.clipboard?.writeText(bankResult?.account ?? activeAccount?.account ?? "0123456789")}>
            <Copy size={11} />Copy account
          </Btn>
          <Btn v="g" sm onClick={handleBankDetails}>Refresh</Btn>
        </div>
        {bankResult?.reference && (
          <div style={{ ...gl(), borderRadius: 12, padding: "12px 14px", marginTop: 16, fontSize: 11, color: C.su, lineHeight: 1.7 }}>
            Use reference <strong style={{ color: C.wa }}>{bankResult.reference}</strong> when you transfer.
          </div>
        )}
        <div style={{ fontSize: 11, color: C.su, marginTop: 14, lineHeight: 1.6 }}>Funds reflect within 5 minutes after confirmation.</div>
      </div>
    </div>
  );

  if (sub === "withdraw") return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
        <Back onClick={() => setSub("home")} />
        <div style={{ fontWeight: 800, fontSize: 15, color: C.tx }}>Withdraw</div>
      </div>
      <div style={{ ...gl(), borderRadius: 18, padding: "18px 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: C.su, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.1, marginBottom: 12 }}>
          Send money to your linked bank account
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: C.su, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.05, marginBottom: 5 }}>
            Amount
          </div>
          <input
            value={withdrawAmt}
            onChange={(e) => { setWithdrawAmt(e.target.value.replace(/\D/g, "")); setErr(""); }}
            placeholder="0"
            style={{ ...inputStyle, padding: "16px 13px", fontSize: 24, fontWeight: 800 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: C.su, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.05, marginBottom: 5 }}>
            Withdraw to
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {linkedAccounts.map((account) => (
              <button key={account.id} onClick={() => { setSelectedAccountId(account.id); setErr(""); }}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: selectedAccountId === account.id ? `${C.ac}14` : "var(--zd-surface)",
                  border: `1px solid ${selectedAccountId === account.id ? C.ac : "var(--zd-border)"}`,
                  color: C.tx,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{account.label}</div>
                  <div style={{ fontSize: 11, color: C.su }}>{account.bank} · {account.account}</div>
                </div>
                <div style={{ fontSize: 11, color: selectedAccountId === account.id ? C.ac : C.su }}>{selectedAccountId === account.id ? "Selected" : "Select"}</div>
              </button>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 11, color: C.su, marginTop: 8 }}>Available balance: ₦{balance.toLocaleString()}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
        <Btn v="o" sm onClick={() => setSub("accounts")}>Manage accounts</Btn>
        <Btn v="g" sm onClick={handleBankDetails}>Refresh receive info</Btn>
      </div>
      {err && <div style={{ color: C.er, fontSize: 12, marginBottom: 10 }}>{err}</div>}
      <Btn v="p" full disabled={loading || !withdrawAmt || !selectedAccountId || +withdrawAmt < 500} onClick={handleWithdraw}>
        {loading ? "Withdrawing…" : `Withdraw ₦${withdrawAmt ? Number(withdrawAmt).toLocaleString() : "0"}`}
      </Btn>
    </div>
  );

  if (sub === "send") return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
        <Back onClick={() => setSub("home")} />
        <div style={{ fontWeight: 800, fontSize: 15, color: C.tx }}>Send Money</div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9, color: C.su, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.1, marginBottom: 5 }}>
          Recipient phone
        </div>
        <input
          value={sendTo}
          onChange={(e) => { setSendTo(e.target.value); setErr(""); }}
          placeholder="+234 800 000 0000"
          style={{ ...inputStyle, width: "100%" }}
        />
      </div>
      <div style={{ ...gl(), borderRadius: 18, padding: "16px", marginBottom: 11 }}>
        <div style={{ fontSize: 9, color: C.su, fontWeight: 700, letterSpacing: 1.05, marginBottom: 5 }}>
          Amount
        </div>
        <input
          value={sendAmt}
          onChange={(e) => { setSendAmt(e.target.value.replace(/\D/g, "")); setErr(""); }}
          placeholder="0"
          style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 32, fontWeight: 800, color: C.tx, fontFamily: "inherit" }}
        />
        <div style={{ fontSize: 11, color: C.su, marginTop: 6 }}>Available: ₦{balance.toLocaleString()}</div>
      </div>
      {err && <div style={{ color: C.er, fontSize: 12, marginBottom: 10 }}>{err}</div>}
      <Btn v="p" full disabled={loading || !sendTo || !sendAmt || +sendAmt < 10 || +sendAmt > balance} onClick={handleSend}>
        {loading ? "Sending…" : `Send ₦${sendAmt ? Number(sendAmt).toLocaleString() : "0"}`}
      </Btn>
    </div>
  );

  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{
        background: "linear-gradient(135deg,rgba(193,68,212,.24),rgba(139,48,201,.1))",
        border: "1px solid rgba(193,68,212,.3)",
        borderRadius: 22,
        padding: "20px 20px 18px",
        marginBottom: 13,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 14px 44px rgba(193,68,212,.16)",
      }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 140, height: 140, borderRadius: "50%", background: "rgba(193,68,212,.07)", pointerEvents: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.45)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>ZaraDrop Wallet</div>
          <button onClick={() => setShowBal(!showBal)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.4)", display: "flex", padding: 2 }}>
            {showBal ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
        </div>
        <div style={{ fontSize: 34, fontWeight: 900, color: "#fff", letterSpacing: -1, marginBottom: 12 }}>
          {showBal ? `₦${balance.toLocaleString()}` : "₦••••••"}
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,.45)", marginBottom: 4 }}>Money In</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.ok }}>+{fmtK(tin)}</div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,.12)", opacity: 0.85 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,.45)", marginBottom: 4 }}>Money Out</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.er }}>-{fmtK(tout)}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(96px,1fr))", gap: 10, marginBottom: 13 }}>
        {[
          { icon: <ArrowUpRight size={18} />, l: "Top up", g: () => setSub("topup") },
          { icon: <ArrowRight size={18} />, l: "Send", g: () => setSub("send") },
          { icon: <Download size={18} />, l: "Receive", g: handleBankDetails },
          { icon: <Banknote size={18} />, l: "Withdraw", g: () => setSub("withdraw") },
          { icon: <CreditCard size={18} />, l: "Accounts", g: () => setSub("accounts") },
        ].map((action) => (
          <button
            key={action.l}
            onClick={action.g}
            style={{
              ...gl(),
              border: "1px solid var(--zd-border)",
              borderRadius: 16,
              padding: "14px 10px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              fontFamily: "inherit",
              minHeight: 108,
            }}
          >
            <div style={{ width: 42, height: 42, display: "grid", placeItems: "center", borderRadius: 14, background: "var(--zd-surface)", color: cc }}>
              {action.icon}
            </div>
            <span style={{ fontSize: 12, color: C.tx, fontWeight: 700 }}>{action.l}</span>
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 14 }}>
        <MiniChart data={buildChartData()} color={cc} range={range} setRange={setRange} title="📊 Activity" />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontWeight: 700, color: C.tx, fontSize: 13 }}>Recent Transactions</div>
        <div style={{ fontSize: 11, color: C.su }}>{txns.length} records</div>
      </div>
      {txns.length === 0 && (
        <div style={{ textAlign: "center", padding: "30px 0", color: C.su, fontSize: 12 }}>No transactions yet</div>
      )}
      {txns.map((t) => (
        <div
          key={t.id}
          style={{
            ...gl(),
            borderRadius: 15,
            padding: "12px 14px",
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: t.type === "credit" ? "rgba(31,214,122,.14)" : "rgba(255,77,94,.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            flexShrink: 0,
          }}>
            {t.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: C.tx, fontSize: 12.5 }}>{t.description}</div>
            <div style={{ fontSize: 10, color: C.su, marginTop: 4, display: "flex", justifyContent: "space-between", gap: 10 }}>
              <span>{new Date(t.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</span>
              <span>{t.method}</span>
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
