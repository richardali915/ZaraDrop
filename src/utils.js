import { C } from "./constants";

export const fmt = (n) => `₦${Number(n).toLocaleString()}`;

export const ts = () =>
  new Date().toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const gl = (t) => {
  const m = {
    ac: C.ac.replace("#", "").match(/.{1,2}/g).map((x) => parseInt(x, 16)).join(","),
    ok: C.ok.replace("#", "").match(/.{1,2}/g).map((x) => parseInt(x, 16)).join(","),
    wa: C.wa.replace("#", "").match(/.{1,2}/g).map((x) => parseInt(x, 16)).join(","),
    er: C.er.replace("#", "").match(/.{1,2}/g).map((x) => parseInt(x, 16)).join(","),
  };

  const r = t && m[t];

  return {
    background: r ? `rgba(${r}, .07)` : `rgba(255,255,255, .04)`,
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: r
      ? `1px solid rgba(${r}, .22)`
      : `1px solid rgba(255,255,255, .08)`,
    boxShadow:
      "0 8px 28px rgba(0,0,0, .4), inset 0 1px 0 rgba(255,255,255, .05)",
  };
};

let _riderSeq = 2;
let _storeSeq = 2;

export const genRiderID = () =>
  `RD-${String(_riderSeq++).padStart(5, "0")}`;

export const genStoreID = () =>
  `ST-${String(_storeSeq++).padStart(4, "0")}`;