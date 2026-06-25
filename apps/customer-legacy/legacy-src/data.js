import {
  Home, ShoppingBag, Package, User, Bike, Navigation,
  CreditCard, BarChart2, TrendingUp,
} from "lucide-react";
import { C } from "./constants";

// ─── NAVIGATION CONFIG PER ROLE ───
export const RC = {
  customer: {
    icon: "🛍️", label: "Customer", color: C.ac,
    nav: [
      { I: Home, l: "Home" }, { I: ShoppingBag, l: "Stores" },
      { I: Package, l: "Orders" }, { I: CreditCard, l: "Wallet" },
      { I: User, l: "Profile" },
    ],
  },
  rider: {
    icon: "🏍️", label: "Rider", color: C.ok,
    nav: [
      { I: Bike, l: "Jobs" }, { I: Navigation, l: "Active" },
      { I: TrendingUp, l: "Earnings" }, { I: CreditCard, l: "Wallet" },
      { I: User, l: "Profile" },
    ],
  },
  store: {
    icon: "🏪", label: "Store", color: C.wa,
    nav: [
      { I: Home, l: "Dashboard" }, { I: Package, l: "Orders" },
      { I: BarChart2, l: "Analytics" }, { I: CreditCard, l: "Wallet" },
      { I: User, l: "Profile" },
    ],
  },
};

// ─── STORES ───
export const STORES = [
  { id: 1, name: "Big Bite Burgers", cat: "Fast Food", e: "🍔", r: 4.8, rv: 234, t: "15–25", open: true, feat: true, loc: "Maitama" },
  { id: 2, name: "Pizza Palace", cat: "Pizza", e: "🍕", r: 4.6, rv: 189, t: "20–30", open: true, feat: true, loc: "Wuse II" },
  { id: 3, name: "Dragon Wok", cat: "Chinese", e: "🥡", r: 4.5, rv: 156, t: "25–35", open: true, feat: false, loc: "Garki" },
  { id: 4, name: "Mama's Kitchen", cat: "Local", e: "🍲", r: 4.9, rv: 312, t: "10–20", open: true, feat: true, loc: "Gwarimpa" },
  { id: 5, name: "Sushi Express", cat: "Japanese", e: "🍣", r: 4.7, rv: 98, t: "20–30", open: false, feat: false, loc: "Jabi" },
  { id: 6, name: "Shawarma Hub", cat: "Fast Food", e: "🌯", r: 4.4, rv: 267, t: "10–15", open: true, feat: false, loc: "Area 1" },
  { id: 7, name: "Smoothie Bar", cat: "Drinks", e: "🥤", r: 4.6, rv: 143, t: "5–10", open: true, feat: false, loc: "Asokoro" },
  { id: 8, name: "Chicken X-Press", cat: "Fast Food", e: "🍗", r: 4.3, rv: 445, t: "15–25", open: true, feat: true, loc: "Kubwa" },
];

export const CATS = ["All", "Fast Food", "Pizza", "Local", "Chinese", "Japanese", "Drinks"];

