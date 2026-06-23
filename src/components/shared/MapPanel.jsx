import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLoadScript, GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { MapPin, Compass, ArrowRight } from "lucide-react";
import { C, G } from "../../styles/tokens";
import { Back, Btn } from "./Micro";

const HUB_LOCATIONS = {
  "Wuse II": { lat: 9.079828, lng: 7.484216 },
  Maitama: { lat: 9.0637, lng: 7.4858 },
  Garki: { lat: 9.0704, lng: 7.4672 },
  Gwarimpa: { lat: 9.0534, lng: 7.3678 },
  Kubwa: { lat: 9.1444, lng: 7.3239 },
};

const toFixed = (value, digits = 1) => Number(value.toFixed(digits));

const computeDistanceKm = (a, b) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.asin(Math.sqrt(h));
};

export default function MapPanel({ region = "Wuse II", onClose, isMobile }) {
  const [currentPos, setCurrentPos] = useState(null);
  const [status, setStatus] = useState("locating");
  const [destination, setDestination] = useState(region);
  const [showHelp, setShowHelp] = useState(false);
  const mapRef = useRef();
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  });

  useEffect(() => {
    setDestination(region);
  }, [region]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("unsupported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCurrentPos({ lat: coords.latitude, lng: coords.longitude });
        setStatus("ready");
      },
      () => {
        setStatus("denied");
      },
      { timeout: 8000 }
    );
  }, []);

  const destinationPoint = HUB_LOCATIONS[destination] || HUB_LOCATIONS["Wuse II"];
  const routePoints = currentPos ? [currentPos, destinationPoint] : [destinationPoint];
  const distanceKm = currentPos ? computeDistanceKm(currentPos, destinationPoint) : null;
  const etaMin = distanceKm ? Math.max(8, Math.round(distanceKm / 0.55)) : null;
  const originLabel = currentPos ? "Your location" : "Current location unavailable";
  const routeLabel = `${originLabel} → ${destination}`;

  const mapCenter = currentPos || destinationPoint;
  const gmapsLink = currentPos
    ? `https://www.google.com/maps/dir/?api=1&origin=${currentPos.lat},${currentPos.lng}&destination=${destinationPoint.lat},${destinationPoint.lng}&travelmode=driving`
    : `https://www.google.com/maps/search/?api=1&query=${destinationPoint.lat},${destinationPoint.lng}`;

  const handleMapLoad = (map) => {
    mapRef.current = map;
    if (routePoints.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      routePoints.forEach((point) => bounds.extend(point));
      map.fitBounds(bounds, 64);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(4,3,9,.92)", zIndex: 1005, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${C.bd}`, background: "var(--zd-bg-elevated)", zIndex: 1006 }}>
        <Back onClick={onClose} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, color: C.tx, fontSize: 15 }}>Route Planner</div>
          <div style={{ fontSize: 11, color: C.su, marginTop: 2 }}>Navigate between you and local hubs in Abuja.</div>
        </div>
        <button onClick={() => setShowHelp(p => !p)}
          style={{ background: "none", border: "1px solid var(--zd-border)", borderRadius: 12, padding: "9px 12px", cursor: "pointer", color: C.su, fontFamily: "inherit", fontSize: 12 }}>
          {showHelp ? "Close" : "Tips"}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {showHelp && (
          <div style={{ padding: "14px 16px", background: "var(--zd-surface)", borderBottom: `1px solid ${C.bd}` }}>
            <div style={{ fontSize: 12, color: C.tx, fontWeight: 700, marginBottom: 8 }}>Route Planner Tips</div>
            <div style={{ fontSize: 11, color: C.su, lineHeight: 1.7 }}>
              • Allow location access for live routing.
              • Choose a nearby hub and see an instant route summary.
              • Tap "Open in Google Maps" to continue navigation in a full map app.
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 10, padding: "14px 16px", overflowX: "auto", borderBottom: `1px solid ${C.bd}` }}>
          {Object.keys(HUB_LOCATIONS).map((hub) => (
            <button key={hub} onClick={() => setDestination(hub)}
              style={{
                minWidth: 104,
                borderRadius: 14,
                padding: "10px 12px",
                background: destination === hub ? G : "var(--zd-surface)",
                color: destination === hub ? "#fff" : C.tx,
                border: `1px solid ${destination === hub ? "transparent" : "var(--zd-border)"}`,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}>
              <span style={{ display: "block", fontSize: 16, marginBottom: 3 }}>{hub === region ? "📍" : "⭐"}</span>
              {hub}
            </button>
          ))}
        </div>

        <div style={{ padding: "16px", display: "grid", gap: 12, background: "var(--zd-bg)", borderBottom: `1px solid ${C.bd}` }}>
          <div style={{ ...{
            background: "var(--zd-surface)",
            border: `1px solid ${C.bd}`,
            borderRadius: 18,
            padding: "14px",
          } }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: C.su, marginBottom: 4 }}>Route</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.tx }}>{routeLabel}</div>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: G, display: "grid", placeItems: "center", color: "#fff" }}><MapPin size={18} /></div>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 9, color: C.su, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 4 }}>Distance</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.tx }}>{distanceKm ? `${toFixed(distanceKm)} km` : "Waiting for location"}</div>
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 9, color: C.su, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 4 }}>Est. travel</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.tx }}>{etaMin ? `${etaMin} min` : "N/A"}</div>
              </div>
            </div>
          </div>

          {apiKey && !loadError && isLoaded ? (
            <div style={{ height: isMobile ? 320 : 380, borderRadius: 22, overflow: "hidden", border: `1px solid ${C.bd}` }}>
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={mapCenter}
                zoom={currentPos ? 13 : 11}
                onLoad={handleMapLoad}
                options={{ streetViewControl: false, fullscreenControl: false, mapTypeControl: false }}
              >
                <Marker position={destinationPoint} label={{ text: destination, color: "#fff", fontSize: "12px", fontWeight: "700" }} />
                {currentPos && <Marker position={currentPos} label={{ text: "You", color: "#FFFFFF", fontSize: "11px", fontWeight: "700" }} />}
                {currentPos && <Polyline path={routePoints} options={{ strokeColor: "#C13FE0", strokeOpacity: 0.9, strokeWeight: 5, icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 }, offset: "0", repeat: "12px" }] }} />}
              </GoogleMap>
            </div>
          ) : (
            <div style={{ borderRadius: 22, padding: "22px 18px", background: "var(--zd-surface)", border: `1px solid ${C.bd}`, minHeight: 180, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
              <div style={{ fontWeight: 700, color: C.tx, fontSize: 13 }}>In-app map unavailable</div>
              <div style={{ fontSize: 12, color: C.su, lineHeight: 1.6 }}>
                {apiKey ? "Loading failed. Use the button below to open Google Maps for turn-by-turn navigation." : "Set REACT_APP_GOOGLE_MAPS_API_KEY to enable the embedded route map in your browser."}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Btn v="g" onClick={() => window.open(gmapsLink, "_blank")}>Open in Google Maps</Btn>
                <Btn v="o" onClick={() => setShowHelp(p => !p)}>{showHelp ? "Hide tips" : "Route help"}</Btn>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${C.bd}`, padding: "14px 16px", background: "var(--zd-bg-elevated)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: C.su, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 4 }}>Need faster routing?</div>
            <div style={{ fontSize: 13, color: C.tx }}>Use the map button to preview nearby hubs and route quickly.</div>
          </div>
          <Btn v="p" onClick={() => window.open(gmapsLink, "_blank")}>Launch Directions <ArrowRight size={14} /></Btn>
        </div>
      </div>
    </div>
  );
}
