// src/components/RoleSelector.jsx
import React, { useState, useEffect } from 'react';
import { ChevronRight, Zap, Package, TrendingUp, Shield, Clock } from 'lucide-react';
import { C, GZ, CSS } from '../constants';
import IDRequestModal from './IDRequestModal';

const STATS = [
  { icon: Package,     value: '12,400+', label: 'Orders delivered'    },
  { icon: TrendingUp,  value: '₦3.2M',   label: 'Paid to riders'      },
  { icon: Shield,      value: '20',       label: 'Partner stores'      },
  { icon: Clock,       value: '28 min',   label: 'Average delivery'    },
];

const PERKS = [
  { emo: '🚀', text: 'Live order tracking — see your rider move in real time'  },
  { emo: '💰', text: 'Riders keep 70% of every delivery fee. Always.'           },
  { emo: '⚡', text: 'ZP Points on every order — earn while you eat'            },
  { emo: '🔒', text: 'Wallet payments — no card details on delivery'            },
];

const ROLES = [
  {
    k:     'customer',
    icon:  '🛍️',
    title: 'Order Food',
    sub:   'Restaurants, pharmacies & supermarkets — delivered to your door',
    color: '#C144D4',
    tag:   'Open to everyone',
    tagBg: 'rgba(193,68,212,.15)',
  },
  {
    k:     'rider',
    icon:  '🏍️',
    title: 'Deliver & Earn',
    sub:   'Pick your jobs, quote your price on custom runs — your time, your money',
    color: '#22D47C',
    tag:   'Registered Riders',
    tagBg: 'rgba(34,212,124,.13)',
    newID: 'rider',
    newIDLabel: 'New rider? Request your Rider ID →',
  },
  {
    k:     'store',
    icon:  '🏪',
    title: 'Store Partners',
    sub:   'Get orders, manage your menu and grow your Abuja customer base',
    color: '#F59E0B',
    tag:   'Partner Stores',
    tagBg: 'rgba(245,158,11,.13)',
    newID: 'store',
    newIDLabel: 'Become a partner store →',
  },
];