// ─── MENUS ───
export const MENUS = {
  1: [
    { id: "a1", name: "Classic Beef Burger", price: 3500, e: "🍔", p: 1, avail: true, stock: 12 },
    { id: "a2", name: "Chicken Burger", price: 3200, e: "🍗", avail: true, stock: 8 },
    { id: "a3", name: "Loaded Fries", price: 1500, e: "🍟", p: 1, avail: true, stock: 20 },
    { id: "a4", name: "Combo Meal", price: 5500, e: "🎯", p: 1, avail: true, stock: 6 },
    { id: "a5", name: "Cola Drink", price: 800, e: "🥤", avail: true, stock: 30 },
    { id: "a6", name: "Milkshake", price: 2200, e: "🥛", avail: false, stock: 0 },
  ],
  2: [
    { id: "b1", name: "Pepperoni Pizza", price: 6500, e: "🍕", p: 1, avail: true, stock: 5 },
    { id: "b2", name: "BBQ Chicken Pizza", price: 7000, e: "🍕", p: 1, avail: true, stock: 4 },
    { id: "b3", name: "Margherita", price: 5500, e: "🍕", avail: true, stock: 6 },
    { id: "b4", name: "Garlic Bread", price: 1500, e: "🥖", avail: false, stock: 0 },
    { id: "b5", name: "Caesar Salad", price: 2500, e: "🥗", avail: true, stock: 10 },
  ],
  4: [
    { id: "d1", name: "Jollof Rice+Chicken", price: 3200, e: "🍲", p: 1, avail: true, stock: 15 },
    { id: "d2", name: "Egusi+Eba", price: 2800, e: "🍲", p: 1, avail: true, stock: 10 },
    { id: "d3", name: "Pounded Yam", price: 3000, e: "🫙", avail: true, stock: 8 },
    { id: "d4", name: "Suya Platter", price: 4500, e: "🍖", p: 1, avail: false, stock: 0 },
    { id: "d5", name: "Chapman", price: 1000, e: "🍹", avail: true, stock: 25 },
  ],
  7: [
    { id: "g1", name: "Mango Smoothie", price: 1800, e: "🥤", p: 1, avail: true, stock: 18 },
    { id: "g2", name: "Berry Blast", price: 2000, e: "🫐", p: 1, avail: true, stock: 12 },
    { id: "g3", name: "Boba Tea", price: 2500, e: "🧋", avail: true, stock: 9 },
    { id: "g4", name: "Green Detox", price: 2200, e: "🌿", avail: false, stock: 0 },
    { id: "g5", name: "Fresh OJ", price: 1500, e: "🍊", avail: true, stock: 20 },
  ],
  8: [
    { id: "h1", name: "Crispy Chicken 2pc", price: 2800, e: "🍗", p: 1, avail: true, stock: 14 },
    { id: "h2", name: "Bucket 6pc", price: 7500, e: "🍗", p: 1, avail: true, stock: 6 },
    { id: "h3", name: "Spicy Wings 8pc", price: 4200, e: "🔥", avail: true, stock: 9 },
    { id: "h4", name: "Chicken Wrap", price: 2500, e: "🌯", avail: false, stock: 0 },
    { id: "h5", name: "Coleslaw", price: 800, e: "🥗", avail: true, stock: 30 },
  ],
};

// Fill missing menus with defaults
for (const s of STORES) {
  if (!MENUS[s.id]) {
    MENUS[s.id] = [
      { id: `z${s.id}a`, name: "Today's Special", price: 3000, e: s.e, p: 1, avail: true, stock: 10 },
      { id: `z${s.id}b`, name: "Combo Meal", price: 5000, e: "🎯", avail: true, stock: 8 },
      { id: `z${s.id}c`, name: "Soft Drink", price: 800, e: "🥤", avail: true, stock: 25 },
    ];
  }
}

export const ALLITEMS = Object.values(MENUS).flat();

// ─── PHARMACIES ───
export const PHARMACIES = [
  { id: "p1", name: "HealthPlus Pharmacy", cat: "Pharmacy", e: "💊", r: 4.7, rv: 89, t: "10–20", open: true, feat: true, loc: "Maitama", sub: "Prescriptions · OTC · Wellness" },
  { id: "p2", name: "Medplus Pharmacy", cat: "Pharmacy", e: "🏥", r: 4.8, rv: 124, t: "15–25", open: true, feat: true, loc: "Wuse II", sub: "24-hour · Prescriptions · Lab" },
  { id: "p3", name: "Alpha Pharmacy", cat: "Pharmacy", e: "💉", r: 4.5, rv: 56, t: "20–30", open: true, feat: false, loc: "Garki", sub: "Generic drugs · Vitamins" },
  { id: "p4", name: "Roxy Pharmacy", cat: "Pharmacy", e: "🩺", r: 4.6, rv: 78, t: "10–15", open: true, feat: false, loc: "Gwarimpa", sub: "OTC · Baby care · Supplements" },
  { id: "p5", name: "Nisa Pharmacy", cat: "Pharmacy", e: "💊", r: 4.9, rv: 211, t: "5–15", open: true, feat: true, loc: "Asokoro", sub: "Hospital-grade · 24hr · Prescriptions" },
];

export const PHARM_CATS = ["All", "Prescription", "OTC", "Vitamins", "Baby Care", "Personal Care", "Equipment"];

// ─── SUPERMARKETS ───
export const SUPERMARKETS = [
  { id: "s1", name: "Jabi Lake Mall Store", cat: "Grocery", e: "🛒", r: 4.6, rv: 143, t: "20–35", open: true, feat: true, loc: "Jabi", sub: "Full grocery · Fresh produce · Electronics" },
  { id: "s2", name: "Sahad Stores", cat: "Grocery", e: "🏬", r: 4.7, rv: 201, t: "15–30", open: true, feat: true, loc: "Area 1", sub: "Affordable grocery · Household" },
  { id: "s3", name: "FoodCo Supermarket", cat: "Grocery", e: "🥦", r: 4.5, rv: 98, t: "25–40", open: true, feat: false, loc: "Gwarimpa", sub: "Fresh · Organic · Imported goods" },
  { id: "s4", name: "Shoprite Abuja", cat: "Grocery", e: "🛍️", r: 4.8, rv: 332, t: "20–35", open: true, feat: true, loc: "Kubwa", sub: "Full range · Fresh · Bakery · Deli" },
  { id: "s5", name: "Prince Ebeano", cat: "Grocery", e: "🥩", r: 4.6, rv: 167, t: "15–25", open: true, feat: false, loc: "Asokoro", sub: "Butchery · Seafood · Produce" },
];

