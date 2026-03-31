import React, { useState, useEffect } from "react";
import { Activity, TrendingUp, CreditCard, Star, MessageCircle, CheckCircle, DollarSign, Zap } from "lucide-react";
import { C } from "../constants";
import { gl } from "../utils";
import { MILESTONES, getBankedBonus, getNextMilestone } from "../data";
import { useOrders } from "../hooks/useOrders";
import { SH, SC, Tog, Btn, MiniChart, Pill } from "./Micro";
import WalletScreen from "./WalletScreen";
import { ProfileSetup, ProfileCard } from "./Profile";
import { ConfettiBurst, OrderCodeInput, RiderQuoteModal } from "./Modals";

function MilestonePanel({ deliveries = 0 }) {
  const banked = getBankedBonus(deliveries);
  const next   = getNextMilestone(deliveries);
  return (
    <div style={{ ...gl("ok"), borderRadius: 13, padding: "12px", marginBottom: 11 }}>
      <div style={{ fontWeight: 700, color: C.tx, fontSize: 12, marginBottom: 3 }}>🏆 Today's Bonus Milestones</div>
      <div style={{ fontSize: 10, color: C.su, marginBottom: 8, lineHeight: 1.5 }}>Bonuses bank as you hit each level — you <strong style={{ color: C.ok }}>never lose</strong> what you've earned.</div>
      {banked ? (
        <div style={{ background: "rgba(34,212,124,.1)", border: "1px solid rgba(34,212,124,.25)", borderRadius: 9, padding: "8px 10px", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🔒</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: C.ok, fontSize: 12 }}>Banked: ₦{Number(banked.bonus / 100).toLocaleString()} guaranteed</div>
            <div style={{ fontSize: 10, color: C.su, marginTop: 1 }}>At {banked.label} · Deposits 11 PM ⚡{next ? ` · Keep going to upgrade to ₦${(next.bonus/100).toLocaleString()}!` : ""}</div>
          </div>
        </div>
      ) : (
        <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 9, padding: "8px 10px", marginBottom: 8, fontSize: 10, color: C.su }}>
          📍 Nothing banked yet — reach 12 orders to lock in ₦3,000.
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {MILESTONES.map(m => {
          const done  = deliveries >= m.orders;
          const isNext = next?.orders === m.orders;
          const prog  = Math.min(deliveries / m.orders, 1);
          return (
            <div key={m.orders} style={{ background: "rgba(255,255,255,.03)", border: `1px solid ${done ? C.ok + "35" : isNext ? "rgba(245,158,11,.2)" : "rgba(255,255,255,.06)"}`, borderRadius: 10, padding: "9px 10px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: done ? "rgba(34,212,124,.15)" : isNext ? "rgba(245,158,11,.1)" : "rgba(255,255,255,.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                    {done ? "✅" : isNext ? "🎯" : "○"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: done ? C.ok : isNext ? C.wa : C.su, fontSize: 11 }}>{m.label}</div>
                    <div style={{ fontSize: 9, color: C.su, marginTop: 1 }}>{done ? "Cleared ✓" : isNext ? `${m.orders - deliveries} more needed` : "—"}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 900, fontSize: 14, color: done ? C.ok : isNext ? C.wa : "rgba(255,255,255,.2)" }}>+₦{(m.bonus/100).toLocaleString()}</div>
              </div>
              <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,.07)", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 2, background: done ? C.ok : isNext ? "linear-gradient(90deg,#C144D4,#F59E0B)" : "rgba(255,255,255,.1)", width: `${prog * 100}%`, transition: "width .5s" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RiderApp({ tab, isMobile, user, profile, wallet, openChat, riderHook }) {
  const [activeJob,    setActiveJob]    = useState(null);
  const [step,         setStep]         = useState(0);
  const [showCodeInput,setShowCode]     = useState(false);
  const [showBurst,    setShowBurst]    = useState(false);
  const [activeQuote,  setActiveQuote]  = useState(null);
  const [availJobs,    setAvailJobs]    = useState([]);
  const [loadingJobs,  setLoadingJobs]  = useState(false);
  const [range,        setRange]        = useState("7d");
  const [chartData,    setChartData]    = useState([]);

  const ordersHook = useOrders(user?.id, "rider", null);
  const P = isMobile ? "10px 12px" : "14px 20px";

  const { profile: rProfile, dailyStats, customReqs } = riderHook ?? {};
  const deliveries = dailyStats?.deliveries ?? 0;
  const todayEarn  = dailyStats?.earnings   ?? 0;

  // Fetch available jobs
  useEffect(() => {
    if (tab !== 0) return;
    setLoadingJobs(true);
    ordersHook.fetchAvailableJobs().then(jobs => { setAvailJobs(jobs); setLoadingJobs(false); });
  }, [tab]);

  // Fetch earnings chart
  useEffect(() => {
    if (tab !== 2 || !riderHook) return;
    const days = { "7d": 7, "1m": 30, "3m": 90 }[range] ?? 7;
    riderHook.fetchEarningsHistory(days).then(history => {
      setChartData(history.map(h => ({ l: h.stat_date.slice(5), v: h.earnings })));
    });
  }, [tab, range, riderHook]);

  // ── JOBS TAB ──────────────────────────────────────────────
  if (tab === 0) return (
    <div style={{ padding: P, paddingBottom: 24 }}>
      {activeQuote && (
        <RiderQuoteModal req={activeQuote}
          onDecline={(reason) => { riderHook.declineRequest(activeQuote.id, reason); setActiveQuote(null); }}
          onAccept={(price)  => { riderHook.sendQuote(activeQuote.id, price); setActiveQuote(null); }} />
      )}
      {/* Online toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", ...gl(), borderRadius: 14, padding: "13px 15px", marginBottom: 14 }}>
        <div>
          <div style={{ fontWeight: 700, color: C.tx, fontSize: 13 }}>Rider Status</div>
          <div style={{ fontSize: 11, color: rProfile?.is_online ? C.ok : "rgba(255,255,255,.35)", marginTop: 2 }}>
            {rProfile?.is_online ? "🟢 Online — receiving jobs" : "⚫ Offline"}
          </div>
        </div>
        <Tog on={rProfile?.is_online ?? false} tg={() => riderHook?.toggleOnline(!rProfile?.is_online)} color={C.ok} />
      </div>

      <div style={{ display: "flex", gap: 9, marginBottom: 14, flexWrap: "wrap" }}>
        <SC icon={<CreditCard size={13} />} label="Today's Earn" value={`₦${(todayEarn / 100).toLocaleString()}`} color={C.ok} sub="70% share" />
        <SC icon={<Activity size={13} />}   label="Deliveries"   value={deliveries} color={C.ac} sub="Today" />
        <SC icon={<Star size={13} />}        label="Rating"       value={`${rProfile?.rating ?? 5.0} ⭐`} color={C.wa} />
      </div>

      {/* Custom requests */}
      {customReqs?.length > 0 && (
        <>
          <SH title="⚡ Custom Requests" sub="Customers requesting you directly" />
          {customReqs.map(req => (
            <div key={req.id} style={{ background: "linear-gradient(135deg,rgba(255,107,53,.1),rgba(193,68,212,.07))", border: "1px solid rgba(255,107,53,.3)", borderRadius: 16, padding: "14px", marginBottom: 11 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,107,53,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🎯</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: C.tx, fontSize: 13 }}>{req.customer?.name ?? "Customer"} is requesting you</div>
                  <div style={{ fontSize: 11, color: C.su, marginTop: 1 }}>{req.item_description}</div>
                </div>
                <Pill label="New" color="#FF6B35" />
              </div>
              <div style={{ ...gl(), borderRadius: 10, padding: "9px 11px", marginBottom: 10, fontSize: 11, color: C.su }}>
                <div style={{ marginBottom: 3 }}><strong style={{ color: C.tx }}>From:</strong> {req.from_address}</div>
                <div><strong style={{ color: C.tx }}>To:</strong> {req.to_address}</div>
              </div>
              <div style={{ display: "flex", gap: 7 }}>
                <Btn v="d" sm onClick={() => riderHook.declineRequest(req.id, "Cannot take at this time")}>Decline</Btn>
                <Btn v="zap" full sm onClick={() => setActiveQuote(req)}><DollarSign size={12} />Review & Quote</Btn>
              </div>
            </div>
          ))}
        </>
      )}

      <SH title="Available Jobs" sub={loadingJobs ? "Loading…" : `${availJobs.length} job${availJobs.length !== 1 ? "s" : ""} nearby`} />
      {availJobs.length === 0 && !loadingJobs && (
        <div style={{ textAlign: "center", padding: "50px 16px" }}>
          <div style={{ fontSize: 46, marginBottom: 12 }}>🎉</div>
          <div style={{ fontWeight: 700, color: C.tx, fontSize: 16 }}>All caught up!</div>
          <div style={{ color: C.su, fontSize: 12, marginTop: 6 }}>No jobs available right now. Check back soon.</div>
        </div>
      )}
      {availJobs.map(j => (
        <div key={j.id} style={{ ...gl(), borderRadius: 13, padding: "11px", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12 }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: `${C.ac}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{j.stores?.logo ?? "🛍️"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: C.tx, fontSize: 14 }}>{j.stores?.name ?? "Store"}</div>
              <div style={{ color: C.su, fontSize: 12, marginTop: 1 }}>{j.order_items?.length ?? 0} item{j.order_items?.length !== 1 ? "s" : ""}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 900, fontSize: 22, color: C.ok }}>₦{((j.rider_earn ?? j.delivery_fee * 0.7) / 100).toLocaleString()}</div>
              <div style={{ fontSize: 9, color: C.su }}>your 70%</div>
            </div>
          </div>
          <div style={{ ...gl(), borderRadius: 12, padding: "11px 13px", marginBottom: 11, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
            {[["📍 Pickup", j.stores?.address ?? j.stores?.location ?? "—"], ["🏁 Drop-off", j.delivery_address ?? "—"], ["💰 Delivery Fee", `₦${(j.delivery_fee / 100).toLocaleString()}`], ["🎯 Items", `${j.order_items?.length ?? 0} item(s)`]].map(([l, v]) => (
              <div key={l}><div style={{ fontSize: 9, color: C.su, marginBottom: 2 }}>{l}</div><div style={{ fontSize: 11, color: C.tx, fontWeight: 600, wordBreak: "break-word" }}>{v}</div></div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn v="ok" full sm onClick={async () => {
              try {
                await ordersHook.grabJob(j.id);
                setActiveJob(j); setStep(0);
                setAvailJobs(prev => prev.filter(x => x.id !== j.id));
              } catch (e) { alert(e.message); }
            }}>⚡ Grab Job</Btn>
            <Btn v="ghost" sm onClick={() => openChat(`conv_c_${j.customer_id}`, "Customer", "🛍️", "customer")}>
              <MessageCircle size={11} />Chat
            </Btn>
          </div>
        </div>
      ))}
    </div>
  );

  // ── ACTIVE DELIVERY TAB ────────────────────────────────────
  if (tab === 1) return (
    <div style={{ padding: P, paddingBottom: 24 }}>
      {showCodeInput && activeJob && (
        <OrderCodeInput expectedCode={activeJob.order_code}
          onVerified={() => { setShowCode(false); setShowBurst(true); }}
          onCancel={() => setShowCode(false)} />
      )}
      {showBurst && (
        <ConfettiBurst onDone={async () => {
          try { await ordersHook.completeDelivery(activeJob.id, activeJob.order_code); }
          catch (e) { console.error(e); }
          setShowBurst(false); setActiveJob(null); setStep(0);
        }} />
      )}
      <SH title="Active Delivery" sub="Your current mission" />
      {!activeJob ? (
        <div style={{ textAlign: "center", padding: "60px 16px" }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🏍️</div>
          <div style={{ fontWeight: 700, fontSize: 17, color: C.tx, marginBottom: 6 }}>No active delivery</div>
          <div style={{ color: C.su, fontSize: 12 }}>Go to Jobs tab to grab one</div>
        </div>
      ) : (
        <>
          <div style={{ ...gl(), border: `1px solid ${C.ac}28`, borderRadius: 14, padding: "12px", marginBottom: 9 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12 }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: `${C.ac}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{activeJob.stores?.logo ?? "🛍️"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: C.tx }}>{activeJob.stores?.name ?? "Store"}</div>
                <div style={{ color: C.su, fontSize: 12, marginTop: 1 }}>{activeJob.delivery_address}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 900, fontSize: 20, color: C.ok }}>₦{((activeJob.rider_earn ?? 0) / 100).toLocaleString()}</div>
                <div style={{ fontSize: 9, color: C.su }}>your earn</div>
              </div>
            </div>
            <div style={{ background: "rgba(34,212,124,.06)", border: "1px solid rgba(34,212,124,.18)", borderRadius: 10, padding: "8px 11px", marginBottom: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>🔑</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: C.ok, fontWeight: 700 }}>Collect the Order Code</div>
                <div style={{ fontSize: 10, color: C.su, marginTop: 1 }}>Ask the customer for their 4-digit code on arrival.</div>
              </div>
            </div>
            {[["🏪", "Head to Pickup", activeJob.stores?.address ?? "Store location"], ["📦", "Collect Order", "Pick up from store"], ["🏍️", "Deliver to Customer", activeJob.delivery_address], ["🔑", "Enter Order Code", "Customer verifies delivery"]].map(([ic, lb, sub], i) => {
              const done = step > i, curr = step === i;
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: i < 3 ? 4 : 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 35, height: 35, borderRadius: "50%", background: done ? C.ok : curr ? "linear-gradient(135deg,#C144D4,#8B30C9)" : C.s1, border: `2px solid ${done ? C.ok : curr ? C.ac : C.bd}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: curr ? 15 : 13, flexShrink: 0 }}>
                      {done ? <CheckCircle size={16} color="#fff" /> : ic}
                    </div>
                    {i < 3 && <div style={{ width: 2, height: 20, background: done ? C.ok : C.bd, transition: "background .3s" }} />}
                  </div>
                  <div style={{ paddingTop: 7 }}>
                    <div style={{ fontWeight: curr ? 700 : 600, color: done ? C.ok : curr ? C.tx : C.su, fontSize: 13 }}>{lb}</div>
                    <div style={{ fontSize: 11, color: C.su, marginTop: 1 }}>{sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <Btn v="ghost" sm sx={{ marginBottom: 10 }} onClick={() => openChat(`conv_c_${activeJob.customer_id}`, "Customer", "🛍️", "customer")}>
            <MessageCircle size={11} />Chat Customer
          </Btn>
          <Btn v={step < 3 ? "p" : "ok"} full onClick={async () => {
            if (step < 3) {
              const nextStatus = ["assigned", "preparing", "picked_up", "delivering"][step + 1] ?? "delivering";
              await ordersHook.advanceDelivery(activeJob.id, nextStatus);
              setStep(s => s + 1);
            } else {
              setShowCode(true);
            }
          }}>
            {step === 0 ? "✅ Arrived at Pickup" : step === 1 ? "📦 Order Collected" : step === 2 ? "🎉 At Customer — Mark Delivered" : "🔑 Enter Order Code to Complete"}
          </Btn>
        </>
      )}
    </div>
  );

  // ── EARNINGS TAB ───────────────────────────────────────────
  if (tab === 2) return (
    <div style={{ padding: P, paddingBottom: 24 }}>
      <div style={{ background: "linear-gradient(135deg,rgba(34,212,124,.22),rgba(34,212,124,.07))", border: "1px solid rgba(34,212,124,.28)", borderRadius: 20, padding: "18px", marginBottom: 13, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: C.su, marginBottom: 5 }}>Today</div>
        <div style={{ fontSize: 34, fontWeight: 900, color: C.ok, letterSpacing: -1, lineHeight: 1 }}>₦{(todayEarn / 100).toLocaleString()}</div>
        <div style={{ fontSize: 12, color: C.su, marginTop: 7 }}>{deliveries} deliveries today</div>
      </div>
      <div style={{ display: "flex", gap: 9, marginBottom: 14, flexWrap: "wrap" }}>
        <SC icon={<TrendingUp size={13} />} label="Today" value={`₦${(todayEarn / 100).toLocaleString()}`} color={C.ok} sub={`${deliveries} deliveries`} />
        <SC icon={<CreditCard size={13} />} label="Total Trips" value={rProfile?.total_trips ?? 0} color={C.ac} />
      </div>
      <div style={{ marginBottom: 13 }}>
        <MiniChart data={chartData.length ? chartData : [{ l: "—", v: 0 }]} color={C.ok} range={range} setRange={setRange} title="📊 Earnings" />
      </div>
      <MilestonePanel deliveries={deliveries} />
      <div style={{ ...gl(), borderRadius: 15, padding: "13px", marginBottom: 13 }}>
        <div style={{ fontWeight: 700, color: C.tx, marginBottom: 11, fontSize: 13 }}>💡 How You Get Paid</div>
        {[["Customer pays delivery fee", "100%", C.tx], ["Your share (Rider)", "70%", C.ok], ["Platform fee", "30%", C.su]].map(([l, p, col], i) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,.07)" : "none" }}>
            <span style={{ color: i === 1 ? C.tx : C.su, fontSize: 12, fontWeight: i === 1 ? 700 : 400 }}>{l}</span>
            <span style={{ color: col, fontWeight: 800, fontSize: 12 }}>{p}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (tab === 3) return <div style={{ padding: P, paddingBottom: 16 }}><WalletScreen wallet={wallet} role="rider" /></div>;
  if (tab === 4) return (
    <div style={{ padding: P, paddingBottom: 16 }}>
      {profile?.is_setup
        ? <ProfileCard role="rider" profile={profile} wallet={wallet} riderProfile={rProfile} />
        : <ProfileSetup role="rider" userId={user?.id} />}
    </div>
  );
  return null;
}