import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, X, Plus, MapPin, Users } from 'lucide-react';
import { C, G } from '../../styles/tokens';

export function HubPanel({ hub, userId, onClose, isMobile, hubs: hubsHook, isHubMember }) {
  const [showNewPost, setShowNewPost] = useState(false);
  const [postText, setPostText] = useState('');
  const [expandedThread, setExpandedThread] = useState(null);

  const PS = isMobile
    ? { position: "fixed", inset: 0, background: "var(--zd-bg)", display: "flex", flexDirection: "column", zIndex: 900 }
    : { position: "fixed", top: 0, right: 0, width: 330, height: "100vh", background: "var(--zd-bg)", borderLeft: "1px solid var(--zd-border)", display: "flex", flexDirection: "column", zIndex: 800, boxShadow: "-20px 0 60px rgba(0,0,0,.85)" };

  const handlePostDiscussion = () => {
    if (postText.trim()) {
      hubsHook.postDiscussion(postText);
      setPostText('');
      setShowNewPost(false);
    }
  };

  if (!hub || !isHubMember) {
    return (
      <div style={PS}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 14px 12px", borderBottom: "1px solid var(--zd-border)", flexShrink: 0 }}>
          {isMobile && (
            <button onClick={onClose} style={{ background: "var(--zd-surface)", border: "1px solid var(--zd-border)", cursor: "pointer", width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: C.su }}>
              <X size={14} />
            </button>
          )}
          <div style={{ flex: 1, fontWeight: 800, color: C.tx, fontSize: 15 }}>🌍 Community Hub</div>
          {!isMobile && (
            <button onClick={onClose} style={{ background: "var(--zd-surface)", border: "1px solid var(--zd-border)", cursor: "pointer", width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: C.su }}>
              <X size={13} />
            </button>
          )}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 13px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>🌐</div>
          <div style={{ fontWeight: 700, color: C.tx, fontSize: 14, marginBottom: 6 }}>Join a Hub to Start</div>
          <div style={{ fontSize: 12, color: C.su, marginBottom: 18, lineHeight: 1.5 }}>Pick your region to join local discussions, share reviews, and connect with your community.</div>
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 7 }}>
            {hubsHook.allHubs.slice(0, 5).map(h => (
              <button
                key={h.id}
                onClick={() => hubsHook.joinHub(h.region)}
                style={{
                  background: `${C.ac}12`,
                  border: `1px solid ${C.ac}28`,
                  cursor: "pointer",
                  borderRadius: 12,
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.ac,
                  fontFamily: "inherit",
                  transition: "all .15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = `${C.ac}22`}
                onMouseLeave={e => e.currentTarget.style.background = `${C.ac}12`}
              >
                <span style={{ fontSize: 18 }}>{h.emoji}</span>
                <span style={{ flex: 1, textAlign: "left" }}>{h.name}</span>
                <span style={{ fontSize: 11, color: C.su }}>+{h.members}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={PS}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 14px 12px", borderBottom: "1px solid var(--zd-border)", flexShrink: 0 }}>
        {isMobile && (
          <button onClick={onClose} style={{ background: "var(--zd-surface)", border: "1px solid var(--zd-border)", cursor: "pointer", width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: C.su }}>
            <X size={14} />
          </button>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, color: C.tx, fontSize: 15, display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 18 }}>{hub.emoji}</span>
            {hub.name}
          </div>
          <div style={{ fontSize: 10, color: C.su, marginTop: 2, display: "flex", alignItems: "center", gap: 3 }}>
            <Users size={10} /> {hub.members} members
          </div>
        </div>
        {!isMobile && (
          <button onClick={onClose} style={{ background: "var(--zd-surface)", border: "1px solid var(--zd-border)", cursor: "pointer", width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: C.su }}>
            <X size={13} />
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 13px 6px" }}>
        {hub.discussions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: C.su }}>
            <div style={{ fontSize: 38, marginBottom: 10 }}>💬</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.tx }}>No discussions yet</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>Be the first to start one!</div>
          </div>
        ) : (
          hub.discussions.map(d => (
            <div
              key={d.id}
              onClick={() => setExpandedThread(expandedThread === d.id ? null : d.id)}
              style={{
                background: "var(--zd-surface)",
                border: "1px solid var(--zd-border)",
                borderRadius: 12,
                padding: "11px 12px",
                marginBottom: 8,
                cursor: "pointer",
                transition: "all .15s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.ac + '40'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--zd-border)'}
            >
              <div style={{ display: "flex", gap: 9, marginBottom: 8 }}>
                <div style={{ fontSize: 24, flexShrink: 0 }}>{d.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: C.tx }}>{d.author}</div>
                  <div style={{ fontSize: 10, color: C.su }}>{d.date}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: C.tx, lineHeight: 1.5, marginBottom: 8 }}>{d.content}</div>
              <div style={{ display: "flex", gap: 10, justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid var(--zd-border-strong)" }}>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    hubsHook.likeDiscussion(d.id);
                  }}
                  style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: C.su, fontFamily: "inherit", transition: "color .15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = C.ok}
                  onMouseLeave={e => e.currentTarget.style.color = C.su}
                >
                  <Heart size={11} /> {d.likes}
                </button>
                <button
                  onClick={e => e.stopPropagation()}
                  style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: C.su, fontFamily: "inherit", transition: "color .15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = C.ac}
                  onMouseLeave={e => e.currentTarget.style.color = C.su}
                >
                  <MessageCircle size={11} /> {d.replies}
                </button>
                <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: C.su, fontFamily: "inherit", transition: "color .15s" }}>
                  <Share2 size={11} />
                </button>
              </div>
              {expandedThread === d.id && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--zd-border-strong)" }}>
                  <div style={{ fontSize: 10, color: C.su, marginBottom: 7 }}>{d.replies} {d.replies === 1 ? 'reply' : 'replies'}</div>
                  {d.replies > 0 && (
                    <div style={{ background: "var(--zd-bg)", borderRadius: 8, padding: "8px 10px", fontSize: 11, color: C.su, marginBottom: 8 }}>
                      Tap to see replies
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ padding: "10px 13px 15px", borderTop: "1px solid var(--zd-border)", display: "flex", gap: 8, flexShrink: 0 }}>
        {!showNewPost ? (
          <button
            onClick={() => setShowNewPost(true)}
            style={{
              width: "100%",
              background: G,
              border: "none",
              color: "#fff",
              borderRadius: 11,
              padding: "10px 13px",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Plus size={13} /> Share Your Experience
          </button>
        ) : (
          <>
            <input
              value={postText}
              onChange={e => setPostText(e.target.value)}
              placeholder="Share your experience, tip, or review…"
              style={{
                flex: 1,
                background: "var(--zd-surface)",
                border: "1px solid var(--zd-border)",
                borderRadius: 11,
                padding: "10px 12px",
                color: "var(--zd-text)",
                fontSize: 12,
                outline: "none",
                fontFamily: "inherit",
                maxHeight: 80,
                resize: "none",
              }}
            />
            <button
              onClick={handlePostDiscussion}
              disabled={!postText.trim()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                background: postText.trim() ? G : "var(--zd-surface)",
                border: "1px solid var(--zd-border)",
                color: postText.trim() ? "#fff" : C.su,
                cursor: postText.trim() ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontFamily: "inherit",
              }}
            >
              ⤴️
            </button>
          </>
        )}
      </div>
    </div>
  );
}