export const SUPER_CATS = ["All", "Grocery", "Fresh Produce", "Frozen", "Household", "Bakery", "Beverages"];

// ─── AD SLIDES ───
export const AD_SLIDES = [
  { id: "ad0", type: "hero", bg: "linear-gradient(135deg,#1A0A2E,#0C0C1E)", accent: C.ac, title: "ZaraDrop Abuja", sub: "Order food · Medicine · Groceries", cta: "Explore Now", icon: "⚡" },
  { id: "ad1", type: "store", bg: "linear-gradient(135deg,#1A1200,#0C0C1E)", accent: C.wa, title: "Big Bite Burgers", sub: "15% off all combo meals today only", cta: "Order Now", icon: "🍔" },
  { id: "ad2", type: "promo", bg: "linear-gradient(135deg,#001A0A,#0C0C1E)", accent: C.ok, title: "Free Delivery", sub: "On your first pharmacy order this week", cta: "Shop Meds", icon: "💊" },
  { id: "ad3", type: "store", bg: "linear-gradient(135deg,#1A0A00,#0C0C1E)", accent: "#FF6B35", title: "Mama's Kitchen", sub: "Authentic Nigerian food — from ₦2,800", cta: "View Menu", icon: "🍲" },
  { id: "ad4", type: "promo", bg: "linear-gradient(135deg,#0A001A,#0C0C1E)", accent: C.ac, title: "ZP Points", sub: "Earn 2% back on every order", cta: "Learn More", icon: "⭐" },
];

// ─── AUTO-REPLY MESSAGES ───
export const AUTO = {
  store: ["On it! 🍽️", "Preparing now!", "Ready in 5 mins!", "Rider coming ✅"],
  rider: ["On my way! 🏍️", "Almost there!", "At pickup ✅", "Arriving now!"],
  customer: ["Got it!", "Thanks 👍", "Please hurry!", "Waiting outside 😊"],
};

// ─── KNOWN RIDERS ───
export const KNOWN_RIDERS = [
  { id: "RD-00001", name: "Kola Adesola", rating: 4.9, trips: 289, area: "Maitama / Wuse", vehicle: "Motorcycle", online: true, avatar: "🏍️" },
  { id: "RD-00042", name: "Emeka Tunde", rating: 4.8, trips: 154, area: "Garki / Asokoro", vehicle: "Motorcycle", online: true, avatar: "🏍️" },
  { id: "RD-00078", name: "Funmi Adeyemi", rating: 4.7, trips: 97, area: "Gwarimpa / Kubwa", vehicle: "Car", online: false, avatar: "🚗" },
  { id: "RD-00099", name: "Chukwu Bello", rating: 4.9, trips: 431, area: "All Areas", vehicle: "Motorcycle", online: true, avatar: "🏍️" },
];

// ─── MILESTONE BONUSES ───
export const MILESTONES = [
  { orders: 12, bonus: 3000, label: "12 orders" },
  { orders: 15, bonus: 4000, label: "15 orders" },
  { orders: 18, bonus: 5000, label: "18 orders" },
  { orders: 20, bonus: 6000, label: "20 orders" },
];

export const getBankedBonus = (deliveries) => {
  let banked = null;
  for (const m of MILESTONES) { if (deliveries >= m.orders) banked = m; }
  return banked;
};

export const getNextMilestone = (deliveries) => {
  for (const m of MILESTONES) { if (deliveries < m.orders) return m; }
  return null;
};

// ─── DEFAULT ATTENDANTS ───
export const DEF_ATTENDANTS = [
  { id: "att1", name: "Chidinma A.", role: "Admin", pin: "1234", color: C.ac, active: true },
  { id: "att2", name: "Tunde B.", role: "Attendant", pin: "5678", color: C.ok, active: true },
  { id: "att3", name: "Fatima O.", role: "Attendant", pin: "9012", color: C.wa, active: true },
];

