import React, { useState, useEffect } from "react";
import { Star, Clock, MapPin, Search, Plus, Minus, MessageCircle, ArrowLeft, Package } from "lucide-react";
import { C, G } from "../constants";
import { gl, fmt } from "../utils";
import { useStores }   from "../hooks/useStores";
import { useOrders }   from "../hooks/useOrders";
import { callFn }      from "../lib/supabase";
import { Pill, SH, Btn, Tog } from "./Micro";
import WalletScreen    from "./WalletScreen";
import { ProfileSetup, ProfileCard } from "./Profile";
import PINModal        from "./PINModal";
import { RequestRiderModal } from "./Modals";

const CATS_FOOD  = ["All","Fast Food","Pizza","Local","Chinese","Japanese","Drinks","Italian"];
const CATS_PHARM = ["All","Prescription","OTC","Vitamins","Baby Care","Personal Care"];
const CATS_SUPER = ["All","Grocery","Fresh Produce","Frozen","Household","Bakery","Beverages"];
const AD_HERO    = [
  { bg:"linear-gradient(135deg,#1A0A2E,#0C0C1E)", accent:C.ac,  title:"ZaraDrop Abuja",  sub:"Order food · Medicine · Groceries", cta:"Explore Now", icon:"⚡", type:"hero"  },
  { bg:"linear-gradient(135deg,#001A0A,#0C0C1E)", accent:C.ok,  title:"Free Delivery",   sub:"On your first pharmacy order",       cta:"Shop Meds",   icon:"💊", type:"promo" },
  { bg:"linear-gradient(135deg,#0A001A,#0C0C1E)", accent:C.ac,  title:"ZP Points",       sub:"Earn 2% back on every order",         cta:"Learn More",  icon:"⭐", type:"promo" },
];

