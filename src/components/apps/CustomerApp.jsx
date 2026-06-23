import React, { useState, useEffect } from "react";
import {
  Star, MapPin, Search, Plus, Minus, MessageCircle, ArrowLeft,
  Wallet, Banknote, KeyRound, Flame, Sparkles, Target, Rocket,
} from "lucide-react";
import { C, G } from "../../styles/tokens";
import { gl } from "../../styles/glass";
import { statusMeta } from "../../styles/statusIcons";
import { useStores }   from "../../hooks/useStores";
import { useOrders }   from "../../hooks/useOrders";
import { useHubs }     from "../../hooks/useHubs";
import { callFn }      from "../../lib/supabase";
import { Pill, SH, Btn, Tog } from "../shared/Micro";
import WalletScreen    from "../shared/WalletScreen";
import { ProfileSetup, ProfileCard } from "../shared/Profile";
import PINModal        from "../shared/PINModal";
import { RequestRiderModal } from "../shared/Modals";

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
      <div style={{ height: 132, background: "linear-gradient(160deg,rgba(193,63,224,.4) 0%,var(--zd-bg) 100%)", position: "relative", display: "flex", alignItems: "flex-end", padding: "12px 14px" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 85% -10%, rgba(193,63,224,.35), transparent 55%)", pointerEvents: "none" }} />
        <button onClick={() => { setSV(null); setSMenu([]); setCart({}); setCheckout(false); }}
          style={{ position: "absolute", top: 12, left: 12, background: "rgba(10,8,18,.55)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,.16)", cursor: "pointer", width: 33, height: 33, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", zIndex: 2, transition: "transform .15s ease" }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateX(-2px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "none"}>
          <ArrowLeft size={15} />
        </button>
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 11, width: "100%" }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(10,8,18,.4)", border: "1px solid rgba(255,255,255,.14)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{storeView.logo}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 17, color: "#fff", letterSpacing: -.2 }}>{storeView.name}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.68)", display: "flex", alignItems: "center", gap: 3 }}><Star size={10} fill="#F5A623" color="#F5A623" />{storeView.rating}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.68)", display: "flex", alignItems: "center", gap: 3 }}><MapPin size={10} />{storeView.location}</span>
              <Pill label={storeView.is_open ? "Open" : "Closed"} color={storeView.is_open ? C.ok : C.er} />
            </div>
          </div>
          <button onClick={() => openChat(`conv_${storeView.id}`, storeView.name, storeView.logo, "store")}
            style={{ background: "rgba(193,63,224,.2)", border: `1px solid ${C.ac}40`, cursor: "pointer", width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: C.ac, transition: "transform .15s ease" }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
            <MessageCircle size={15} />
          </button>
        </div>
      </div>
      {/* Menu */}
      <div style={{ padding: "14px 13px 0" }}>
        {storeMenu.filter(it => it.is_popular && it.is_available).length > 0 && (
          <>
            <SH title={<span style={{ display: "flex", alignItems: "center", gap: 6 }}><Flame size={14} color="#FF6B35" />Popular</span>} />
            <div className="zd-hide-scroll" style={{ display: "flex", gap: 9, overflowX: "auto", marginBottom: 16, paddingBottom: 3 }}>
              {storeMenu.filter(it => it.is_popular && it.is_available).map(it => {
                const q = cart[it.id] || 0;
                const priceN = it.price / 100;
                return (
                  <div key={it.id} style={{ flexShrink: 0, width: 128, ...gl(), borderRadius: 16, padding: "12px 11px", display: "flex", flexDirection: "column", gap: 5 }}>
                    <div style={{ fontSize: 26, textAlign: "center" }}>{it.emoji}</div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: C.tx, textAlign: "center", lineHeight: 1.3 }}>{it.name}</div>
                    <div className="zd-tabular" style={{ fontSize: 12.5, color: C.ac, fontWeight: 800, textAlign: "center" }}>₦{priceN.toLocaleString()}</div>
                    {q === 0 ? <Btn v="o" sm full onClick={() => addToCart(it.id)}><Plus size={11} />Add</Btn>
                      : <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <button onClick={() => remFromCart(it.id)} style={{ width: 27, height: 27, borderRadius: 8, background: `${C.ac}16`, border: `1px solid ${C.ac}28`, color: C.ac, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={11} /></button>
                        <span className="zd-tabular" style={{ color: C.tx, fontWeight: 700 }}>{q}</span>
                        <button onClick={() => addToCart(it.id)} style={{ width: 27, height: 27, borderRadius: 8, background: G, border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 10px rgba(193,63,224,.4)" }}><Plus size={11} /></button>
                      </div>}
                  </div>
                );
              })}
            </div>
          </>
        )}
        <SH title="Full Menu" />
        {storeMenu.length === 0 && (
          <div style={{ textAlign: "center", padding: "34px 0", color: C.su, fontSize: 12 }}>
            {storesHook.loading ? "Loading menu…" : "No items available"}
          </div>
        )}
        {storeMenu.map(it => {
          const priceN = it.price / 100;
          const q = cart[it.id] || 0;
          return (
            <div key={it.id} style={{ ...gl(), borderRadius: 14, padding: "12px 13px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10, opacity: !it.is_available ? 0.45 : 1, transition: "border-color .15s ease" }}>
              <div style={{ fontSize: 21, flexShrink: 0, width: 38, height: 38, borderRadius: 11, background: "var(--zd-surface-hover)", display: "flex", alignItems: "center", justifyContent: "center" }}>{it.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: C.tx, fontSize: 13.5 }}>{it.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 2 }}>
                  <div className="zd-tabular" style={{ fontSize: 12.5, color: C.ac, fontWeight: 700 }}>₦{priceN.toLocaleString()}</div>
                  {!it.is_available ? <Pill label="Unavailable" color={C.er} />
                    : it.stock != null && it.stock <= 5 ? <Pill label={`${it.stock} left`} color={C.wa} /> : null}
                </div>
              </div>
              {it.is_available && (
                q === 0
                  ? <button onClick={() => addToCart(it.id)} style={{ width: 30, height: 30, borderRadius: 9, background: G, border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 10px rgba(193,63,224,.35)" }}><Plus size={13} /></button>
                  : <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <button onClick={() => remFromCart(it.id)} style={{ width: 27, height: 27, borderRadius: 8, background: `${C.ac}16`, border: `1px solid ${C.ac}28`, color: C.ac, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={11} /></button>
                    <span className="zd-tabular" style={{ color: C.tx, fontWeight: 700, fontSize: 13, minWidth: 14, textAlign: "center" }}>{q}</span>
                    <button onClick={() => addToCart(it.id)} style={{ width: 27, height: 27, borderRadius: 8, background: G, border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={11} /></button>
                  </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Cart bar — sticky on desktop so it never spills past the sidebar, fixed (viewport) on mobile */}
      {cartCount > 0 && !checkout && (
        <div style={{
          position: isMobile ? "fixed" : "sticky",
          bottom: isMobile ? 58 : 16,
          left: 0, right: 0,
          padding: isMobile ? "0 10px" : "0",
          zIndex: 100,
        }}>
          <button onClick={() => setCheckout(true)} style={{ width: "100%", padding: "15px 18px", borderRadius: 16, background: G, border: "none", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 12px 36px rgba(193,63,224,.45)", fontFamily: "inherit", transition: "transform .15s ease" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}>
            <span style={{ background: "rgba(255,255,255,.22)", borderRadius: 9, padding: "4px 10px", fontSize: 12 }}>{cartCount} item{cartCount !== 1 ? "s" : ""}</span>
            <span>Checkout →</span>
            <span className="zd-tabular">₦{cartTotal.toLocaleString()}</span>
          </button>
        </div>
      )}
      {/* Checkout drawer */}
      {checkout && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(4,3,9,.82)", backdropFilter: "blur(18px)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 900 }} onClick={e => e.target === e.currentTarget && setCheckout(false)}>
          <div style={{ background: "var(--zd-surface-1)", border: "1px solid var(--zd-border)", borderRadius: "24px 24px 0 0", padding: "20px 16px 30px", width: "100%", maxWidth: 480, boxSizing: "border-box", maxHeight: "92vh", overflowY: "auto", boxShadow: "var(--zd-shadow-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
              <div style={{ fontWeight: 800, fontSize: 15.5, color: C.tx }}>Checkout — {storeView.name}</div>
              <button onClick={() => setCheckout(false)} style={{ background: "var(--zd-surface)", border: "1px solid var(--zd-border)", cursor: "pointer", width: 31, height: 31, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: C.su }}>✕</button>
            </div>
            {/* Items */}
            <div style={{ ...gl(), borderRadius: 14, padding: "12px 13px", marginBottom: 11 }}>
              {Object.entries(cart).map(([id, q]) => {
                const it = storeMenu.find(x => x.id === id);
                if (!it) return null;
                return <div key={id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: C.su }}>{it.emoji} {it.name} ×{q}</span>
                  <span className="zd-tabular" style={{ fontSize: 12, color: C.tx, fontWeight: 600 }}>₦{((it.price / 100) * q).toLocaleString()}</span>
                </div>;
              })}
              <div style={{ borderTop: "1px solid var(--zd-border)", marginTop: 7, paddingTop: 7 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.su, marginBottom: 4 }}><span>Subtotal</span><span className="zd-tabular">₦{cartTotal.toLocaleString()}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.su, marginBottom: 4 }}><span>Delivery Fee</span><span className="zd-tabular">₦900</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.su, marginBottom: 4 }}><span>Service (2%)</span><span className="zd-tabular">₦{(cartTotal * 0.02).toFixed(0)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800, color: C.ac, marginTop: 5 }}><span>Total</span><span className="zd-tabular">₦{(cartTotal + 900 + cartTotal * 0.02).toLocaleString()}</span></div>
                <div style={{ fontSize: 10, color: C.ok, marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}><Sparkles size={11} />You'll earn {Math.round(cartTotal * 0.02)} ZP</div>
              </div>
            </div>
            {/* Address */}
            <div style={{ marginBottom: 9 }}>
              <div style={{ fontSize: 9.5, color: "var(--zd-text-faint)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.1, marginBottom: 4 }}>DELIVERY ADDRESS</div>
              <input value={delivAddr} onChange={e => setDelivAddr(e.target.value)} placeholder="Your full delivery address…"
                style={{ width: "100%", background: "var(--zd-surface)", border: "1px solid var(--zd-border)", borderRadius: 11, padding: "9px 12px", fontSize: 12.5, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "var(--zd-text)" }} />
            </div>
            {/* Phone for delivery */}
            <div style={{ marginBottom: 11 }}>
              <div style={{ fontSize: 9.5, color: "var(--zd-text-faint)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.1, marginBottom: 4 }}>PHONE FOR DELIVERY <span style={{color:"var(--zd-text-faint)", textTransform: "none", letterSpacing: 0, fontWeight: 500}}>— so rider can reach you</span></div>
              <input value={delivPhone} onChange={e => setDelivPhone(e.target.value)} placeholder="+234 800 000 0000" type="tel"
                style={{ width: "100%", background: "var(--zd-surface)", border: "1px solid var(--zd-border)", borderRadius: 11, padding: "9px 12px", fontSize: 12.5, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "var(--zd-text)" }} />
            </div>
            {/* Payment */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9.5, color: "var(--zd-text-faint)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.1, marginBottom: 7 }}>PAYMENT METHOD</div>
              {[{ k: "wallet", Icon: Wallet, l: "ZaraDrop Wallet", s: `Balance: ₦${(wallet.balance ?? 0).toLocaleString()}`, c: C.ac }, { k: "cash", Icon: Banknote, l: "Cash on Delivery", s: "Pay rider directly", c: C.wa }].map(m => (
                <div key={m.k} onClick={() => setPayMethod(m.k)} style={{ ...gl(), border: `1px solid ${payMethod === m.k ? m.c + "55" : "var(--zd-border)"}`, borderRadius: 13, padding: "11px 13px", marginBottom: 7, cursor: "pointer", display: "flex", alignItems: "center", gap: 11, background: payMethod === m.k ? `${m.c}10` : undefined }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `${m.c}18`, display: "flex", alignItems: "center", justifyContent: "center", color: m.c, flexShrink: 0 }}><m.Icon size={16} /></div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: payMethod === m.k ? m.c : C.tx }}>{m.l}</div><div style={{ fontSize: 10, color: C.su }}>{m.s}</div></div>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${payMethod === m.k ? m.c : "var(--zd-border-strong)"}`, background: payMethod === m.k ? m.c : "transparent", flexShrink: 0 }} />
                </div>
              ))}
            </div>
            {orderError && <div style={{ color: C.er, fontSize: 12, marginBottom: 10, fontWeight: 600 }}>{orderError}</div>}
            <Btn v="p" full disabled={placeLoading || delivAddr.trim().length < 5 || delivPhone.trim().length < 8}
              onClick={() => payMethod === "wallet" ? setPinOpen(true) : doPlaceOrder()}>
              {placeLoading ? "Placing…" : <><Rocket size={14} />Place Order · ₦{(cartTotal + 900 + cartTotal * 0.02).toFixed(0)}</>}
            </Btn>
          </div>
        </div>
      )}
    </div>
  );

  // ── HOME / STORES TAB ───────────────────────────────────────
  if (tab === 0 || tab === 1) {
    const slide = AD_HERO[adSlide];
    const modeColor = appMode === "Pharmacy" ? C.ok : appMode === "Supermarket" ? C.wa : C.ac;
    const featured  = stores.filter(s => s.is_featured && s.is_open);

    // Inside-mode view
    if (appMode) return (
      <div style={{ paddingBottom: 16 }}>
        {showReqRider && <RequestRiderModal onClose={() => setReqRider(false)} />}
        {/* Sub-header — sticky on desktop (stays within the content column, never spills onto the sidebar), fixed to the viewport on mobile */}
        <div style={{
          position: isMobile ? "fixed" : "sticky",
          top: isMobile ? 48 : 0,
          left: 0, right: 0,
          background: "var(--zd-bg)",
          backdropFilter: "blur(20px)",
          zIndex: 150,
          borderBottom: "1px solid var(--zd-border)",
          padding: "0 12px", height: 46,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <button onClick={() => { setMode(null); setCat("All"); setQ(""); setShowSearch(false); }} style={{ background: "none", border: "none", cursor: "pointer", width: 29, height: 29, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--zd-text-dim)", flexShrink: 0 }}>
            <ArrowLeft size={16} />
          </button>
          {showSearch ? (
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={12} color="var(--zd-text-faint)" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }} />
              <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search…"
                style={{ width: "100%", background: "var(--zd-surface)", border: "1px solid var(--zd-border)", borderRadius: 9, padding: "7px 9px 7px 28px", fontSize: 12, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "var(--zd-text)" }} />
              <button onClick={() => { setShowSearch(false); setQ(""); }} style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--zd-text-faint)", fontFamily: "inherit", fontSize: 13 }}>✕</button>
            </div>
          ) : (
            <div style={{ flex: 1, fontWeight: 800, fontSize: 14.5, color: C.tx, letterSpacing: -.2 }}>
              {appMode === "Food" ? "Restaurants" : appMode === "Pharmacy" ? "Pharmacies" : "Supermarkets"}
            </div>
          )}
          <button onClick={() => setShowSearch(p => !p)} style={{ background: "var(--zd-surface)", border: "1px solid var(--zd-border)", cursor: "pointer", width: 31, height: 31, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--zd-text-dim)", flexShrink: 0 }}>
            <Search size={14} />
          </button>
          {appMode === "Food" && (
            <button onClick={() => setReqRider(true)} style={{ background: "rgba(255,107,53,.12)", border: "1px solid rgba(255,107,53,.26)", borderRadius: 9, padding: "6px 10px", cursor: "pointer", color: "#FF6B35", fontSize: 10, fontWeight: 700, fontFamily: "inherit", flexShrink: 0, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}>
              <Target size={11} />Rider
            </button>
          )}
        </div>
        <div style={{ paddingTop: isMobile ? 52 : 10 }}>
          {/* Category pills */}
          <div style={{ padding: "6px 12px 2px" }}>
            <div className="zd-hide-scroll" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
              {currentCats.map(c => (
                <div key={c} onClick={() => setCat(c)} style={{ flexShrink: 0, padding: "6px 13px", borderRadius: 20, cursor: "pointer", fontSize: 11.5, fontWeight: cat === c ? 700 : 500, background: cat === c ? (appMode === "Pharmacy" ? "rgba(31,214,122,.2)" : appMode === "Supermarket" ? "rgba(245,166,35,.2)" : G) : "var(--zd-surface)", border: cat === c ? "none" : "1px solid var(--zd-border)", color: cat === c ? "#fff" : "var(--zd-text-dim)", transition: "all .16s ease" }}>{c}</div>
              ))}
            </div>
          </div>
          <div style={{ padding: "10px 12px 0" }}>
            {/* Featured row */}
            {!q && cat === "All" && featured.length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.su, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7, display: "flex", alignItems: "center", gap: 5 }}><Sparkles size={11} color={C.wa} />Featured</div>
                <div className="zd-hide-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 12 }}>
                  {featured.map(s => (
                    <div key={s.id} onClick={() => setSV(s)} style={{ flexShrink: 0, width: 104, background: "var(--zd-surface)", border: `1px solid ${modeColor}26`, borderRadius: 13, padding: "10px 9px", cursor: "pointer", transition: "transform .15s ease" }}
                      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: `${modeColor}16`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, marginBottom: 6 }}>{s.logo}</div>
                      <div style={{ fontWeight: 700, color: C.tx, fontSize: 10.5, lineHeight: 1.2, marginBottom: 3 }}>{s.name}</div>
                      <div style={{ fontSize: 9.5, color: modeColor, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}><Star size={9} fill={modeColor} color={modeColor} />{s.rating}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {/* Store list */}
            <div style={{ fontSize: 10, fontWeight: 700, color: C.su, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>
              {storesHook.loading ? "Loading…" : `${filtered.length} ${appMode === "Food" ? "restaurants" : appMode === "Pharmacy" ? "pharmacies" : "stores"}`}
            </div>
            {filtered.map(s => (
              <div key={s.id} style={{ ...gl(), borderRadius: 15, padding: "12px", display: "flex", gap: 11, alignItems: "flex-start", marginBottom: 7 }}>
                <div onClick={() => setSV(s)} style={{ width: 44, height: 44, borderRadius: 12, background: `${modeColor}14`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, cursor: "pointer" }}>{s.logo}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                    <span onClick={() => setSV(s)} style={{ fontWeight: 700, color: C.tx, fontSize: 13.5, cursor: "pointer" }}>{s.name}</span>
                    <Pill label={s.is_open ? "Open" : "Closed"} color={s.is_open ? C.ok : C.er} />
                    {s.is_featured && <Pill label="Top" color={modeColor} />}
                  </div>
                  {s.tagline && <div style={{ fontSize: 10.5, color: C.su, marginBottom: 5 }}>{s.tagline}</div>}
                  <div style={{ display: "flex", gap: 9, color: "var(--zd-text-faint)", fontSize: 10.5, marginBottom: 7 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Star size={9} fill={C.wa} color={C.wa} />{s.rating}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}><MapPin size={9} />{s.location}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn v="p" sm onClick={() => setSV(s)}>View Menu</Btn>
                    <Btn v="ghost" sm onClick={() => openChat(`conv_${s.id}`, s.name, s.logo, "store")}><MessageCircle size={11} />Chat</Btn>
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
          <div style={{ background: slide.bg, padding: "16px 16px 11px", minHeight: 122, position: "relative", overflow: "hidden", transition: "background .7s ease" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 0%, rgba(193,63,224,.18), transparent 60%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", right: 16, top: 12, fontSize: 44, opacity: 0.12, pointerEvents: "none" }}>{slide.icon}</div>
            <div style={{ position: "relative", zIndex: 1 }}>
              {zpPoints > 0 && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(245,166,35,.16)", border: "1px solid rgba(245,166,35,.26)", borderRadius: 20, padding: "3px 9px", marginBottom: 7 }}>
                  <Sparkles size={10} color="#F5A623" />
                  <span className="zd-tabular" style={{ color: "#F5A623", fontWeight: 700, fontSize: 10 }}>{zpPoints} ZP</span>
                </div>
              )}
              <div style={{ fontSize: 8.5, color: slide.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 3 }}>{slide.type === "hero" ? "ZaraDrop Abuja" : "Promotion"}</div>
              <div style={{ fontSize: isMobile ? 17 : 21, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 4, letterSpacing: -.3 }}>{slide.title}</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.55)", marginBottom: 9 }}>{slide.sub}</div>
              <button style={{ background: slide.accent, border: "none", borderRadius: 9, padding: "6px 13px", fontSize: 10.5, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 16px ${slide.accent}55` }}>{slide.cta}</button>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 4, padding: "7px 0", background: C.bg }}>
            {AD_HERO.map((_, i) => <div key={i} onClick={() => setAdSlide(i)} style={{ width: i === adSlide ? 16 : 4, height: 4, borderRadius: 2, background: i === adSlide ? slide.accent : "var(--zd-border-strong)", transition: "all .3s ease", cursor: "pointer" }} />)}
          </div>
        </div>

        <div style={{ padding: "9px 12px 0" }}>
          {/* Search */}
          <div style={{ position: "relative", marginBottom: 14 }}>
            <Search size={13} color="var(--zd-text-faint)" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search food, medicine, groceries…"
              style={{ width: "100%", background: "var(--zd-surface)", border: "1px solid var(--zd-border)", borderRadius: 12, padding: "10px 11px 10px 32px", fontSize: 12.5, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "var(--zd-text)" }} />
          </div>

          {/* Category cards */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.su, textTransform: "uppercase", letterSpacing: 1, marginBottom: 9 }}>What are you looking for?</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9 }}>
              {[
                { mode: "Food",        icon: "🍽️", label: "Food",        sub: "Restaurants",  bg: "linear-gradient(145deg,rgba(193,63,224,.18),rgba(139,48,201,.07))", border: "rgba(193,63,224,.24)", sh: "rgba(193,63,224,.22)" },
                { mode: "Pharmacy",    icon: "💊", label: "Pharmacy",    sub: "Pharmacies",   bg: "linear-gradient(145deg,rgba(31,214,122,.15),rgba(31,214,122,.05))",  border: "rgba(31,214,122,.22)",  sh: "rgba(31,214,122,.2)" },
                { mode: "Supermarket", icon: "🛒", label: "Supermarket", sub: "Supermarkets", bg: "linear-gradient(145deg,rgba(245,166,35,.15),rgba(245,166,35,.05))",  border: "rgba(245,166,35,.22)",  sh: "rgba(245,166,35,.2)" },
              ].map(card => (
                <div key={card.mode} onClick={() => { setMode(card.mode); setCat("All"); setQ(""); }}
                  style={{ borderRadius: 16, background: card.bg, border: `1px solid ${card.border}`, padding: "16px 10px", cursor: "pointer", textAlign: "center", transition: "all .2s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 10px 30px ${card.sh}`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ fontSize: 29, marginBottom: 7 }}>{card.icon}</div>
                  <div style={{ fontWeight: 800, color: C.tx, fontSize: 12, marginBottom: 2 }}>{card.label}</div>
                  <div style={{ fontSize: 9, color: C.su }}>{card.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured strip */}
          {!q && featured.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.su, textTransform: "uppercase", letterSpacing: 1, marginBottom: 9, display: "flex", alignItems: "center", gap: 5 }}><Sparkles size={12} color={C.wa} />Featured</div>
              <div className="zd-hide-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 14 }}>
                {featured.map(s => (
                  <div key={s.id} onClick={() => { setMode("Food"); setSV(s); }} style={{ flexShrink: 0, width: 112, background: "var(--zd-surface)", border: "1px solid rgba(193,63,224,.18)", borderRadius: 13, padding: "10px 9px", cursor: "pointer" }}>
                    <div style={{ fontSize: 30, marginBottom: 6 }}>{s.logo}</div>
                    <div style={{ fontWeight: 700, color: C.tx, fontSize: 10.5, lineHeight: 1.2, marginBottom: 3 }}>{s.name}</div>
                    <div style={{ fontSize: 9.5, color: C.wa, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}><Star size={9} fill={C.wa} color={C.wa} />{s.rating}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Request rider banner */}
          <div onClick={() => setReqRider(true)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 13px", borderRadius: 14, background: "rgba(255,107,53,.07)", border: "1px solid rgba(255,107,53,.2)", cursor: "pointer", transition: "transform .15s ease" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,107,53,.16)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF6B35", flexShrink: 0 }}><Target size={17} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: C.tx, fontSize: 12.5 }}>Request a Specific Rider</div>
              <div style={{ color: C.su, fontSize: 10.5, marginTop: 1 }}>Pick your rider — they quote their price</div>
            </div>
            <span style={{ fontSize: 9, color: "#FF6B35", fontWeight: 700, border: "1px solid rgba(255,107,53,.32)", borderRadius: 8, padding: "3px 7px" }}>New ⚡</span>
          </div>
          {showReqRider && <RequestRiderModal onClose={() => setReqRider(false)} />}
        </div>
      </div>
    );
  }

  // ── ORDERS TAB ──────────────────────────────────────────────
  if (tab === 2) {
    return (
      <div style={{ padding: P, paddingBottom: 16 }}>
        <SH title="My Orders" sub="Live delivery tracking" />
        {ordersHook.loading && <div style={{ textAlign: "center", padding: "40px", color: C.su }}>Loading orders…</div>}
        {!ordersHook.loading && ordersHook.orders.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 44, marginBottom: 12, opacity: .55 }}>📦</div>
            <div style={{ fontWeight: 700, color: C.tx, fontSize: 16, marginBottom: 6 }}>No orders yet</div>
            <div style={{ color: C.su, fontSize: 12 }}>Your orders will appear here once placed</div>
          </div>
        )}
        {ordersHook.orders.map(o => {
          const st = statusMeta(o.status);
          return (
            <div key={o.id} style={{ ...gl(), borderRadius: 15, padding: "12px", marginBottom: 9 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `${C.ac}14`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{o.stores?.logo ?? "🛍️"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: C.tx, fontSize: 13.5 }}>{o.stores?.name ?? "Store"}</div>
                  <div style={{ fontSize: 10.5, color: C.su, marginTop: 1 }}>{o.order_items?.map(i => `${i.name} ×${i.quantity}`).join(", ")}</div>
                </div>
                <Pill label={<span style={{ display: "flex", alignItems: "center", gap: 4 }}><st.Icon size={11} strokeWidth={2.4} />{st.label}</span>} color={st.color} />
              </div>
              {/* Delivery code */}
              {o.status === "delivering" && (
                <div style={{ background: "rgba(245,166,35,.1)", border: "1px solid rgba(245,166,35,.28)", borderRadius: 10, padding: "8px 11px", marginBottom: 9, display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(245,166,35,.18)", display: "flex", alignItems: "center", justifyContent: "center", color: C.wa, flexShrink: 0 }}><KeyRound size={15} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 8.5, color: C.wa, fontWeight: 700, letterSpacing: 1 }}>DELIVERY CODE</div>
                    <div className="zd-tabular" style={{ fontSize: 23, fontWeight: 900, color: C.wa, letterSpacing: 8, marginTop: 1 }}>{o.order_code}</div>
                  </div>
                  <div style={{ fontSize: 9, color: C.su, maxWidth: 80, lineHeight: 1.4, textAlign: "right" }}>Show to rider on arrival</div>
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <div className="zd-tabular" style={{ fontSize: 12.5, color: C.ac, fontWeight: 700 }}>₦{(o.total / 100).toLocaleString()}</div>
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