// ─── DEFAULT STATE ───
export const DEF_WAL = {
  balance: 45000,
  pin: "1234",
  btc: 0.0023, eth: 0.045, usdt: 120,
  cards: [
    { id: "c1", last4: "4521", brand: "Visa", exp: "09/27", bg: "linear-gradient(135deg,#6C3CDE,#C144D4)" },
    { id: "c2", last4: "8834", brand: "MC", exp: "03/26", bg: "linear-gradient(135deg,#1A6B5C,#22D47C)" },
  ],
  txns: [
    { id: "t1", type: "cr", desc: "Wallet Top-up", amount: 10000, date: "Today 11:20 AM", icon: "⬆️", method: "Visa •4521" },
    { id: "t2", type: "db", desc: "Food Order – Big Bite", amount: 6700, date: "Today 1:30 PM", icon: "🍔", method: "Wallet" },
    { id: "t3", type: "cr", desc: "Delivery Earning", amount: 850, date: "Today 2:14 PM", icon: "🏍️", method: "Auto" },
    { id: "t4", type: "db", desc: "Food Order – Smoothie Bar", amount: 4400, date: "Yesterday 8:45 PM", icon: "🥤", method: "Wallet" },
    { id: "t5", type: "cr", desc: "Delivery Earning", amount: 1100, date: "Yesterday 3:20 PM", icon: "🏍️", method: "Auto" },
  ],
};

export const DEF_PROF = {
  customer: { setup: false, name: "", phone: "", email: "", address: "", landmark: "", notes: "", points: 0, pointsNaira: 0 },
  rider: { setup: false, name: "", phone: "", email: "", vehicle: "Motorcycle", plate: "", bankName: "GTBank", accountNo: "", area: "Maitama", bio: "" },
  store: { setup: false, name: "", phone: "", email: "", businessName: "", category: "Fast Food", storeAddress: "", hours: "9am–10pm", description: "", logo: "🏪", tagline: "" },
};

export const DEF_SET = {
  pushNotifs: true, orderUpdates: true, promoAlerts: false,
  sound: true, biometrics: false, location: true, dataSharing: false,
};

// ─── CHART DATA ───
export const ECHD = {
  "7d": [{ l: "Mon", v: 3200 }, { l: "Tue", v: 4100 }, { l: "Wed", v: 2800 }, { l: "Thu", v: 5200 }, { l: "Fri", v: 6100 }, { l: "Sat", v: 7400 }, { l: "Sun", v: 3900 }],
  "1m": [{ l: "W1", v: 18000 }, { l: "W2", v: 22000 }, { l: "W3", v: 19000 }, { l: "W4", v: 24360 }],
  "3m": [{ l: "Jan", v: 72000 }, { l: "Feb", v: 68000 }, { l: "Mar", v: 83400 }],
  "6m": [{ l: "Oct", v: 65000 }, { l: "Nov", v: 70000 }, { l: "Dec", v: 85000 }, { l: "Jan", v: 72000 }, { l: "Feb", v: 68000 }, { l: "Mar", v: 83400 }],
  "1y": [{ l: "Apr", v: 55000 }, { l: "May", v: 61000 }, { l: "Jun", v: 58000 }, { l: "Jul", v: 67000 }, { l: "Aug", v: 72000 }, { l: "Sep", v: 69000 }, { l: "Oct", v: 65000 }, { l: "Nov", v: 70000 }, { l: "Dec", v: 85000 }, { l: "Jan", v: 72000 }, { l: "Feb", v: 68000 }, { l: "Mar", v: 83400 }],
};

export const SCHD = {
  "7d": [{ l: "Mon", v: 42000 }, { l: "Tue", v: 55000 }, { l: "Wed", v: 38000 }, { l: "Thu", v: 67000 }, { l: "Fri", v: 88000 }, { l: "Sat", v: 72000 }, { l: "Sun", v: 31000 }],
  "1m": [{ l: "W1", v: 210000 }, { l: "W2", v: 240000 }, { l: "W3", v: 195000 }, { l: "W4", v: 284600 }],
  "3m": [{ l: "Jan", v: 720000 }, { l: "Feb", v: 680000 }, { l: "Mar", v: 834000 }],
  "6m": [{ l: "Oct", v: 650000 }, { l: "Nov", v: 700000 }, { l: "Dec", v: 850000 }, { l: "Jan", v: 720000 }, { l: "Feb", v: 680000 }, { l: "Mar", v: 834000 }],
  "1y": [{ l: "Apr", v: 550000 }, { l: "May", v: 610000 }, { l: "Jun", v: 580000 }, { l: "Jul", v: 670000 }, { l: "Aug", v: 720000 }, { l: "Sep", v: 690000 }, { l: "Oct", v: 650000 }, { l: "Nov", v: 700000 }, { l: "Dec", v: 850000 }, { l: "Jan", v: 720000 }, { l: "Feb", v: 680000 }, { l: "Mar", v: 834000 }],
};

