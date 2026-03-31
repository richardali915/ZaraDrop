// src/components/Toast.jsx
// Renders transient toasts for INCOMING notifications (new DB inserts).
// NOT used for UI feedback like button clicks — those use inline error states.
// Place <ToastContainer> once in App.jsx, pass notifs.toasts to it.

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { C, CSS } from '../constants';

const TYPE_COLORS = {
  new_order:      C.wa,
  order_placed:   C.ok,
  rider_assigned: C.ac,
  delivered:      C.ok,
  custom_request: '#FF6B35',
  quote_received: C.ok,
  bonus:          C.ok,
  daily_bonus:    C.ok,
  cancelled:      C.er,
  rider_cancelled:C.er,
  topup:          C.ok,
  transfer:       C.ac,
  default:        C.ac,
};

function Toast({ id, title, body, type, icon, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const color = TYPE_COLORS[type] || TYPE_COLORS.default;

  // Slide-in animation on mount
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(id), 300); // wait for slide-out
  };

  return (
    <div
      onClick={handleDismiss}
      style={{
        display:        'flex',
        alignItems:     'flex-start',
        gap:            10,
        padding:        '12px 14px',
        borderRadius:   14,
        background:     'rgba(12,12,30,0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border:         `1px solid ${color}40`,
        boxShadow:      `0 8px 32px rgba(0,0,0,.6), 0 0 0 1px ${color}18`,
        cursor:         'pointer',
        maxWidth:       340,
        width:          '100%',
        // Slide in from right, slide out
        transform:      visible ? 'translateX(0) scale(1)' : 'translateX(100%) scale(0.96)',
        opacity:        visible ? 1 : 0,
        transition:     'transform 0.28s cubic-bezier(.34,1.3,.64,1), opacity 0.28s ease',
        marginBottom:   8,
        position:       'relative',
        overflow:       'hidden',
      }}
    >
      {/* Accent bar on left */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: color, borderRadius: '14px 0 0 14px' }} />

      {/* Icon */}
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0, marginLeft: 4,
        background: `${color}18`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
      }}>{icon || '🔔'}</div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, color: C.tx, fontSize: 13, lineHeight: 1.3 }}>{title}</div>
        {body && <div style={{ fontSize: 11, color: C.su, marginTop: 3, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{body}</div>}
      </div>

      {/* Dismiss button */}
      <button
        onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.su, padding: 2, flexShrink: 0, display: 'flex', alignItems: 'center', lineHeight: 1 }}
      >
        <X size={13} />
      </button>

      {/* Progress bar auto-dismiss indicator */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: `${color}30`,
      }}>
        <div style={{
          height: '100%', background: color, borderRadius: 2,
          animation: 'toastProgress 4s linear forwards',
        }} />
      </div>
    </div>
  );
}

/**
 * ToastContainer — place once at the root of your app.
 * Props:
 *   toasts      — from useNotifications().toasts
 *   onDismiss   — from useNotifications().dismissToast
 *   position    — 'top-right' (default) | 'bottom-right' | 'top-left' | 'bottom-left'
 */
export function ToastContainer({ toasts = [], onDismiss, position = 'top-right' }) {
  const isTop    = position.startsWith('top');
  const isRight  = position.endsWith('right');

  return (
    <>
      <style>{`
        ${CSS}
        @keyframes toastProgress {
          from { width: 100%; }
          to   { width: 0%;   }
        }
      `}</style>
      <div style={{
        position:      'fixed',
        top:           isTop    ? 60  : 'auto',
        bottom:        isTop    ? 'auto' : 20,
        right:         isRight  ? 14  : 'auto',
        left:          isRight  ? 'auto' : 14,
        zIndex:        9998,
        display:       'flex',
        flexDirection: isTop ? 'column' : 'column-reverse',
        alignItems:    isRight ? 'flex-end' : 'flex-start',
        pointerEvents: 'none', // let clicks pass through the container
      }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: 'all' }}>
            <Toast
              id={t.id}
              title={t.title}
              body={t.body}
              type={t.type}
              icon={t.icon}
              onDismiss={onDismiss}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export default ToastContainer;