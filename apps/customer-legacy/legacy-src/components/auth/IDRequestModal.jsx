import React, { useState } from "react";
import { C, GZ, CSS } from "../../constants";
import { gl, genRiderID, genStoreID } from "../../utils";
import { Back, FI, Btn } from "../shared/Micro";

export default function IDRequestModal({ type, onClose }) {
  const [step, sStep] = useState("form");
  const [name, sName] = useState("");
  const [phone, sPhone] = useState("");
  const [email, sEmail] = useState("");
  const [biz, sBiz] = useState("");
  const [area, sArea] = useState("Maitama");
  const [vehicle, sVehicle] = useState("Motorcycle");
  const [generatedID, sGenID] = useState("");

  const isRider = type === "rider";
  const canSubmit = name.trim() && phone.trim() && (isRider || biz.trim());

  const submit = () => {
    const newID = isRider ? genRiderID() : genStoreID();
    sGenID(newID);
    sStep("success");
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.62)",
      backdropFilter: "blur(18px)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 5000, padding: 18,
    }}>
      <style>{CSS}</style>
      <div style={{
        ...gl(), borderRadius: 28, padding: "24px 22px",
        width: "100%", maxWidth: 500, maxHeight: "88vh",
        overflowY: "auto", animation: "fadeIn .2s ease",
      }}>
        {step === "form" ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <Back onClick={onClose} />
              <div style={{
                width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                background: isRider ? "rgba(34,212,124,.15)" : "rgba(245,158,11,.15)",
                border: `1px solid ${isRider ? C.ok + "40" : C.wa + "40"}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
              }}>{isRider ? "🏍️" : "🏪"}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.tx }}>
                  {isRider ? "Rider Registration" : "Store Registration"}
                </div>
                <div style={{ fontSize: 11, color: C.su, marginTop: 1 }}>
                  Get your ZaraDrop {isRider ? "Rider ID" : "Store ID"}
                </div>
              </div>
            </div>
            <div style={{ ...gl(isRider ? "ok" : "wa"), borderRadius: 12, padding: "12px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: C.su, lineHeight: 1.7 }}>
                {isRider
                  ? "🏍️ After registration, your Rider ID will be issued within 24hrs following background verification."
                  : "🏪 After registration, your Store ID and initial passcode will be sent to your phone number within 24hrs."}
              </div>
            </div>
            <FI label="Full Name" val={name} set={sName} ph="Your legal full name" />
            <FI label="Phone Number" val={phone} set={sPhone} ph="+234 800 000 0000" type="tel" />
            <FI label="Email Address" val={email} set={sEmail} ph="you@example.com" type="email" />
            {isRider && <>
              <FI label="Vehicle Type" val={vehicle} set={sVehicle} opts={["Motorcycle", "Car", "Bicycle", "Keke"]} />
              <FI label="Service Area" val={area} set={sArea} opts={["Maitama", "Wuse II", "Garki", "Gwarimpa", "Jabi", "Asokoro", "Kubwa", "Area 1", "Kado", "Other"]} />
            </>}
            {!isRider && <>
              <FI label="Business / Restaurant Name" val={biz} set={sBiz} ph="e.g. Mama's Kitchen" />
              <FI label="Location / Area" val={area} set={sArea} opts={["Maitama", "Wuse II", "Garki", "Gwarimpa", "Jabi", "Asokoro", "Kubwa", "Area 1", "Kado", "Other"]} />
            </>}
            <Btn v={isRider ? "ok" : "warn"} full disabled={!canSubmit} onClick={submit}>
              Submit Registration →
            </Btn>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
            <div style={{ fontWeight: 900, fontSize: 20, color: C.tx, marginBottom: 6 }}>Registration Submitted!</div>
            <div style={{ ...gl(isRider ? "ok" : "wa"), borderRadius: 16, padding: "20px", marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: C.su, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>YOUR REFERENCE ID</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: isRider ? C.ok : C.wa, letterSpacing: 3, marginBottom: 4 }}>{generatedID}</div>
              <div style={{ fontSize: 11, color: C.su }}>Keep this ID safe — you'll need it for login once verified</div>
            </div>
            <div style={{ fontSize: 12, color: C.su, lineHeight: 1.8, marginBottom: 18 }}>
              ✅ Application received<br />
              📋 Verification in progress (24hrs)<br />
              📱 {isRider ? "Rider ID" : "Store ID & passcode"} will be sent to {phone || "your phone"}<br />
              ⚡ Once approved, you can log in immediately
            </div>
            <Btn v="p" full onClick={onClose}>Done — I'll wait for my ID</Btn>
          </div>
        )}
      </div>
    </div>
  );
}