// ─── INIT STATE ───
export const INIT_JOBS = [
  { id: "j1", store: "Big Bite Burgers", e: "🍔", sLoc: "Aminu Kano Cres, Maitama", dLoc: "Yakubu Gowon Way, Asokoro", dist: "3.2km", earn: 850, fee: 1200, items: 2, cust: "Adaeze O.", cid: "cx1", orderCode: "7421" },
  { id: "j2", store: "Mama's Kitchen", e: "🍲", sLoc: "Block C, Gwarimpa Estate", dLoc: "Cadastral Zone, Gwarimpa", dist: "1.8km", earn: 680, fee: 972, items: 3, cust: "Emeka C.", cid: "cx2", orderCode: "3856" },
  { id: "j3", store: "Dragon Wok", e: "🥡", sLoc: "Moshood Abiola Way, Garki", dLoc: "Herbert Macaulay Way, Garki", dist: "2.5km", earn: 1100, fee: 1571, items: 4, cust: "Funmi A.", cid: "cx3", orderCode: "9103" },
];

export const INIT_CUSTOM_REQS = [
  { id: "cr_req1", cust: "Ngozi F.", cid: "cx_ngozi", from: "Wuse II, Fela Anikulapo-Kuti Cres", to: "Asokoro, Lobito Cres", dist: "5.1km", item: "Personal documents + small package", note: "Please handle carefully", status: "pending_quote" },
];

export const INIT_SORD = [
  { id: "so1", cust: "Adaeze O.", cid: "cx1", attendant: "Chidinma A.", items: ["Classic Beef Burger", "Loaded Fries"], status: "pending", ago: "2 min", total: 5000, svc: 100 },
  { id: "so2", cust: "Tunde B.", cid: "cx2", attendant: "Tunde B.", items: ["Chicken Burger x2"], status: "ready", ago: "8 min", total: 8000, svc: 160 },
  { id: "so3", cust: "Ngozi F.", cid: "cx3", attendant: "Fatima O.", items: ["Pepperoni Pizza"], status: "picked_up", ago: "15 min", total: 6500, svc: 130 },
  { id: "so4", cust: "Chisom E.", cid: "cx4", attendant: "Chidinma A.", items: ["Combo Meal x2"], status: "pending", ago: "1 min", total: 11000, svc: 220 },
];

export const INIT_CORD = [
  { id: "co1", store: "Big Bite Burgers", sid: "s1", rid: "cr1", rider: "Kola A.", e: "🍔", status: "delivering", eta: "8 min", items: ["Combo Meal x1"], total: 6700, payment: "wallet", attendant: "Tunde B.", orderCode: "7421" },
  { id: "co2", store: "Smoothie Bar", sid: "s7", rid: "cr2", rider: "Emeka T.", e: "🥤", status: "delivered", eta: null, items: ["Mango Smoothie x2"], total: 4400, payment: "cash", attendant: "Fatima O.", orderCode: "3856" },
];

export const INIT_CHATS = [
  { id: "s1", with: "Big Bite Burgers", emo: "🍔", ctx: "store", online: true, unread: 1, msgs: [{ id: 1, from: "them", text: "Your order is being prepared 🍔", ts: "2:14 PM", st: "unread" }] },
  { id: "cr1", with: "Rider Kola A.", emo: "🏍️", ctx: "rider", online: true, unread: 0, msgs: [{ id: 1, from: "them", text: "Picked up your order! On the way 🏍️", ts: "2:28 PM", st: "read" }] },
];

export const INIT_NOTIFS = [
  { id: 1, icon: "🍔", title: "Order Ready!", sub: "Big Bite Burgers order ready for pickup", time: "2 min ago", read: false },
  { id: 2, icon: "🏍️", title: "Rider Assigned", sub: "Kola A. is on the way with your order", time: "5 min ago", read: false },
  { id: 3, icon: "✅", title: "Delivered!", sub: "Smoothie Bar order delivered successfully", time: "1 hr ago", read: true },
  { id: 4, icon: "⭐", title: "Points Earned!", sub: "You earned 134 ZP on your last order", time: "1 hr ago", read: true },
  { id: 5, icon: "💰", title: "Earning Credited", sub: "₦850 added to your wallet", time: "3 hrs ago", read: true },
];