import React, { useState, useRef, useEffect } from "react";
import { X, ArrowLeft, Camera, Send, Bell, MessageCircle } from "lucide-react";
import { C, G, CSS } from "../../constants";
import { ts } from "../../utils";
import { AUTO } from "../../data";
import { Back } from "./Micro";

// ─── CHAT PANEL ───
export function ChatPanel({ chats, setChats, onClose, isMobile, jumpTo, setJumpTo }) {
  const [active, sA] = useState(jumpTo || null);
  const [inp, sI] = useState("");
  const [typing, sT] = useState(false);
  const endRef = useRef();
  const thread = active ? chats.find(c => c.id === active) : null;
  const unread = chats.reduce((a, c) => a + c.unread, 0);

  useEffect(() => {
    if (jumpTo && jumpTo !== active) {
      sA(jumpTo);
      setChats(p => p.map(c => c.id === jumpTo ? { ...c, unread: 0 } : c));
    }
  }, [jumpTo]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [thread?.msgs.length, typing]);

  const send = () => {
    if (!inp.trim() || !thread) return;
    const msg = { id: Date.now(), from: "me", text: inp.trim(), ts: ts(), st: "sent" };
    setChats(p => p.map(c => c.id === active ? { ...c, msgs: [...c.msgs, msg] } : c));
    sI(""); sT(true);
    setTimeout(() => {
      const ar = AUTO[thread.ctx] || AUTO.customer;
      setChats(p => p.map(c => c.id === active ? {
        ...c,
        msgs: [...c.msgs, { id: Date.now() + 1, from: "them", text: ar[Math.floor(Math.random() * ar.length)], ts: ts(), st: "read" }],
      } : c));
      sT(false);
    }, 900 + Math.random() * 700);
  };

  const PS = isMobile
    ? { position: "fixed", inset: 0, background: "#0D0D22", display: "flex", flexDirection: "column", zIndex: 900 }
    : { position: "fixed", top: 0, right: 0, width: 330, height: "100vh", background: "#0D0D22", borderLeft: "1px solid #1E1E3A", display: "flex", flexDirection: "column", zIndex: 800, boxShadow: "-20px 0 60px rgba(0,0,0,.85)" };

  return (
    <div style={PS}>
      <style>{CSS}</style>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 14px 12px", borderBottom: "1px solid rgba(255,255,255,.07)", flexShrink: 0 }}>
        {(thread || isMobile) && (
          <Back onClick={thread ? () => { sA(null); setJumpTo && setJumpTo(null); } : onClose} />
        )}
        <div style={{ flex: 1 }}>
          {thread ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${C.ac}14`, border: `1px solid ${C.ac}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{thread.emo}</div>
                {thread.online && <div style={{ position: "absolute", bottom: -1, right: -1, width: 9, height: 9, borderRadius: "50%", background: C.ok, border: "2px solid #0D0D22" }} />}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: C.tx, fontSize: 13 }}>{thread.with}</div>
                <div style={{ fontSize: 10, color: typing ? C.ac : thread.online ? C.ok : C.su }}>
                  {typing ? "Typing…" : thread.online ? "Online" : "Offline"}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontWeight: 800, color: C.tx, fontSize: 15 }}>
              💬 Messages
              {unread > 0 && (
                <span style={{ background: C.ac, color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 10, padding: "2px 7px", marginLeft: 6 }}>{unread}</span>
              )}
            </div>
          )}
        </div>
        {!isMobile && (
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", cursor: "pointer", width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: C.su }}>
            <X size={13} />
          </button>
        )}
      </div>

      {/* Thread list or messages */}
      {!thread ? (
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
          {chats.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 42, marginBottom: 10 }}>💬</div>
              <div style={{ fontSize: 14, color: C.tx, fontWeight: 700 }}>No conversations yet</div>
            </div>
          ) : chats.map(c => (
            <div key={c.id} onClick={() => { sA(c.id); setChats(p => p.map(x => x.id === c.id ? { ...x, unread: 0 } : x)); }}
              style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 9px", borderRadius: 13, cursor: "pointer", marginBottom: 3, transition: "background .13s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.05)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `${C.ac}12`, border: `1px solid ${C.ac}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>{c.emo}</div>
                {c.online && <div style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderRadius: "50%", background: C.ok, border: "2px solid #0D0D22" }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontWeight: 700, color: C.tx, fontSize: 13 }}>{c.with}</span>
                  <span style={{ fontSize: 9, color: C.su }}>{c.msgs.at(-1)?.ts}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: C.su, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
                    {c.msgs.at(-1)?.img ? "📷 Image" : c.msgs.at(-1)?.text}
                  </span>
                  {c.unread > 0 && (
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: C.ac, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>{c.unread}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 13px 6px" }}>
            {thread.msgs.map(m => {
              const mine = m.from === "me";
              return (
                <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", marginBottom: 9 }}>
                  <div style={{ maxWidth: "80%" }}>
                    <div style={{
                      background: mine ? G : "rgba(255,255,255,.07)",
                      border: mine ? "none" : "1px solid rgba(255,255,255,.1)",
                      color: "#fff", padding: "9px 13px",
                      borderRadius: mine ? "15px 15px 3px 15px" : "15px 15px 15px 3px",
                      fontSize: 13, lineHeight: 1.5,
                      boxShadow: mine ? "0 3px 16px rgba(193,68,212,.22)" : "none",
                    }}>
                      {m.img
                        ? <img src={m.img} style={{ display: "block", maxWidth: 200, maxHeight: 200, borderRadius: 10, objectFit: "cover" }} alt="" />
                        : m.text}
                    </div>
                    <div style={{ fontSize: 9, color: C.su, marginTop: 2, textAlign: mine ? "right" : "left" }}>
                      {m.ts}
                      {mine && <span style={{ color: m.st === "read" ? C.ac : "rgba(255,255,255,.2)", marginLeft: 3 }}>{m.st === "read" ? "✓✓" : "✓"}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
            {typing && (
              <div style={{ display: "flex", marginBottom: 9 }}>
                <div style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", padding: "9px 13px", borderRadius: "15px 15px 15px 3px", display: "flex", gap: 5, alignItems: "center" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: C.su, animation: `tdot 1.1s ${i * 0.18}s ease-in-out infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div style={{ padding: "10px 13px 15px", borderTop: "1px solid rgba(255,255,255,.07)", display: "flex", gap: 8, flexShrink: 0 }}>
            <input value={inp} onChange={e => sI(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Type a message…"
              style={{ flex: 1, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 11, padding: "10px 13px", color: "#EEF0FF", fontSize: 13, outline: "none", fontFamily: "inherit" }}
              onFocus={e => e.target.style.borderColor = C.ac + "60"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.14)"} />
            <label style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Camera size={14} color="rgba(255,255,255,.4)" />
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                const file = e.target.files?.[0];
                if (!file || !thread) return;
                const reader = new FileReader();
                reader.onload = ev => {
                  const imgMsg = { id: Date.now(), from: "me", text: "", img: ev.target.result, ts: ts(), st: "sent" };
                  setChats(p => p.map(c => c.id === active ? { ...c, msgs: [...c.msgs, imgMsg] } : c));
                  sT(true);
                  setTimeout(() => {
                    const ar = AUTO[thread.ctx] || AUTO.customer;
                    setChats(p => p.map(c => c.id === active ? { ...c, msgs: [...c.msgs, { id: Date.now() + 1, from: "them", text: ar[Math.floor(Math.random() * ar.length)], ts: ts(), st: "read" }] } : c));
                    sT(false);
                  }, 900);
                };
                reader.readAsDataURL(file);
                e.target.value = "";
              }} />
            </label>
            <button onClick={send} style={{ width: 36, height: 36, borderRadius: 9, background: inp.trim() ? G : "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .17s" }}>
              <Send size={14} color={inp.trim() ? "#fff" : C.su} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── NOTIF PANEL ───
export function NotifPanel({ notifs, setNotifs, onClose, isMobile }) {
  const unread = notifs.filter(n => !n.read).length;
  const PS = isMobile
    ? { position: "fixed", inset: 0, background: "#0D0D22", display: "flex", flexDirection: "column", zIndex: 900 }
    : { position: "fixed", top: 0, right: 0, width: 330, height: "100vh", background: "#0D0D22", borderLeft: "1px solid #1E1E3A", display: "flex", flexDirection: "column", zIndex: 800, boxShadow: "-20px 0 60px rgba(0,0,0,.85)" };

  return (
    <div style={PS}>
      <style>{CSS}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 14px 12px", borderBottom: "1px solid rgba(255,255,255,.07)", flexShrink: 0 }}>
        {isMobile && <Back onClick={onClose} />}
        <div style={{ flex: 1, fontWeight: 800, color: C.tx, fontSize: 15 }}>
          🔔 Notifications
          {unread > 0 && (
            <span style={{ background: C.ac, color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 10, padding: "2px 7px", marginLeft: 6 }}>{unread}</span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={() => setNotifs(p => p.map(n => ({ ...n, read: true })))}
            style={{ background: "none", border: "none", color: C.ac, fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
            Mark all read
          </button>
        )}
        {!isMobile && (
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", cursor: "pointer", width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: C.su, marginLeft: 4 }}>
            <X size={13} />
          </button>
        )}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
        {notifs.map(n => (
          <div key={n.id} onClick={() => setNotifs(p => p.map(x => x.id === n.id ? { ...x, read: true } : x))}
            style={{
              display: "flex", alignItems: "flex-start", gap: 11,
              padding: "11px 10px", borderRadius: 13, cursor: "pointer", marginBottom: 5,
              background: n.read ? "transparent" : `${C.ac}08`,
              border: `1px solid ${n.read ? "transparent" : `${C.ac}18`}`,
              transition: "background .14s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.05)"}
            onMouseLeave={e => e.currentTarget.style.background = n.read ? "transparent" : `${C.ac}08`}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{n.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: n.read ? 500 : 700, color: n.read ? "rgba(255,255,255,.55)" : C.tx, fontSize: 13 }}>{n.title}</div>
              <div style={{ fontSize: 11, color: C.su, marginTop: 2, lineHeight: 1.5 }}>{n.sub}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,.25)", marginTop: 4 }}>{n.time}</div>
            </div>
            {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.ac, flexShrink: 0, marginTop: 6, boxShadow: `0 0 8px ${C.ac}` }} />}
          </div>
        ))}
      </div>
    </div>
  );
}