export default function CustomerApp({ tab, isMobile, user, profile, wallet, openChat, notifs }) {
  const [appMode,       setMode]     = useState(null);
  const [cat,           setCat]      = useState("All");
  const [q,             setQ]        = useState("");
  const [storeView,     setSV]       = useState(null);
  const [storeMenu,     setSMenu]    = useState([]);
  const [cart,          setCart]     = useState({});
  const [checkout,      setCheckout] = useState(false);
  const [showReqRider,  setReqRider] = useState(false);
  const [adSlide,       setAdSlide]  = useState(0);
  const [showSearch,    setShowSearch] = useState(false);
  const [payMethod,     setPayMethod] = useState("wallet");
  const [delivAddr,     setDelivAddr] = useState("");
  const [delivPhone,    setDelivPhone] = useState("");
  const [pinOpen,       setPinOpen]  = useState(false);
  const [placeLoading,  setPlaceLoad] = useState(false);
  const [orderError,    setOrdErr]   = useState("");

  const storesHook = useStores(appMode === "Pharmacy" ? "pharmacy" : appMode === "Supermarket" ? "supermarket" : "food");
  const ordersHook = useOrders(user?.id, "customer", null);

  const P = isMobile ? "10px 12px" : "14px 20px";
  const custProfile = profile?.customer_profiles?.[0];
  const zpPoints    = custProfile?.zp_points ?? 0;

  // Auto-advance hero ads
  useEffect(() => {
    if (tab !== 0 || storeView || appMode) return;
    const t = setInterval(() => setAdSlide(p => (p + 1) % AD_HERO.length), 4500);
    return () => clearInterval(t);
  }, [tab, storeView, appMode]);

  useEffect(() => { if (tab === 1 && !appMode) setMode("Food"); }, [tab]);

  // Load menu when store selected
  useEffect(() => {
    if (!storeView) return;
    storesHook.fetchMenu(storeView.id).then(setSMenu);
  }, [storeView?.id]);

  const currentCats = appMode === "Pharmacy" ? CATS_PHARM : appMode === "Supermarket" ? CATS_SUPER : CATS_FOOD;
  const stores      = storesHook.stores;
  const filtered    = stores.filter(s => (cat === "All" || s.category === cat) && (!q || s.name.toLowerCase().includes(q.toLowerCase())));

  const cartTotal   = Object.entries(cart).reduce((s, [id, q]) => { const it = storeMenu.find(x => x.id === id); return s + (it ? (it.price / 100) * q : 0); }, 0);
  const cartCount   = Object.values(cart).reduce((a, v) => a + v, 0);
  const addToCart   = id => setCart(p => ({ ...p, [id]: (p[id] || 0) + 1 }));
  const remFromCart = id => setCart(p => { const n = { ...p }; if (n[id] > 1) n[id]--; else delete n[id]; return n; });

  const doPlaceOrder = async () => {
    setPlaceLoad(true); setOrdErr("");
    try {
      const items = Object.entries(cart).map(([id, quantity]) => {
        const it = storeMenu.find(x => x.id === id);
        return { menu_item_id: id, name: it.name, price: it.price, quantity };
      });
      await callFn("place-order", {
        store_id:         storeView.id,
        items,
        delivery_address: delivAddr,
        customer_phone:   delivPhone,
        payment_method:   payMethod,
        use_zp_points:    false,
      });
      setCart({}); setCheckout(false); setSV(null);
    } catch (e) { setOrdErr(e.message); }
    finally { setPlaceLoad(false); setPinOpen(false); }
  };

  // ── STORE DETAIL ──────────────────────────────────────────
  if (storeView) return (
    <div style={{ paddingBottom: 88 }}>
      {pinOpen && <PINModal title="Confirm Payment" sub="Enter your wallet PIN" stored={null}
        onOk={() => doPlaceOrder()} onCancel={() => setPinOpen(false)} />}
      {/* Store hero */}
      <div style={{ height: 120, background: "linear-gradient(160deg,rgba(193,68,212,.4) 0%,rgba(6,6,15,1) 100%)", position: "relative", display: "flex", alignItems: "flex-end", padding: "12px 13px" }}>
        <button onClick={() => { setSV(null); setSMenu([]); setCart({}); setCheckout(false); }}
          style={{ position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,.5)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,.14)", cursor: "pointer", width: 32, height: 32, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", zIndex: 2 }}>
          <ArrowLeft size={14} />
        </button>
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
          <span style={{ fontSize: 30 }}>{storeView.logo}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>{storeView.name}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.65)", display: "flex", alignItems: "center", gap: 2 }}><Star size={9} fill={C.wa} color={C.wa} />{storeView.rating}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.65)", display: "flex", alignItems: "center", gap: 2 }}><MapPin size={9} />{storeView.location}</span>
              <Pill label={storeView.is_open ? "Open" : "Closed"} color={storeView.is_open ? C.ok : C.er} />
            </div>
          </div>
          <button onClick={() => openChat(`conv_${storeView.id}`, storeView.name, storeView.logo, "store")}
            style={{ background: "rgba(193,68,212,.18)", border: `1px solid ${C.ac}30`, cursor: "pointer", width: 32, height: 32, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: C.ac }}>
            <MessageCircle size={14} />
          </button>
        </div>
      </div>
      {/* Menu */}
      <div style={{ padding: "13px 13px 0" }}>
        {storeMenu.filter(it => it.is_popular && it.is_available).length > 0 && (
          <>
            <SH title="🔥 Popular" />
            <div style={{ display: "flex", gap: 9, overflowX: "auto", marginBottom: 14, scrollbarWidth: "none", paddingBottom: 3 }}>
              {storeMenu.filter(it => it.is_popular && it.is_available).map(it => {
                const q = cart[it.id] || 0;
                const priceN = it.price / 100;
                return (
                  <div key={it.id} style={{ flexShrink: 0, width: 124, ...gl(), borderRadius: 14, padding: "11px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ fontSize: 24, textAlign: "center" }}>{it.emoji}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.tx, textAlign: "center", lineHeight: 1.3 }}>{it.name}</div>
                    <div style={{ fontSize: 12, color: C.ac, fontWeight: 800, textAlign: "center" }}>₦{priceN.toLocaleString()}</div>
                    {q === 0 ? <Btn v="o" sm full onClick={() => addToCart(it.id)}>+ Add</Btn>
                      : <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <button onClick={() => remFromCart(it.id)} style={{ width: 26, height: 26, borderRadius: 7, background: `${C.ac}12`, border: `1px solid ${C.ac}22`, color: C.ac, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={10} /></button>
                        <span style={{ color: C.tx, fontWeight: 700 }}>{q}</span>
                        <button onClick={() => addToCart(it.id)} style={{ width: 26, height: 26, borderRadius: 7, background: G, border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={10} /></button>
                      </div>}
                  </div>
                );
              })}
            </div>
          </>
        )}
        <SH title="Full Menu" />
        {storeMenu.length === 0 && (
          <div style={{ textAlign: "center", padding: "30px 0", color: C.su, fontSize: 12 }}>
            {storesHook.loading ? "Loading menu…" : "No items available"}
          </div>
        )}
        {storeMenu.map(it => {
          const priceN = it.price / 100;
          const q = cart[it.id] || 0;
          return (
            <div key={it.id} style={{ ...gl(), borderRadius: 13, padding: "11px 12px", marginBottom: 7, display: "flex", alignItems: "center", gap: 9, opacity: !it.is_available ? 0.45 : 1 }}>
              <div style={{ fontSize: 20, flexShrink: 0 }}>{it.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: C.tx, fontSize: 13 }}>{it.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 1 }}>
                  <div style={{ fontSize: 12, color: C.ac, fontWeight: 700 }}>₦{priceN.toLocaleString()}</div>
                  {!it.is_available ? <Pill label="Unavailable" color={C.er} />
                    : it.stock != null && it.stock <= 5 ? <Pill label={`${it.stock} left`} color={C.wa} /> : null}
                </div>
              </div>
              {it.is_available && (
                q === 0
                  ? <button onClick={() => addToCart(it.id)} style={{ width: 28, height: 28, borderRadius: 8, background: G, border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={12} /></button>
                  : <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button onClick={() => remFromCart(it.id)} style={{ width: 26, height: 26, borderRadius: 7, background: `${C.ac}12`, border: `1px solid ${C.ac}22`, color: C.ac, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={10} /></button>
                    <span style={{ color: C.tx, fontWeight: 700, fontSize: 13, minWidth: 14, textAlign: "center" }}>{q}</span>
                    <button onClick={() => addToCart(it.id)} style={{ width: 26, height: 26, borderRadius: 7, background: G, border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={10} /></button>
                  </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Cart bar */}
      {cartCount > 0 && !checkout && (
        <div style={{ position: "fixed", bottom: 58, left: 0, right: 0, padding: "0 10px", zIndex: 100 }}>
          <button onClick={() => setCheckout(true)} style={{ width: "100%", padding: "14px", borderRadius: 15, background: G, border: "none", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 8px 32px rgba(193,68,212,.5)", fontFamily: "inherit" }}>
            <span style={{ background: "rgba(255,255,255,.2)", borderRadius: 8, padding: "3px 9px", fontSize: 12 }}>{cartCount} item{cartCount !== 1 ? "s" : ""}</span>
            <span>Checkout →</span>
            <span>₦{cartTotal.toLocaleString()}</span>
          </button>
        </div>
      )}
      {/* Checkout drawer */}
      {checkout && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.87)", backdropFilter: "blur(16px)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 900 }} onClick={e => e.target === e.currentTarget && setCheckout(false)}>
          <div style={{ background: "#0D0D22", border: "1px solid #252548", borderRadius: "22px 22px 0 0", padding: "18px 14px 30px", width: "100%", maxWidth: 480, boxSizing: "border-box", maxHeight: "92vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: C.tx }}>Checkout — {storeView.name}</div>
              <button onClick={() => setCheckout(false)} style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", cursor: "pointer", width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: C.su }}>✕</button>
            </div>
            {/* Items */}
            <div style={{ ...gl(), borderRadius: 13, padding: "11px 12px", marginBottom: 10 }}>
              {Object.entries(cart).map(([id, q]) => {
                const it = storeMenu.find(x => x.id === id);
                if (!it) return null;
                return <div key={id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: C.su }}>{it.emoji} {it.name} ×{q}</span>
                  <span style={{ fontSize: 12, color: C.tx, fontWeight: 600 }}>₦{((it.price / 100) * q).toLocaleString()}</span>
                </div>;
              })}
              <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", marginTop: 6, paddingTop: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.su, marginBottom: 3 }}><span>Subtotal</span><span>₦{cartTotal.toLocaleString()}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.su, marginBottom: 3 }}><span>Delivery Fee</span><span>₦900</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.su, marginBottom: 3 }}><span>Service (2%)</span><span>₦{(cartTotal * 0.02).toFixed(0)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: C.ac, marginTop: 4 }}><span>Total</span><span>₦{(cartTotal + 900 + cartTotal * 0.02).toLocaleString()}</span></div>
                <div style={{ fontSize: 10, color: C.ok, marginTop: 4 }}>🌟 You'll earn {Math.round(cartTotal * 0.02)} ZP</div>
              </div>
            </div>
            {/* Address */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, color: C.su, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>DELIVERY ADDRESS</div>
              <input value={delivAddr} onChange={e => setDelivAddr(e.target.value)} placeholder="Your full delivery address…"
                style={{ width: "100%", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 9, padding: "8px 11px", fontSize: 12.5, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#EEF0FF" }} />
            </div>
            {/* Phone for delivery */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, color: C.su, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>PHONE FOR DELIVERY <span style={{color:'rgba(255,255,255,.25)'}}>— so rider can reach you</span></div>
              <input value={delivPhone} onChange={e => setDelivPhone(e.target.value)} placeholder="+234 800 000 0000" type="tel"
                style={{ width: "100%", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 9, padding: "8px 11px", fontSize: 12.5, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#EEF0FF" }} />
            </div>
            {/* Payment */}
            <div style={{ marginBottom: 13 }}>
              <div style={{ fontSize: 9, color: C.su, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>PAYMENT METHOD</div>
              {[{ k: "wallet", i: "⚡", l: "ZaraDrop Wallet", s: `Balance: ₦${(wallet.balance ?? 0).toLocaleString()}`, c: C.ac }, { k: "cash", i: "💵", l: "Cash on Delivery", s: "Pay rider directly", c: C.wa }].map(m => (
                <div key={m.k} onClick={() => setPayMethod(m.k)} style={{ ...gl(), border: `1px solid ${payMethod === m.k ? m.c + "42" : "rgba(255,255,255,.08)"}`, borderRadius: 12, padding: "10px 12px", marginBottom: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, background: payMethod === m.k ? `${m.c}0D` : "transparent" }}>
                  <span style={{ fontSize: 17 }}>{m.i}</span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: payMethod === m.k ? m.c : C.tx }}>{m.l}</div><div style={{ fontSize: 10, color: C.su }}>{m.s}</div></div>
                  <div style={{ width: 15, height: 15, borderRadius: "50%", border: `2px solid ${payMethod === m.k ? m.c : C.bd}`, background: payMethod === m.k ? m.c : "transparent", flexShrink: 0 }} />
                </div>
              ))}
            </div>
            {orderError && <div style={{ color: C.er, fontSize: 12, marginBottom: 10, fontWeight: 600 }}>{orderError}</div>}
            <Btn v="p" full disabled={placeLoading || delivAddr.trim().length < 5 || delivPhone.trim().length < 8}
              onClick={() => payMethod === "wallet" ? setPinOpen(true) : doPlaceOrder()}>
              {placeLoading ? "Placing…" : `🚀 Place Order · ₦${(cartTotal + 900 + cartTotal * 0.02).toFixed(0)}`}
            </Btn>
          </div>
        </div>
      )}
    </div>
  );

  // ── HOME / STORES TAB ───────────────────────────────────────
  if (tab === 0 || tab === 1) {
    const slide = AD_HERO[adSlide];
    const modeColor = appMode === "Pharmacy" ? "#22D47C" : appMode === "Supermarket" ? "#F59E0B" : C.ac;
    const featured  = stores.filter(s => s.is_featured && s.is_open);

    // Inside-mode view
    if (appMode) return (
      <div style={{ paddingBottom: 16 }}>
        {showReqRider && <RequestRiderModal onClose={() => setReqRider(false)} />}
        {/* Fixed sub-header */}
        <div style={{ position: "fixed", top: 48, left: 0, right: 0, background: "rgba(6,6,15,.98)", backdropFilter: "blur(20px)", zIndex: 150, borderBottom: "1px solid rgba(255,255,255,.07)", padding: "0 12px", height: 44, display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => { setMode(null); setCat("All"); setQ(""); setShowSearch(false); }} style={{ background: "none", border: "none", cursor: "pointer", width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.5)", flexShrink: 0 }}>
            <ArrowLeft size={15} />
          </button>
          {showSearch ? (
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={11} color="rgba(255,255,255,.3)" style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)" }} />
              <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search…"
                style={{ width: "100%", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, padding: "6px 8px 6px 26px", fontSize: 12, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#EEF0FF" }} />
              <button onClick={() => { setShowSearch(false); setQ(""); }} style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.4)", fontFamily: "inherit", fontSize: 13 }}>✕</button>
            </div>
          ) : (
            <div style={{ flex: 1, fontWeight: 800, fontSize: 14, color: C.tx }}>
              {appMode === "Food" ? "🍽️ Restaurants" : appMode === "Pharmacy" ? "💊 Pharmacies" : "🛒 Supermarkets"}
            </div>
          )}
          <button onClick={() => setShowSearch(p => !p)} style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)", cursor: "pointer", width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.55)", flexShrink: 0 }}>
            <Search size={13} />
          </button>
          {appMode === "Food" && (
            <button onClick={() => setReqRider(true)} style={{ background: "rgba(255,107,53,.1)", border: "1px solid rgba(255,107,53,.22)", borderRadius: 8, padding: "5px 9px", cursor: "pointer", color: "#FF6B35", fontSize: 10, fontWeight: 700, fontFamily: "inherit", flexShrink: 0, whiteSpace: "nowrap" }}>
              🎯 Rider
            </button>
          )}
        </div>
        <div style={{ paddingTop: 52 }}>
          {/* Category pills */}
          <div style={{ padding: "6px 12px 2px", background: "rgba(6,6,15,.7)" }}>
            <div style={{ display: "flex", gap: 5, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2 }}>
              {currentCats.map(c => (
                <div key={c} onClick={() => setCat(c)} style={{ flexShrink: 0, padding: "5px 11px", borderRadius: 18, cursor: "pointer", fontSize: 11, fontWeight: cat === c ? 700 : 500, background: cat === c ? (appMode === "Pharmacy" ? "rgba(34,212,124,.2)" : appMode === "Supermarket" ? "rgba(245,158,11,.2)" : G) : "rgba(255,255,255,.04)", color: cat === c ? "#fff" : "rgba(255,255,255,.45)", transition: "all .16s" }}>{c}</div>
              ))}
            </div>
          </div>
          <div style={{ padding: "8px 12px 0" }}>
            {/* Featured row */}
            {!q && cat === "All" && featured.length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.su, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>⭐ Featured</div>
                <div style={{ display: "flex", gap: 7, overflowX: "auto", marginBottom: 10, scrollbarWidth: "none" }}>
                  {featured.map(s => (
                    <div key={s.id} onClick={() => setSV(s)} style={{ flexShrink: 0, width: 100, background: "rgba(255,255,255,.03)", border: `1px solid ${modeColor}20`, borderRadius: 11, padding: "9px 8px", cursor: "pointer" }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: `${modeColor}14`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginBottom: 5 }}>{s.logo}</div>
                      <div style={{ fontWeight: 700, color: C.tx, fontSize: 10, lineHeight: 1.2, marginBottom: 2 }}>{s.name}</div>
                      <div style={{ fontSize: 9, color: modeColor, fontWeight: 700 }}>⭐ {s.rating}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {/* Store list */}
            <div style={{ fontSize: 10, fontWeight: 700, color: C.su, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              {storesHook.loading ? "Loading…" : `${filtered.length} ${appMode === "Food" ? "restaurants" : appMode === "Pharmacy" ? "pharmacies" : "stores"}`}
            </div>
            {filtered.map(s => (
              <div key={s.id} style={{ background: "rgba(255,255,255,.03)", border: `1px solid ${modeColor}18`, borderRadius: 13, padding: "11px", display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 6 }}>
                <div onClick={() => setSV(s)} style={{ width: 42, height: 42, borderRadius: 11, background: `${modeColor}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, flexShrink: 0, cursor: "pointer" }}>{s.logo}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2, flexWrap: "wrap" }}>
                    <span onClick={() => setSV(s)} style={{ fontWeight: 700, color: C.tx, fontSize: 13, cursor: "pointer" }}>{s.name}</span>
                    <Pill label={s.is_open ? "Open" : "Closed"} color={s.is_open ? C.ok : C.er} />
                    {s.is_featured && <Pill label="Top" color={modeColor} />}
                  </div>
                  {s.tagline && <div style={{ fontSize: 10, color: C.su, marginBottom: 4 }}>{s.tagline}</div>}
                  <div style={{ display: "flex", gap: 8, color: "rgba(255,255,255,.35)", fontSize: 10, marginBottom: 6 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 2 }}><Star size={8} fill={C.wa} color={C.wa} />{s.rating}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 2 }}><MapPin size={8} />{s.location}</span>
                  </div>
                  <div style={{ display: "flex", gap: 5 }}>
                    <Btn v="p" sm onClick={() => setSV(s)}>View Menu</Btn>
                    <Btn v="ghost" sm onClick={() => openChat(`conv_${s.id}`, s.name, s.logo, "store")}><MessageCircle size={10} />Chat</Btn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    // Landing home
    return (
      <div style={{ paddingBottom: 16 }}>
        {/* Hero ad carousel */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ background: slide.bg, padding: "14px 14px 10px", minHeight: 116, position: "relative", overflow: "hidden", transition: "background .7s ease" }}>
            <div style={{ position: "absolute", right: 14, top: 10, fontSize: 42, opacity: 0.1, pointerEvents: "none" }}>{slide.icon}</div>
            <div style={{ position: "relative", zIndex: 1 }}>
              {zpPoints > 0 && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(245,158,11,.14)", border: "1px solid rgba(245,158,11,.22)", borderRadius: 20, padding: "2px 8px", marginBottom: 6 }}>
                  <span style={{ fontSize: 10 }}>⭐</span>
                  <span style={{ color: C.wa, fontWeight: 700, fontSize: 10 }}>{zpPoints} ZP</span>
                </div>
              )}
              <div style={{ fontSize: 8, color: slide.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 2 }}>{slide.type === "hero" ? "ZaraDrop Abuja" : "Promotion"}</div>
              <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 3 }}>{slide.title}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)", marginBottom: 8 }}>{slide.sub}</div>
              <button style={{ background: slide.accent, border: "none", borderRadius: 7, padding: "5px 11px", fontSize: 10, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>{slide.cta}</button>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 4, padding: "5px 0", background: C.bg }}>
            {AD_HERO.map((_, i) => <div key={i} onClick={() => setAdSlide(i)} style={{ width: i === adSlide ? 14 : 4, height: 4, borderRadius: 2, background: i === adSlide ? slide.accent : "rgba(255,255,255,.13)", transition: "all .3s", cursor: "pointer" }} />)}
          </div>
        </div>

        <div style={{ padding: "8px 12px 0" }}>
          {/* Search */}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <Search size={12} color="rgba(255,255,255,.25)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search food, medicine, groceries…"
              style={{ width: "100%", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "8px 10px 8px 30px", fontSize: 12, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#EEF0FF" }} />
          </div>

          {/* Category cards */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.su, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>What are you looking for?</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { mode: "Food",        icon: "🍽️", label: "Food",        sub: "Restaurants",  bg: "linear-gradient(145deg,rgba(193,68,212,.18),rgba(139,48,201,.08))", border: "rgba(193,68,212,.22)", sh: "rgba(193,68,212,.2)" },
                { mode: "Pharmacy",    icon: "💊", label: "Pharmacy",    sub: "Pharmacies",   bg: "linear-gradient(145deg,rgba(34,212,124,.15),rgba(34,212,124,.05))",  border: "rgba(34,212,124,.2)",   sh: "rgba(34,212,124,.18)" },
                { mode: "Supermarket", icon: "🛒", label: "Supermarket", sub: "Supermarkets", bg: "linear-gradient(145deg,rgba(245,158,11,.15),rgba(245,158,11,.05))",  border: "rgba(245,158,11,.2)",   sh: "rgba(245,158,11,.18)" },
              ].map(card => (
                <div key={card.mode} onClick={() => { setMode(card.mode); setCat("All"); setQ(""); }}
                  style={{ borderRadius: 14, background: card.bg, border: `1px solid ${card.border}`, padding: "14px 10px", cursor: "pointer", textAlign: "center", transition: "all .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${card.sh}`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{card.icon}</div>
                  <div style={{ fontWeight: 800, color: C.tx, fontSize: 12, marginBottom: 2 }}>{card.label}</div>
                  <div style={{ fontSize: 9, color: C.su }}>{card.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured strip */}
          {!q && featured.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.su, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>⭐ Featured</div>
              <div style={{ display: "flex", gap: 7, overflowX: "auto", marginBottom: 12, scrollbarWidth: "none" }}>
                {featured.map(s => (
                  <div key={s.id} onClick={() => { setMode("Food"); setSV(s); }} style={{ flexShrink: 0, width: 108, background: "rgba(255,255,255,.03)", border: "1px solid rgba(193,68,212,.15)", borderRadius: 11, padding: "9px 8px", cursor: "pointer" }}>
                    <div style={{ fontSize: 28, marginBottom: 5 }}>{s.logo}</div>
                    <div style={{ fontWeight: 700, color: C.tx, fontSize: 10, lineHeight: 1.2, marginBottom: 2 }}>{s.name}</div>
                    <div style={{ fontSize: 9, color: C.wa, fontWeight: 700 }}>⭐ {s.rating}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Request rider banner */}
          <div onClick={() => setReqRider(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 11px", borderRadius: 11, background: "rgba(255,107,53,.07)", border: "1px solid rgba(255,107,53,.18)", cursor: "pointer" }}>
            <span style={{ fontSize: 18 }}>🎯</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: C.tx, fontSize: 12 }}>Request a Specific Rider</div>
              <div style={{ color: C.su, fontSize: 10, marginTop: 1 }}>Pick your rider — they quote their price</div>
            </div>
            <span style={{ fontSize: 9, color: "#FF6B35", fontWeight: 700, border: "1px solid rgba(255,107,53,.28)", borderRadius: 7, padding: "2px 6px" }}>New ⚡</span>
          </div>
          {showReqRider && <RequestRiderModal onClose={() => setReqRider(false)} />}
        </div>
      </div>
    );
  }

  // ── ORDERS TAB ──────────────────────────────────────────────
  if (tab === 2) {
    const SM = { pending:{ color:C.wa,label:"Pending",icon:"⏳"}, confirmed:{color:C.ok,label:"Confirmed",icon:"✅"}, preparing:{color:C.ac,label:"Preparing",icon:"👨‍🍳"}, ready:{color:C.ok,label:"Ready",icon:"📦"}, assigned:{color:C.ac,label:"Rider Found",icon:"🏍️"}, picked_up:{color:C.ok,label:"Picked Up",icon:"✅"}, delivering:{color:C.ac,label:"On the Way",icon:"🏍️"}, delivered:{color:C.ok,label:"Delivered",icon:"🎉"}, cancelled:{color:C.er,label:"Cancelled",icon:"❌"} };
    return (
      <div style={{ padding: P, paddingBottom: 16 }}>
        <SH title="My Orders" sub="Live delivery tracking" />
        {ordersHook.loading && <div style={{ textAlign: "center", padding: "40px", color: C.su }}>Loading orders…</div>}
        {!ordersHook.loading && ordersHook.orders.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <div style={{ fontWeight: 700, color: C.tx, fontSize: 16, marginBottom: 6 }}>No orders yet</div>
            <div style={{ color: C.su, fontSize: 12 }}>Your orders will appear here once placed</div>
          </div>
        )}
        {ordersHook.orders.map(o => {
          const st = SM[o.status] ?? { color: C.su, label: o.status, icon: "📦" };
          return (
            <div key={o.id} style={{ ...gl(), borderRadius: 13, padding: "11px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: `${C.ac}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>{o.stores?.logo ?? "🛍️"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: C.tx, fontSize: 13 }}>{o.stores?.name ?? "Store"}</div>
                  <div style={{ fontSize: 10, color: C.su, marginTop: 1 }}>{o.order_items?.map(i => `${i.name} ×${i.quantity}`).join(", ")}</div>
                </div>
                <Pill label={`${st.icon} ${st.label}`} color={st.color} />
              </div>
              {/* Delivery code */}
              {o.status === "delivering" && (
                <div style={{ background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.25)", borderRadius: 8, padding: "7px 10px", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🔑</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 8, color: C.wa, fontWeight: 700, letterSpacing: 1 }}>DELIVERY CODE</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: C.wa, letterSpacing: 8, marginTop: 1 }}>{o.order_code}</div>
                  </div>
                  <div style={{ fontSize: 9, color: C.su, maxWidth: 80, lineHeight: 1.4, textAlign: "right" }}>Show to rider on arrival</div>
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ fontSize: 12, color: C.ac, fontWeight: 700 }}>₦{(o.total / 100).toLocaleString()}</div>
                <span style={{ color: C.su, fontSize: 11 }}>· {new Date(o.created_at).toLocaleDateString("en-NG")}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (tab === 3) return <div style={{ padding: P, paddingBottom: 16 }}><WalletScreen wallet={wallet} role="customer" /></div>;
  if (tab === 4) return (
    <div style={{ padding: P, paddingBottom: 16 }}>
      {profile?.is_setup
        ? <ProfileCard role="customer" profile={profile} wallet={wallet} />
        : <ProfileSetup role="customer" userId={user?.id} />}
    </div>
  );
  return null;
}