// ── Left panel ────────────────────────────────────────────────
function LeftPanel({ isMobile }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(p => (p + 1) % PERKS.length), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      flex: isMobile ? 'none' : '1 1 0',
      minHeight: isMobile ? 'auto' : '100vh',
      background: 'linear-gradient(160deg,#0A0018 0%,#0D001F 40%,#06060F 100%)',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: isMobile ? '40px 24px 24px' : '60px 56px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient glows */}
      <div style={{ position:'absolute', top:'-10%', left:'-10%', width:480, height:480, borderRadius:'50%', background:'radial-gradient(circle,rgba(193,68,212,.18) 0%,transparent 65%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-5%', right:'-5%', width:380, height:380, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,107,53,.12) 0%,transparent 65%)', pointerEvents:'none' }} />

      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom: isMobile ? 20 : 52, position:'relative', zIndex:1 }}>
        <div style={{ width:52, height:52, borderRadius:16, background:GZ, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, boxShadow:'0 10px 32px rgba(255,107,53,.45)', flexShrink:0 }}>⚡</div>
        <div>
          <div style={{ fontSize:28, fontWeight:900, background:GZ, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', letterSpacing:-1, lineHeight:1 }}>ZaraDrop</div>
          <div style={{ fontSize:9, color:'rgba(255,255,255,.35)', letterSpacing:3, textTransform:'uppercase', fontWeight:600, marginTop:3 }}>Delivery Ecosystem · Abuja</div>
        </div>
      </div>

      {/* Headline */}
      {!isMobile && (
        <>
          <div style={{ fontSize:38, fontWeight:900, color:'#fff', lineHeight:1.15, marginBottom:14, position:'relative', zIndex:1 }}>
            The delivery app<br />
            <span style={{ background:GZ, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Abuja actually trusts.</span>
          </div>
          <p style={{ color:'rgba(255,255,255,.45)', fontSize:14, lineHeight:1.8, maxWidth:380, marginBottom:44, position:'relative', zIndex:1 }}>
            Fast deliveries, fair pay for riders, real tools for stores. No middleman games. Just a platform that works.
          </p>
        </>
      )}

      {/* Stats grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom: isMobile ? 20 : 40, position:'relative', zIndex:1, maxWidth: isMobile ? '100%' : 420 }}>
        {STATS.map(({ icon: Icon, value, label }) => (
          <div key={label} style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:14, padding:'14px 16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5 }}>
              <Icon size={13} color='rgba(255,107,53,.7)' />
              <span style={{ fontSize:9, color:'rgba(255,255,255,.3)', fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>{label}</span>
            </div>
            <div style={{ fontSize:22, fontWeight:900, color:'#fff', letterSpacing:-0.5 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Rotating perks */}
      {!isMobile && (
        <div style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', borderRadius:14, padding:'14px 16px', maxWidth:420, position:'relative', zIndex:1, minHeight:58 }}>
          {PERKS.map((p, i) => (
            <div key={i} style={{ display: i === tick ? 'flex' : 'none', alignItems:'center', gap:11, animation: i === tick ? 'slideUp .35s ease' : 'none' }}>
              <span style={{ fontSize:20, flexShrink:0 }}>{p.emo}</span>
              <span style={{ fontSize:12, color:'rgba(255,255,255,.6)', lineHeight:1.5 }}>{p.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Right panel — role selection ──────────────────────────────
function RightPanel({ onSelect, isMobile }) {
  const [hov,      setHov]      = useState(null);
  const [showIDReq, setShowIDReq] = useState(null);

  return (
    <div style={{
      flex: isMobile ? 'none' : '0 0 480px',
      minHeight: isMobile ? 'auto' : '100vh',
      background: isMobile ? 'transparent' : 'rgba(255,255,255,.018)',
      backdropFilter: isMobile ? 'none' : 'blur(2px)',
      borderLeft: isMobile ? 'none' : '1px solid rgba(255,255,255,.06)',
      display:'flex', flexDirection:'column',
      justifyContent:'center', padding: isMobile ? '0 24px 40px' : '60px 44px',
      position:'relative', zIndex:1,
    }}>
      {showIDReq && <IDRequestModal type={showIDReq} onClose={() => setShowIDReq(null)} />}

      <div style={{ marginBottom: isMobile ? 24 : 36 }}>
        <div style={{ fontSize: isMobile ? 20 : 26, fontWeight:900, color:'#fff', marginBottom:6, lineHeight:1.2 }}>
          {isMobile ? 'Choose how to enter' : 'How do you want\nto enter ZaraDrop?'}
        </div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,.35)', lineHeight:1.7 }}>
          Sign in with your preferred account — takes 10 seconds.
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {ROLES.map(r => (
          <div key={r.k}>
            {/* Main card */}
            <div
              onClick={() => onSelect(r.k)}
              onMouseEnter={() => setHov(r.k)}
              onMouseLeave={() => setHov(null)}
              style={{
                background: hov === r.k ? `${r.color}0D` : 'rgba(255,255,255,.04)',
                border: `1px solid ${hov === r.k ? r.color + '45' : 'rgba(255,255,255,.09)'}`,
                borderRadius: r.newID ? '16px 16px 0 0' : 16,
                padding: '18px 18px',
                cursor:'pointer', transition:'all .2s',
                display:'flex', alignItems:'center', gap:14,
                boxShadow: hov === r.k ? `0 12px 40px ${r.color}15` : 'none',
                transform: hov === r.k ? 'translateX(4px)' : 'none',
              }}
            >
              <div style={{ width:52, height:52, borderRadius:15, background:`${r.color}15`, border:`1px solid ${r.color}28`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0, transition:'transform .2s', transform: hov === r.k ? 'scale(1.08)' : 'scale(1)' }}>
                {r.icon}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                  <span style={{ color: hov === r.k ? '#fff' : 'rgba(255,255,255,.85)', fontWeight:800, fontSize:15 }}>{r.title}</span>
                  <span style={{ background:r.tagBg, color:r.color, border:`1px solid ${r.color}28`, borderRadius:20, padding:'2px 9px', fontSize:9, fontWeight:700, letterSpacing:.5 }}>{r.tag}</span>
                </div>
                <div style={{ color:'rgba(255,255,255,.4)', fontSize:12, lineHeight:1.5 }}>{r.sub}</div>
              </div>
              <div style={{ width:30, height:30, borderRadius:9, background:`${r.color}12`, border:`1px solid ${r.color}22`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .2s', transform: hov === r.k ? 'translateX(3px)' : 'none' }}>
                <ChevronRight size={14} color={r.color} />
              </div>
            </div>

            {/* New ID link tab */}
            {r.newID && (
              <button
                onClick={() => setShowIDReq(r.newID)}
                style={{ width:'100%', background:'rgba(255,255,255,.02)', border:`1px solid ${r.color}20`, borderTop:'none', borderRadius:'0 0 16px 16px', padding:'8px 18px', cursor:'pointer', fontFamily:'inherit', color:r.color, fontSize:11, fontWeight:600, textAlign:'center', transition:'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = `${r.color}07`}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.02)'}
              >
                {r.newIDLabel}
              </button>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop:28, fontSize:10, color:'rgba(255,255,255,.2)', textAlign:'center', lineHeight:2 }}>
        By continuing you agree to our{' '}
        <span style={{ color:'rgba(255,255,255,.4)', textDecoration:'underline', cursor:'pointer' }}>Terms</span>
        {' & '}
        <span style={{ color:'rgba(255,255,255,.4)', textDecoration:'underline', cursor:'pointer' }}>Privacy Policy</span>
        <br />
        <span style={{ color:'rgba(255,107,53,.35)' }}>ZaraDrop ⚡ {new Date().getFullYear()}</span>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────
export default function RoleSelector({ onSelect }) {
  const [isMobile, setMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 900);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  return (
    <div style={{
      minHeight:'100vh', background:'#06060F',
      display:'flex', flexDirection: isMobile ? 'column' : 'row',
      fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      overflow: isMobile ? 'auto' : 'hidden',
    }}>
      <style>{CSS}</style>
      <LeftPanel  isMobile={isMobile} />
      <RightPanel isMobile={isMobile} onSelect={onSelect} />
    </div>
  );
}