import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Bell, CheckCircle, X, Send, Camera, ArrowLeft, Moon, Sun, MapPin } from "lucide-react";
import { C, G, GZ, CSS } from "../../constants";
import { RC } from "../../data";
import { ts } from "../../utils";
import { useTheme } from "../../styles/ThemeContext";
import { HubPanel } from "../shared/HubPanel";

// ─── CHAT PANEL ───────────────────────────────────────────────
export function ChatPanel({ chat, userId, onClose, isMobile, jumpTo, setJumpTo }) {
  const [activeConv, setActiveConv] = useState(jumpTo || null);
  const [messages,   setMessages]   = useState([]);
  const [inp,        setInp]        = useState("");
  const [typing,     setTyping]     = useState(false);
  const endRef = useRef();

  const thread = activeConv ? chat.conversations.find(c => c.id === activeConv) : null;

  useEffect(() => {
    if (jumpTo && jumpTo !== activeConv) {
      setActiveConv(jumpTo);
      chat.markRead(jumpTo);
    }
  }, [jumpTo]);

  useEffect(() => {
    if (!activeConv) return;
    chat.fetchMessages(activeConv).then(setMessages);
    const unsub = chat.subscribeToMessages(activeConv, (msg) => {
      setMessages(prev => [...prev, msg]);
      setTyping(false);
    });
    chat.markRead(activeConv);
    return unsub;
  }, [activeConv]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const send = async () => {
    if (!inp.trim() || !activeConv) return;
    const text = inp.trim(); setInp(""); setTyping(true);
    try { await chat.sendMessage(activeConv, text); }
    catch { setTyping(false); }
  };

  const PS = isMobile
    ? { position: "fixed", inset: 0, background: "#0D0D22", display: "flex", flexDirection: "column", zIndex: 900 }
    : { position: "fixed", top: 0, right: 0, width: 330, height: "100vh", background: "#0D0D22", borderLeft: "1px solid #1E1E3A", display: "flex", flexDirection: "column", zIndex: 800, boxShadow: "-20px 0 60px rgba(0,0,0,.85)" };

  return (
    <div style={PS}>
      <style>{CSS}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 14px 12px", borderBottom: "1px solid rgba(255,255,255,.07)", flexShrink: 0 }}>
        {(thread || isMobile) && (
          <button onClick={thread ? () => { setActiveConv(null); setJumpTo?.(null); } : onClose}
            style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", cursor: "pointer", width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: C.su }}>
            <ArrowLeft size={14} />
          </button>
        )}
        <div style={{ flex: 1 }}>
          {thread ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: `${C.ac}14`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{thread.emo}</div>
              <div>
                <div style={{ fontWeight: 700, color: C.tx, fontSize: 13 }}>{thread.other?.name ?? thread.emo}</div>
                <div style={{ fontSize: 10, color: typing ? C.ac : C.ok }}>{typing ? "Typing…" : "Online"}</div>
              </div>
            </div>
          ) : (
            <div style={{ fontWeight: 800, color: C.tx, fontSize: 15 }}>
              💬 Messages
              {chat.unreadTotal > 0 && <span style={{ background: C.ac, color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 10, padding: "2px 7px", marginLeft: 6 }}>{chat.unreadTotal}</span>}
            </div>
          )}
        </div>
        {!isMobile && (
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", cursor: "pointer", width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: C.su }}>
            <X size={13} />
          </button>
        )}
      </div>

      {!thread ? (
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
          {chat.conversations.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 42, marginBottom: 10 }}>💬</div>
              <div style={{ fontSize: 14, color: C.tx, fontWeight: 700 }}>No conversations yet</div>
            </div>
          )}
          {chat.conversations.map(c => (
            <div key={c.id} onClick={() => { setActiveConv(c.id); chat.markRead(c.id); }}
              style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 9px", borderRadius: 13, cursor: "pointer", marginBottom: 3, transition: "background .13s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.05)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${C.ac}12`, border: `1px solid ${C.ac}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>{c.emo}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontWeight: 700, color: C.tx, fontSize: 13 }}>{c.other?.name ?? "Conversation"}</span>
                  <span style={{ fontSize: 9, color: C.su }}>{c.last_at ? new Date(c.last_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }) : ""}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: C.su, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{c.last_message ?? "Start the conversation"}</span>
                  {c.unread > 0 && <div style={{ width: 18, height: 18, borderRadius: "50%", background: C.ac, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>{c.unread}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 13px 6px" }}>
            {messages.map(m => {
              const mine = m.sender_id === userId;
              return (
                <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", marginBottom: 9 }}>
                  <div style={{ maxWidth: "80%" }}>
                    <div style={{ background: mine ? G : "rgba(255,255,255,.07)", border: mine ? "none" : "1px solid rgba(255,255,255,.1)", color: "#fff", padding: "9px 13px", borderRadius: mine ? "15px 15px 3px 15px" : "15px 15px 15px 3px", fontSize: 13, lineHeight: 1.5 }}>
                      {m.image_url
                        ? <img src={m.image_url} style={{ display: "block", maxWidth: 200, borderRadius: 10 }} alt="" />
                        : m.content}
                    </div>
                    <div style={{ fontSize: 9, color: C.su, marginTop: 2, textAlign: mine ? "right" : "left" }}>
                      {new Date(m.created_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                      {mine && <span style={{ color: m.is_read ? C.ac : "rgba(255,255,255,.2)", marginLeft: 3 }}>{m.is_read ? "✓✓" : "✓"}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
            {typing && (
              <div style={{ display: "flex", marginBottom: 9 }}>
                <div style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", padding: "9px 13px", borderRadius: "15px 15px 15px 3px", display: "flex", gap: 5 }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: C.su, animation: `tdot 1.1s ${i * 0.18}s ease-in-out infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div style={{ padding: "10px 13px 15px", borderTop: "1px solid rgba(255,255,255,.07)", display: "flex", gap: 8, flexShrink: 0 }}>
            <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Type a message…"
              style={{ flex: 1, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 11, padding: "10px 13px", color: "#EEF0FF", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
            <label style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Camera size={14} color="rgba(255,255,255,.4)" />
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={async e => {
                const file = e.target.files?.[0];
                if (!file) return;
                try { await chat.sendMessage(activeConv, "", file); } catch {}
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

// ─── NOTIF PANEL ──────────────────────────────────────────────
export function NotifPanel({ notifs, onClose, isMobile }) {
  const PS = isMobile
    ? { position: "fixed", inset: 0, background: "#0D0D22", display: "flex", flexDirection: "column", zIndex: 900 }
    : { position: "fixed", top: 0, right: 0, width: 330, height: "100vh", background: "#0D0D22", borderLeft: "1px solid #1E1E3A", display: "flex", flexDirection: "column", zIndex: 800, boxShadow: "-20px 0 60px rgba(0,0,0,.85)" };

  return (
    <div style={PS}>
      <style>{CSS}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 14px 12px", borderBottom: "1px solid rgba(255,255,255,.07)", flexShrink: 0 }}>
        {isMobile && (
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", cursor: "pointer", width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: C.su }}>
            <ArrowLeft size={14} />
          </button>
        )}
        <div style={{ flex: 1, fontWeight: 800, color: C.tx, fontSize: 15 }}>
          🔔 Notifications
          {notifs.unread > 0 && <span style={{ background: C.ac, color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 10, padding: "2px 7px", marginLeft: 6 }}>{notifs.unread}</span>}
        </div>
        {notifs.unread > 0 && (
          <button onClick={notifs.markAllRead} style={{ background: "none", border: "none", color: C.ac, fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
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
        {notifs.notifications.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 42, marginBottom: 10 }}>🔔</div>
            <div style={{ fontSize: 14, color: C.tx, fontWeight: 700 }}>All caught up!</div>
          </div>
        )}
        {notifs.notifications.map(n => (
          <div key={n.id} onClick={() => notifs.markRead(n.id)}
            style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "11px 10px", borderRadius: 13, cursor: "pointer", marginBottom: 5, background: n.is_read ? "transparent" : `${C.ac}08`, border: `1px solid ${n.is_read ? "transparent" : `${C.ac}18`}`, transition: "background .14s" }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{n.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: n.is_read ? 500 : 700, color: n.is_read ? "rgba(255,255,255,.55)" : C.tx, fontSize: 13 }}>{n.title}</div>
              <div style={{ fontSize: 11, color: C.su, marginTop: 2, lineHeight: 1.5 }}>{n.body}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,.25)", marginTop: 4 }}>{new Date(n.created_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
            {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.ac, flexShrink: 0, marginTop: 6, boxShadow: `0 0 8px ${C.ac}` }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ROLE DROPDOWN ────────────────────────────────────────────
function RoleDrop({ current, onSelect, onClose }) {
  const ref = useRef();
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    setTimeout(() => document.addEventListener("mousedown", h), 50);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position: "absolute", top: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)", width: 220, background: "#0D0D22", border: "1px solid #2A2A4A", boxShadow: "0 28px 70px rgba(0,0,0,.95)", borderRadius: 16, padding: 10, zIndex: 9999 }}>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, padding: "5px 10px 8px", borderBottom: "1px solid rgba(255,255,255,.08)", marginBottom: 6 }}>⚡ Switch Role</div>
      {[{ k: "customer", icon: "🛍️", label: "Customer", sub: "Browse & order", c: C.ac }, { k: "rider", icon: "🏍️", label: "Rider", sub: "Earn 70% per delivery", c: C.ok }, { k: "store", icon: "🏪", label: "Store", sub: "Manage your store", c: C.wa }].map(r => (
        <div key={r.k} onClick={() => onSelect(r.k)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 11px", borderRadius: 11, cursor: "pointer", background: current === r.k ? `${r.c}1A` : "transparent", marginBottom: 4, transition: "all .14s", border: `1px solid ${current === r.k ? `${r.c}30` : "transparent"}` }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: `${r.c}18`, border: `1px solid ${r.c}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{r.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: current === r.k ? r.c : C.tx }}>{r.label}</div>
            <div style={{ fontSize: 10, color: C.su, marginTop: 1 }}>{r.sub}</div>
          </div>
          {current === r.k && <CheckCircle size={13} color={r.c} />}
        </div>
      ))}
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────
export default function AppShell({ role, tab, setTab, chat, notifs, showChat, setShowChat, showNotif, setShowNotif, chatJump, setChatJump, onRoleSelect, isMobile, userId, children, hubsHook }) {
  const [showDrop, setDrop] = useState(false);
  const [hov,      setHov]  = useState(null);
  const [chatMode, setChatMode] = useState("chat"); // "chat" or "hub" for customer

  const nav    = RC[role].nav;
  const rc     = RC[role].color;
  const ri     = RC[role].icon;
  const rl     = RC[role].label;
  const { theme, toggleTheme } = useTheme();


  const tChat  = () => { setShowChat(p => { const n = !p; if (n) setShowNotif(false); return n; }); };
  const tNotif = () => { setShowNotif(p => { const n = !p; if (n) setShowChat(false); return n; }); };

  const Badge = ({ icon, count, onClick, active }) => (
    <div onClick={onClick} style={{ cursor: "pointer", width: 32, height: 32, borderRadius: 9, background: active ? `${C.ac}18` : "rgba(255,255,255,.04)", border: `1px solid ${active ? C.ac + "40" : "rgba(255,255,255,.09)"}`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      {icon}
      {count > 0 && <div style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: C.ac, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "#fff", border: `2px solid ${C.s1}` }}>{count}</div>}
    </div>
  );

  const RoleTag = () => (
    <div style={{ position: "relative" }}>
      <div onClick={() => setDrop(p => !p)} style={{ display: "inline-flex", alignItems: "center", gap: isMobile ? 4 : 6, background: `${rc}18`, color: rc, border: `1px solid ${rc}35`, borderRadius: 20, padding: isMobile ? "4px 8px 4px 6px" : "6px 12px 6px 9px", cursor: "pointer", fontSize: isMobile ? 10 : 12, fontWeight: 700, userSelect: "none", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: isMobile ? 12 : 14 }}>{ri}</span>
        {!isMobile && rl}
        <svg width={8} height={8} viewBox="0 0 12 12" fill="none" style={{ transform: showDrop ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {showDrop && <RoleDrop current={role} onSelect={r => { onRoleSelect(r); setDrop(false); }} onClose={() => setDrop(false)} />}
    </div>
  );

  if (isMobile) return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.tx, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", paddingTop: 48, paddingBottom: 70 }}>
      <style>{`${CSS}body{overflow-x:hidden}`}</style>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 48, background: "rgba(6,6,15,.97)", backdropFilter: "blur(22px)", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", zIndex: 200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: GZ, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>⚡</div>
          <span style={{ fontWeight: 900, fontSize: 16, background: GZ, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -0.5 }}>ZaraDrop</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <RoleTag />
          <Badge icon={<MessageCircle size={15} color={showChat ? C.ac : "rgba(255,255,255,.6)"} />} count={chat.unreadTotal} onClick={tChat} active={showChat} />
          <Badge icon={<Bell size={15} color={showNotif ? C.ac : "rgba(255,255,255,.6)"} />} count={notifs.unread} onClick={tNotif} active={showNotif} />
          <button onClick={toggleTheme} style={{ width: 34, height: 34, borderRadius: 11, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center", color: C.su, cursor: "pointer" }} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
      {children}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 66, background: "linear-gradient(180deg, rgba(9,9,28,.7) 0%, rgba(9,9,28,.97) 100%)", backdropFilter: "blur(22px)", borderTop: "1px solid rgba(255,255,255,.1)", display: "flex", alignItems: "center", zIndex: 200, paddingBottom: 4 }}>
        {nav.map(({ I, l }, i) => {
          const active = tab === i;
          return (
            <div key={i} onClick={() => setTab(i)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, cursor: "pointer", padding: "8px 4px", color: active ? rc : "rgba(255,255,255,.45)", transition: "all .18s ease", transform: active ? "scale(1.08)" : "scale(1)" }}>
              <div style={{ position: "relative", width: 38, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, background: active ? `${rc}15` : "transparent", transition: "all .15s" }}>
                {active && <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: `${rc}08`, border: `1.5px solid ${rc}35` }} />}
                <I size={20} style={{ position: "relative", zIndex: 1, fontWeight: active ? 800 : 600 }} />
              </div>
              <span style={{ fontSize: 9.5, fontWeight: active ? 800 : 600, letterSpacing: 0.2 }}>{l}</span>
            </div>
          );
        })}
      </div>
      {showChat  && (
        <>
          {role === "customer" && hubsHook && (
            <div style={{ position: "fixed", top: 0, right: isMobile ? 0 : sidebarW, width: isMobile ? "100%" : 330, height: 48, background: "rgba(9,9,28,.95)", backdropFilter: "blur(22px)", borderBottom: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", gap: 4, padding: "0 8px", zIndex: 801 }}>
              <button
                onClick={() => setChatMode("chat")}
                style={{
                  flex: 1,
                  height: 32,
                  borderRadius: 8,
                  background: chatMode === "chat" ? `${C.ac}18` : "transparent",
                  border: chatMode === "chat" ? `1px solid ${C.ac}40` : "1px solid transparent",
                  color: chatMode === "chat" ? C.ac : "rgba(255,255,255,.5)",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all .15s",
                }}
              >
                💬 Chat
              </button>
              <button
                onClick={() => setChatMode("hub")}
                style={{
                  flex: 1,
                  height: 32,
                  borderRadius: 8,
                  background: chatMode === "hub" ? `${C.ac}18` : "transparent",
                  border: chatMode === "hub" ? `1px solid ${C.ac}40` : "1px solid transparent",
                  color: chatMode === "hub" ? C.ac : "rgba(255,255,255,.5)",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all .15s",
                }}
              >
                🌍 Hub
              </button>
            </div>
          )}
          {chatMode === "chat" && <ChatPanel chat={chat} userId={userId} onClose={() => setShowChat(false)} isMobile={isMobile} jumpTo={chatJump} setJumpTo={setChatJump} />}
          {chatMode === "hub" && role === "customer" && hubsHook && (
            <HubPanel
              hub={hubsHook.hub}
              userId={userId}
              onClose={() => setShowChat(false)}
              isMobile={isMobile}
              hubs={hubsHook}
              isHubMember={hubsHook.hub?.isMember}
            />
          )}
        </>
      )}
      {showNotif && <NotifPanel notifs={notifs}             onClose={() => setShowNotif(false)} isMobile />}
    </div>
  );

  const sidebarW = 260;
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, color: C.tx, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <style>{CSS}</style>
      <div style={{ width: sidebarW, flexShrink: 0, background: "#09091E", borderRight: "1px solid #1A1A38", position: "fixed", top: 0, left: 0, height: "100vh", display: "flex", flexDirection: "column", zIndex: 100 }}>
        <div style={{ padding: "22px 22px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 13, background: GZ, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, boxShadow: "0 5px 22px rgba(255,107,53,.35)", flexShrink: 0 }}>⚡</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 20, background: GZ, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -0.5 }}>ZaraDrop</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)", letterSpacing: 2, textTransform: "uppercase", marginTop: 1 }}>Ecosystem</div>
          </div>
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,.08) 20%,rgba(255,255,255,.08) 80%,transparent)", margin: "0 0 14px" }} />
        <div style={{ padding: "0 18px 14px" }}><RoleTag /></div>
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,.08) 20%,rgba(255,255,255,.08) 80%,transparent)", margin: "0 0 10px" }} />
        <div style={{ padding: "6px 24px 8px", fontSize: 9, color: "rgba(255,255,255,.25)", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Navigation</div>
        <div style={{ flex: 1, padding: "0 14px", overflowY: "auto" }}>
          {nav.map(({ I, l }, i) => {
            const active = tab === i, h = hov === i;
            return (
              <div key={i} onClick={() => setTab(i)} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, cursor: "pointer", transition: "all .18s ease", background: active ? `${rc}18` : h ? "rgba(255,255,255,.08)" : "transparent", color: active ? rc : h ? "rgba(255,255,255,.9)" : "rgba(255,255,255,.6)", fontWeight: active ? 700 : 600, marginBottom: 6, border: `1px solid ${active ? `${rc}35` : h ? "rgba(255,255,255,.12)" : "transparent"}`, boxShadow: active ? `0 8px 24px ${rc}22` : "none" }}>
                <I size={22} style={{ opacity: active ? 1 : 0.8 }} />
                <span style={{ fontSize: 14.5 }}>{l}</span>
                {active && <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: rc, boxShadow: `0 0 12px ${rc}` }} />}
              </div>
            );
          })}
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,.08) 20%,rgba(255,255,255,.08) 80%,transparent)", margin: "8px 0" }} />
        <div style={{ padding: "8px 14px 20px", display: "flex", flexDirection: "column", gap: 7 }}>
          {[{ icon: <MessageCircle size={18} />, label: "Messages", count: chat.unreadTotal, active: showChat, onClick: tChat, color: C.ac }, { icon: <Bell size={18} />, label: "Notifications", count: notifs.unread, active: showNotif, onClick: tNotif, color: C.wa }].map(item => (
            <div key={item.label} onClick={item.onClick} style={{ display: "flex", alignItems: "center", gap: 13, padding: "12px 16px", borderRadius: 14, cursor: "pointer", border: `1px solid ${item.active ? item.color + "45" : "rgba(255,255,255,.1)"}`, color: item.active ? item.color : "rgba(255,255,255,.55)", fontSize: 14, fontWeight: item.active ? 700 : 500, transition: "all .17s", background: item.active ? `${item.color}12` : "rgba(255,255,255,.03)" }}>
              {item.icon}<span style={{ flex: 1 }}>{item.label}</span>
              {item.count > 0 && <div style={{ width: 22, height: 22, borderRadius: "50%", background: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>{item.count}</div>}
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, marginLeft: sidebarW, display: "flex", flexDirection: "column", minHeight: "100vh", marginRight: (showChat || showNotif) ? 330 : 0, transition: "margin-right .25s" }}>
        <div style={{ position: "sticky", top: 0, height: 60, background: "rgba(9,9,28,.95)", backdropFilter: "blur(22px)", borderBottom: "1px solid #1A1A38", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", zIndex: 50, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: C.tx }}>{nav[tab]?.l}</div>
              <div style={{ fontSize: 10, color: C.su, marginTop: 1 }}>{new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
            </div>
            {role === "customer" && hubsHook && (
              <div style={{ marginLeft: 20, paddingLeft: 20, borderLeft: "1px solid rgba(255,255,255,.12)", display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin size={14} color={C.ac} />
                <button onClick={() => hubsHook.setRegion(hubsHook.allRegions[(hubsHook.allRegions.indexOf(hubsHook.currentRegion) + 1) % hubsHook.allRegions.length])}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: C.ac, fontFamily: "inherit", padding: "4px 8px", borderRadius: 6, transition: "all .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = `${C.ac}15`}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}>
                  {hubsHook.currentRegion}
                </button>
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Badge icon={<MessageCircle size={16} color={showChat ? C.ac : "rgba(255,255,255,.7)"} />} count={chat.unreadTotal} onClick={tChat} active={showChat} />
            <Badge icon={<Bell size={16} color={showNotif ? C.ac : "rgba(255,255,255,.7)"} />} count={notifs.unread} onClick={tNotif} active={showNotif} />
            <button onClick={toggleTheme} style={{ width: 38, height: 38, borderRadius: 12, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.05)", display: "flex", alignItems: "center", justifyContent: "center", color: C.su, cursor: "pointer" }} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: GZ, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, cursor: "pointer", boxShadow: "0 3px 16px rgba(255,107,53,.3)" }}>{ri}</div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>{children}</div>
      </div>
      {showChat  && (
        <>
          {role === "customer" && hubsHook && (
            <div style={{ position: "fixed", top: 0, right: 0, width: 330, height: 48, background: "rgba(9,9,28,.95)", backdropFilter: "blur(22px)", borderBottom: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", gap: 4, padding: "0 8px", zIndex: 801 }}>
              <button
                onClick={() => setChatMode("chat")}
                style={{
                  flex: 1,
                  height: 32,
                  borderRadius: 8,
                  background: chatMode === "chat" ? `${C.ac}18` : "transparent",
                  border: chatMode === "chat" ? `1px solid ${C.ac}40` : "1px solid transparent",
                  color: chatMode === "chat" ? C.ac : "rgba(255,255,255,.5)",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all .15s",
                }}
              >
                💬 Chat
              </button>
              <button
                onClick={() => setChatMode("hub")}
                style={{
                  flex: 1,
                  height: 32,
                  borderRadius: 8,
                  background: chatMode === "hub" ? `${C.ac}18` : "transparent",
                  border: chatMode === "hub" ? `1px solid ${C.ac}40` : "1px solid transparent",
                  color: chatMode === "hub" ? C.ac : "rgba(255,255,255,.5)",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all .15s",
                }}
              >
                🌍 Hub
              </button>
            </div>
          )}
          {chatMode === "chat" && <ChatPanel chat={chat} userId={userId} onClose={() => setShowChat(false)} isMobile={false} jumpTo={chatJump} setJumpTo={setChatJump} />}
          {chatMode === "hub" && role === "customer" && hubsHook && (
            <HubPanel
              hub={hubsHook.hub}
              userId={userId}
              onClose={() => setShowChat(false)}
              isMobile={false}
              hubs={hubsHook}
              isHubMember={hubsHook.hub?.isMember}
            />
          )}
        </>
      )}
      {showNotif && <NotifPanel notifs={notifs}             onClose={() => setShowNotif(false)} isMobile={false} />}
    </div>
  );
}