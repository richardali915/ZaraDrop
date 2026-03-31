import React, { useState, useEffect } from "react";
import { Package, TrendingUp, Activity, MessageCircle, Star } from "lucide-react";
import { C } from "../constants";
import { gl } from "../utils";
import { useOrders } from "../hooks/useOrders";
import { SH, SC, Tog, Pill, Btn, MiniChart } from "./Micro";
import WalletScreen from "./WalletScreen";
import { ProfileSetup, ProfileCard } from "./Profile";

export default function StoreApp({ tab, isMobile, user, profile, wallet, openChat, storeHook, currentAttendant, isStoreAdmin }) {
  const [range,      setRange]  = useState("7d");
  const [chartData,  setChart]  = useState([]);

  const { store, menu, attendants, toggleOpen, storeAnalytics } = storeHook ?? {};
  const ordersHook = useOrders(user?.id, "store", store?.id);
  const P = isMobile ? "10px 12px" : "14px 20px";

  const SI = {
    pending:   { color: C.wa, label: "Pending",   icon: "⏳" },
    confirmed: { color: C.ok, label: "Confirmed", icon: "✅" },
    preparing: { color: C.ac, label: "Preparing", icon: "👨‍🍳" },
    ready:     { color: C.ok, label: "Ready",     icon: "📦" },
    assigned:  { color: C.ac, label: "Rider Found",icon: "🏍️" },
    picked_up: { color: C.ok, label: "Picked Up", icon: "✅" },
    delivering:{ color: C.ac, label: "On the Way",icon: "🏍️" },
    delivered: { color: C.su, label: "Delivered", icon: "🎉" },
    cancelled: { color: C.er, label: "Cancelled", icon: "❌" },
  };

  // Fetch analytics for chart
  useEffect(() => {
    if (tab !== 2 || !storeAnalytics) return;
    const days = { "7d": 7, "1m": 30, "3m": 90 }[range] ?? 7;
    storeAnalytics(range).then(orders => {
      // Aggregate by day
      const byDay = {};
      orders.forEach(o => {
        const d = new Date(o.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" });
        byDay[d] = (byDay[d] ?? 0) + o.total;
      });
      const data = Object.entries(byDay).map(([l, v]) => ({ l, v })).slice(-days);
      setChart(data.length ? data : [{ l: "—", v: 0 }]);
    });
  }, [tab, range, storeAnalytics]);

  // Dashboard + Orders tabs
  if (tab === 0 || tab === 1) {
    const live    = tab === 0 ? ordersHook.orders.filter(o => !["delivered","cancelled"].includes(o.status)) : ordersHook.orders;
    const pending = ordersHook.orders.filter(o => o.status === "pending").length;
    const todayRevenue = ordersHook.orders
      .filter(o => o.status === "delivered" && new Date(o.created_at).toDateString() === new Date().toDateString())
      .reduce((s, o) => s + o.total, 0);

    return (
      <div style={{ padding: P, paddingBottom: 24 }}>
        {/* Active attendant badge */}
        {currentAttendant && (
          <div style={{ ...gl("ok"), borderRadius: 11, padding: "9px 13px", marginBottom: 12, display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: `${currentAttendant.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: currentAttendant.color, flexShrink: 0 }}>
              {currentAttendant.name.split(" ").map(w => w[0]).join("")}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.tx }}>Active Session: {currentAttendant.name}</div>
              <div style={{ fontSize: 10, color: C.su }}>{currentAttendant.role} · Orders attributed to this account</div>
            </div>
            <Pill label="On Duty" color={C.ok} />
          </div>
        )}

        {/* Dashboard stats */}
        {tab === 0 && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", ...gl(), borderRadius: 14, padding: "13px 15px", marginBottom: 13 }}>
              <div>
                <div style={{ fontWeight: 700, color: C.tx, fontSize: 13 }}>Store Status</div>
                <div style={{ fontSize: 11, color: store?.is_open ? C.ok : C.er, marginTop: 2 }}>{store?.is_open ? "🟢 Open — accepting orders" : "🔴 Closed"}</div>
              </div>
              <Tog on={store?.is_open ?? true} tg={() => toggleOpen?.(!store?.is_open)} color={C.ok} />
            </div>
            <div style={{ display: "flex", gap: 9, marginBottom: 14, flexWrap: "wrap" }}>
              <SC icon={<Package size={13} />}     label="Pending"   value={pending}                                color={C.wa} sub="Need prep" />
              <SC icon={<TrendingUp size={13} />}  label="Revenue"   value={`₦${(todayRevenue / 100).toLocaleString()}`} color={C.ok} sub="Today" />
              <SC icon={<Activity size={13} />}    label="Orders"    value={ordersHook.orders.length}              color={C.ac} sub="Total" />
            </div>
          </>
        )}

        {/* Orders tab status filter */}
        {tab === 1 && (
          <div style={{ display: "flex", gap: 7, marginBottom: 12, flexWrap: "wrap" }}>
            {Object.entries(SI).map(([k, v]) => {
              const cnt = ordersHook.orders.filter(o => o.status === k).length;
              if (!cnt) return null;
              return (
                <div key={k} style={{ background: `${v.color}12`, border: `1px solid ${v.color}25`, borderRadius: 10, padding: "5px 11px", fontSize: 10, fontWeight: 700, color: v.color }}>
                  {v.icon} {v.label}: {cnt}
                </div>
              );
            })}
          </div>
        )}

        <SH title={tab === 0 ? "Live Orders" : "All Orders"} sub={tab === 0 ? "Mark ready so riders can pick up" : undefined} />

        {ordersHook.loading && <div style={{ textAlign: "center", padding: "30px", color: C.su }}>Loading orders…</div>}
        {!ordersHook.loading && live.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
            <div style={{ fontWeight: 700, color: C.tx, fontSize: 14 }}>{tab === 0 ? "No live orders right now" : "No orders yet"}</div>
          </div>
        )}

        {live.map(o => {
          const st = SI[o.status] ?? { color: C.su, label: o.status, icon: "📦" };
          return (
            <div key={o.id} style={{ ...gl(), borderRadius: 16, padding: "13px", marginBottom: 9 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${st.color}14`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{st.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, color: C.tx, fontSize: 13 }}>Order #{o.order_code}</span>
                    <Pill label={`${st.icon} ${st.label}`} color={st.color} />
                    <span style={{ color: C.su, fontSize: 10 }}>{new Date(o.created_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div style={{ color: C.su, fontSize: 11, marginTop: 2 }}>{o.order_items?.map(i => `${i.name} ×${i.quantity}`).join(" · ")}</div>
                  {currentAttendant && <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 1 }}>👤 {currentAttendant.name}</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: C.ac, fontWeight: 800, fontSize: 13 }}>₦{(o.total / 100).toLocaleString()}</div>
                  <div style={{ fontSize: 9, color: C.su, marginTop: 2 }}>+₦{(o.service_fee / 100).toLocaleString()} svc</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {o.status === "pending" && (
                  <Btn v="ok" sm onClick={() => ordersHook.markReady(o.id, currentAttendant?.id)}>
                    ✅ Mark Ready
                  </Btn>
                )}
                <Btn v="ghost" sm onClick={() => openChat(`conv_c_${o.customer_id}`, `Order #${o.order_code}`, "🛍️", "customer")}>
                  <MessageCircle size={11} />Chat
                </Btn>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── ANALYTICS TAB ─────────────────────────────────────────
  if (tab === 2) {
    const totalRevenue = ordersHook.orders.filter(o => o.status === "delivered").reduce((s, o) => s + o.total, 0);
    return (
      <div style={{ padding: P, paddingBottom: 24 }}>
        <div style={{ background: "linear-gradient(135deg,rgba(245,158,11,.2),rgba(245,158,11,.06))", border: "1px solid rgba(245,158,11,.25)", borderRadius: 20, padding: "18px", marginBottom: 13, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.su, marginBottom: 5 }}>Total Delivered Revenue</div>
          <div style={{ fontSize: 34, fontWeight: 900, color: C.wa, letterSpacing: -1, lineHeight: 1 }}>₦{(totalRevenue / 100).toLocaleString()}</div>
        </div>
        <div style={{ display: "flex", gap: 9, marginBottom: 14, flexWrap: "wrap" }}>
          <SC icon={<Package size={13} />}    label="Total Orders" value={ordersHook.orders.length}                                                      color={C.ac} />
          <SC icon={<Star size={13} />}       label="Rating"       value={`${store?.rating ?? 5.0} ⭐`}                                                  color={C.wa} />
          <SC icon={<Activity size={13} />}   label="Menu Items"   value={menu?.filter(m => m.is_available).length ?? 0}                                  color={C.ok} />
        </div>
        <div style={{ ...gl("wa"), borderRadius: 13, padding: "12px", marginBottom: 13 }}>
          <div style={{ fontWeight: 700, color: C.tx, fontSize: 13, marginBottom: 8 }}>💰 Revenue Breakdown</div>
          {[
            ["Total Delivered", `₦${(totalRevenue / 100).toLocaleString()}`, C.tx],
            ["Service Charges (2%)", `₦${(totalRevenue * 0.02 / 100).toLocaleString()}`, C.ok],
            ["ZaraDrop Commission", `₦${(totalRevenue * 0.02 / 100).toLocaleString()}`, C.su],
            ["Your Net Revenue", `₦${(totalRevenue * 0.96 / 100).toLocaleString()}`, C.wa],
          ].map(([l, v, col]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
              <span style={{ color: C.su, fontSize: 12 }}>{l}</span>
              <span style={{ color: col, fontWeight: 700, fontSize: 12 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 13 }}>
          <MiniChart data={chartData} color={C.wa} range={range} setRange={setRange} title="📊 Revenue" />
        </div>
        {/* Top sellers */}
        {menu && menu.length > 0 && (
          <div style={{ ...gl(), borderRadius: 15, padding: "13px" }}>
            <SH title="🔥 Menu Items" />
            {menu.slice(0, 6).map(it => (
              <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: `${C.ac}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{it.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: C.tx, fontWeight: 600, fontSize: 12 }}>{it.name}</div>
                  <Pill label={it.is_available ? "Available" : "Unavailable"} color={it.is_available ? C.ok : C.er} />
                </div>
                <div style={{ color: C.ac, fontWeight: 700, fontSize: 12 }}>₦{(it.price / 100).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (tab === 3) return <div style={{ padding: P, paddingBottom: 16 }}><WalletScreen wallet={wallet} role="store" /></div>;
  if (tab === 4) return (
    <div style={{ padding: P, paddingBottom: 24 }}>
      {profile?.is_setup
        ? <ProfileCard role="store" profile={profile} wallet={wallet} storeHook={storeHook} isStoreAdmin={isStoreAdmin} />
        : <ProfileSetup role="store" userId={user?.id} />}
    </div>
  );
  return null;
}