import React, { useState } from "react";
import { Edit3, Settings, ChevronRight, Users, Plus, Package, CreditCard, Star, Activity, TrendingUp } from "lucide-react";
import { C, G } from "../constants";
import { gl } from "../utils";
import { RC } from "../data";
import { Pill, Tog, SH, SC, Back, FI, Btn } from "./Micro";
import { useAuth } from "../hooks/useAuth";

// ─── PROFILE SETUP ───────────────────────────────────────────
export function ProfileSetup({ role, userId }) {
  const { createProfile } = useAuth();
  const rc = RC[role];
  const [name,   setName]   = useState("");
  const [phone,  setPhone]  = useState("");
  const [email,  setEmail]  = useState("");
  // Customer extras
  const [address,  setAddress]  = useState("");
  const [landmark, setLandmark] = useState("");
  const [notes,    setNotes]    = useState("");
  // Rider extras
  const [vehicle,   setVehicle]   = useState("Motorcycle");
  const [plate,     setPlate]     = useState("");
  const [area,      setArea]      = useState("Maitama");
  const [bankName,  setBankName]  = useState("GTBank");
  const [accountNo, setAccountNo] = useState("");
  // Store extras
  const [bizName,   setBizName]   = useState("");
  const [category,  setCategory]  = useState("Fast Food");
  const [storeAddr, setStoreAddr] = useState("");
  const [hours,     setHours]     = useState("9am–10pm");
  const [desc,      setDesc]      = useState("");

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const ok = name.trim() && phone.trim()
    && (role !== "store" || bizName.trim())
    && (role !== "rider" || plate.trim());

  const save = async () => {
    setLoading(true); setError("");
    try {
      await createProfile({
        role, name, phone, email,
        extra: role === "customer"
          ? { address, landmark, notes }
          : role === "rider"
          ? { vehicle, plate, area, bankName, accountNo }
          : { bizName, category, storeAddr, hours, desc },
      });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ paddingBottom: 16 }}>
      <div style={{ background: `linear-gradient(135deg,${rc.color}18,${rc.color}07)`, border: `1px solid ${rc.color}28`, borderRadius: 18, padding: "16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 13 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: `${rc.color}20`, border: `2px solid ${rc.color}32`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{rc.icon}</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: C.tx }}>Set Up {rc.label} Profile</div>
          <div style={{ color: C.su, fontSize: 12, marginTop: 2 }}>Complete to unlock all features ⚡</div>
        </div>
      </div>
      <div style={{ ...gl(), borderRadius: 18, padding: "16px" }}>
        <FI label="Full Name" val={name} set={setName} ph="Your full legal name" />
        <FI label="Phone Number" val={phone} set={setPhone} ph="+234 800 000 0000" type="tel" />
        <FI label="Email Address" val={email} set={setEmail} ph="you@example.com" type="email" />

        {role === "customer" && <>
          <FI label="Default Address" val={address} set={setAddress} ph="Home or office address" />
          <FI label="Landmark" val={landmark} set={setLandmark} ph="e.g. Beside GTBank, Maitama" />
          <FI label="Delivery Notes" val={notes} set={setNotes} ph="e.g. Call on arrival" />
        </>}

        {role === "rider" && <>
          <FI label="Vehicle Type" val={vehicle} set={setVehicle} opts={["Motorcycle","Car","Bicycle","Keke"]} />
          <FI label="Plate Number" val={plate} set={setPlate} ph="e.g. ABC-123XY" />
          <FI label="Service Area" val={area} set={setArea} opts={["Maitama","Wuse II","Garki","Gwarimpa","Jabi","Asokoro","Kubwa","Area 1","Kado","Other"]} />
          <FI label="Bank" val={bankName} set={setBankName} opts={["GTBank","Access Bank","First Bank","Zenith Bank","UBA","Opay","Kuda","Palmpay","Moniepoint"]} />
          <FI label="Account Number" val={accountNo} set={setAccountNo} ph="10-digit account number" type="tel" />
        </>}

        {role === "store" && <>
          <FI label="Business Name" val={bizName} set={setBizName} ph="Your restaurant name" />
          <FI label="Category" val={category} set={setCategory} opts={["Fast Food","Pizza","Local Nigerian","Chinese","Japanese","Drinks","Shawarma","Bakery","Seafood","Other"]} />
          <FI label="Store Address" val={storeAddr} set={setStoreAddr} ph="Full address of your store" />
          <FI label="Operating Hours" val={hours} set={setHours} opts={["24 Hours","7am–10pm","8am–10pm","9am–10pm","9am–11pm","10am–11pm"]} />
          <FI label="Description" val={desc} set={setDesc} ph="What makes your food special?" />
        </>}

        {error && <div style={{ color: C.er, fontSize: 12, marginBottom: 8 }}>{error}</div>}
        <Btn v="p" full disabled={!ok || loading} sx={{ marginTop: 10 }} onClick={save}>
          {loading ? "Saving…" : "⚡ Save Profile & Get Started"}
        </Btn>
      </div>
    </div>
  );
}

// ─── PROFILE CARD ─────────────────────────────────────────────
export function ProfileCard({ role, profile, wallet, storeHook, isStoreAdmin, riderProfile }) {
  const [sec, setSec] = useState("main");
  const { updateProfile, signOut } = useAuth();
  const rc  = RC[role];
  const dn  = role === "store" ? (storeHook?.store?.name ?? profile?.name) : profile?.name;

  // Settings state
  const [pushNotifs, setPush]   = useState(true);
  const [sound,      setSound]  = useState(true);
  const [location,   setLoc]    = useState(true);

  if (sec === "settings") return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <Back onClick={() => setSec("main")} />
        <div style={{ fontWeight: 800, fontSize: 15, color: C.tx }}>Settings &amp; Preferences</div>
      </div>
      {[{ t: "Notifications", items: [["🔔","Push Notifications",pushNotifs,setPush],["🔊","Sound Alerts",sound,setSound]] }, { t: "Privacy", items: [["📍","Location Access",location,setLoc]] }].map(section => (
        <div key={section.t} style={{ ...gl(), borderRadius: 15, padding: "13px", marginBottom: 11 }}>
          <div style={{ fontSize: 9, color: C.ac, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>{section.t}</div>
          {section.items.map(([i, l, val, setVal]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
              <span style={{ fontSize: 17 }}>{i}</span>
              <div style={{ flex: 1, fontSize: 13, color: C.tx, fontWeight: 600 }}>{l}</div>
              <Tog on={val} tg={() => setVal(p => !p)} />
            </div>
          ))}
        </div>
      ))}
      <div style={{ ...gl(), borderRadius: 15, padding: "13px" }}>
        <div style={{ fontSize: 9, color: C.ac, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Account</div>
        {[["💬","Help & Support"],["ℹ️","About ZaraDrop v2.0"],["⭐","Rate the App"]].map(([i, l]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.06)", cursor: "pointer" }}>
            <span style={{ fontSize: 17 }}>{i}</span>
            <div style={{ flex: 1, fontSize: 13, color: C.tx, fontWeight: 600 }}>{l}</div>
            <ChevronRight size={13} color={C.su} />
          </div>
        ))}
        <div onClick={signOut} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 0", cursor: "pointer" }}>
          <span style={{ fontSize: 17 }}>🚪</span>
          <div style={{ flex: 1, fontSize: 13, color: C.er, fontWeight: 700 }}>Sign Out</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ paddingBottom: 16 }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${rc.color}15,${rc.color}06)`, border: `1px solid ${rc.color}22`, borderRadius: 16, padding: "14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: `${rc.color}18`, border: `2px solid ${rc.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
          {role === "store" ? (storeHook?.store?.logo ?? "🏪") : rc.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 19, color: C.tx, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dn || "Your Name"}</div>
          <div style={{ color: C.su, fontSize: 12, marginTop: 2 }}>
            {role === "rider" ? `${riderProfile?.vehicle ?? ""} · ${riderProfile?.area ?? ""}` : role === "store" ? (storeHook?.store?.tagline ?? storeHook?.store?.category ?? "") : profile?.customer_profiles?.[0]?.address ?? "Abuja, Nigeria"}
          </div>
          <div style={{ marginTop: 7, display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Pill label={rc.label} color={rc.color} />
            {role === "rider" && <Pill label={`⭐ ${riderProfile?.rating ?? 5.0}`} color={C.wa} />}
            {role === "store" && <Pill label={`⭐ ${storeHook?.store?.rating ?? 5.0}`} color={C.wa} />}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 9, marginBottom: 10, flexWrap: "wrap" }}>
        {role === "customer" && <><SC icon={<Package size={13} />} label="ZP Points" value={profile?.customer_profiles?.[0]?.zp_points ?? 0} color={C.wa} /><SC icon={<CreditCard size={13} />} label="Wallet" value={`₦${(wallet?.balance ?? 0).toLocaleString()}`} color={C.ok} /></>}
        {role === "rider"    && <><SC icon={<Activity size={13} />} label="Total Trips" value={riderProfile?.total_trips ?? 0} color={C.ok} /><SC icon={<Star size={13} />} label="Rating" value={`${riderProfile?.rating ?? 5.0} ⭐`} color={C.wa} /></>}
        {role === "store"    && <><SC icon={<Package size={13} />} label="Menu Items" value={storeHook?.menu?.length ?? 0} color={C.wa} /><SC icon={<Star size={13} />} label="Rating" value={`${storeHook?.store?.rating ?? 5.0} ⭐`} color={C.ac} /></>}
      </div>

      {/* Profile details */}
      <div style={{ ...gl(), borderRadius: 15, padding: "13px", marginBottom: 11 }}>
        <div style={{ fontSize: 9, color: C.ac, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Profile Details</div>
        {[["👤","Name",profile?.name],["📞","Phone",profile?.phone],["📧","Email",profile?.email],role==="rider"&&["🏍️","Vehicle",`${riderProfile?.vehicle ?? ""} · ${riderProfile?.plate ?? ""}`],role==="rider"&&["📍","Area",riderProfile?.area],role==="store"&&["🏪","Business",storeHook?.store?.name],role==="store"&&["📂","Category",storeHook?.store?.category],role==="store"&&["🕐","Hours",storeHook?.store?.hours]].filter(Boolean).filter(x => x[2]).map(([i, l, v]) => (
          <div key={l} style={{ display: "flex", gap: 11, padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
            <span style={{ fontSize: 15, flexShrink: 0 }}>{i}</span>
            <div>
              <div style={{ fontSize: 9, color: C.su, marginBottom: 2, fontWeight: 600 }}>{l}</div>
              <div style={{ color: C.tx, fontWeight: 600, fontSize: 12 }}>{v}</div>
            </div>
          </div>
        ))}
      </div>

      <div onClick={() => setSec("settings")} style={{ ...gl(), borderRadius: 14, padding: "14px 15px", cursor: "pointer", display: "flex", alignItems: "center", gap: 11, transition: "background .14s" }}>
        <Settings size={16} color={C.ac} />
        <div style={{ flex: 1, fontSize: 13, color: C.tx, fontWeight: 600 }}>Settings &amp; Preferences</div>
        <ChevronRight size={14} color={C.su} />
      </div>
    </div>
  );
}