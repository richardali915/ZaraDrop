// src/styles/statusIcons.jsx
// ─────────────────────────────────────────────────────────────────────────
// One status → {icon, label, color} map shared by CustomerApp, RiderApp and
// StoreApp, so order status always looks identical everywhere — real
// lucide icons instead of emoji, consistent colors via design tokens.
// ─────────────────────────────────────────────────────────────────────────
import React from "react";
import {
  Clock3, CheckCircle2, ChefHat, PackageCheck, Bike,
  PartyPopper, XCircle,
} from "lucide-react";
import { C } from "./tokens";

export const ORDER_STATUS = {
  pending:    { Icon: Clock3,       label: "Pending",      color: C.wa },
  confirmed:  { Icon: CheckCircle2, label: "Confirmed",    color: C.ok },
  preparing:  { Icon: ChefHat,      label: "Preparing",    color: C.ac },
  ready:      { Icon: PackageCheck, label: "Ready",        color: C.ok },
  assigned:   { Icon: Bike,         label: "Rider Found",  color: C.ac },
  picked_up:  { Icon: CheckCircle2, label: "Picked Up",    color: C.ok },
  delivering: { Icon: Bike,         label: "On the Way",   color: C.ac },
  delivered:  { Icon: PartyPopper,  label: "Delivered",    color: C.ok },
  cancelled:  { Icon: XCircle,      label: "Cancelled",    color: C.er },
};

/** Tiny inline "icon + label" node, ready to drop into <Pill label={...} />. */
export function StatusLabel({ status, size = 11 }) {
  const m = ORDER_STATUS[status] || { Icon: PackageCheck, label: status, color: C.su };
  const { Icon, label } = m;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <Icon size={size} strokeWidth={2.4} />
      {label}
    </span>
  );
}

export function statusMeta(status) {
  return ORDER_STATUS[status] || { Icon: PackageCheck, label: status, color: C.su };
}