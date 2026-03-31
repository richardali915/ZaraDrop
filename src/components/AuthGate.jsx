// src/components/AuthGate.jsx
// Full OAuth auth flow (Google, Facebook, X/Twitter).
// - Customers: sign in → done
// - Riders: sign in → enter Rider ID to link profile
// - Stores: sign in → enter Store ID + passcode → face scan (admin only)

import React, { useState, useEffect } from 'react';
import { C, G, GZ, CSS, DEMO } from '../constants';
import { gl } from '../utils';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { RC } from '../data';
import { Back, FI, Btn } from './Micro';
import FaceScan from './FaceScan';
import IDRequestModal from './IDRequestModal';

// ── Provider button ───────────────────────────────────────────
function OAuthBtn({ provider, label, icon, primary, onClick, loading }) {
  const [hov, setHov] = useState(false);
  const isGoogle   = provider === 'google';
  const isFacebook = provider === 'facebook';
  const bg = primary
    ? (hov ? 'rgba(255,255,255,.13)' : 'rgba(255,255,255,.09)')
    : (hov ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.04)');

  return (
    <button
      disabled={loading}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        width:'100%', padding: primary ? '13px 16px' : '11px 16px',
        borderRadius:13, background:bg,
        border:`1px solid ${primary ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.1)'}`,
        cursor:loading ? 'not-allowed' : 'pointer', fontFamily:'inherit',
        display:'flex', alignItems:'center', justifyContent:'center', gap:10,
        transition:'all .16s', marginBottom:9,
        boxShadow: primary && hov ? '0 6px 24px rgba(0,0,0,.4)' : 'none',
        opacity: loading ? .6 : 1,
      }}>
      <span style={{ fontSize:20, lineHeight:1, flexShrink:0 }}>{icon}</span>
      <span style={{ fontSize:13, fontWeight: primary ? 700 : 600, color: primary ? '#fff' : 'rgba(255,255,255,.7)' }}>
        {loading ? 'Redirecting…' : label}
      </span>
    </button>
  );
}

// ── Social sign-in step ───────────────────────────────────────
function SocialSignIn({ rc, role, onBack, onSignedIn }) {
  const { signInWithOAuth } = useAuth();
  const [loading, setLoading] = useState(null); // which provider is loading
  const [err,     setErr]     = useState('');

  // After OAuth redirect, Supabase restores the session automatically.
  // We listen here in case the user returns on the same tab.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) onSignedIn(session.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleOAuth = async (provider) => {
    setErr(''); setLoading(provider);
    // Store the intended role in sessionStorage so App.jsx can read it after redirect
    sessionStorage.setItem('zaradrop_pending_role', role);
    try {
      await signInWithOAuth(provider);
      // Browser navigates away — code below won't run
    } catch (e) {
      setErr(e.message);
      setLoading(null);
    }
  };

  const roleColor = rc.color;

  return (
    <Wrap rc={rc} onBack={onBack}>
      <div style={{ textAlign:'center', marginBottom:22 }}>
        <div style={{ width:52, height:52, borderRadius:16, background:`${roleColor}18`, border:`1px solid ${roleColor}28`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, margin:'0 auto 12px' }}>{rc.icon}</div>
        <div style={{ fontWeight:900, fontSize:18, color:'#fff', marginBottom:5 }}>
          {role === 'customer' ? 'Sign in to order' : role === 'rider' ? 'Rider sign-in' : 'Store sign-in'}
        </div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,.4)', lineHeight:1.6 }}>
          {role === 'customer'
            ? 'Use your social account — takes 10 seconds'
            : role === 'rider'
            ? 'Sign in, then link your Rider ID'
            : 'Sign in, then verify your Store ID'}
        </div>
      </div>

      {err && <div style={{ color:'#EF4444', fontSize:12, marginBottom:10, textAlign:'center', fontWeight:600 }}>{err}</div>}

      {/* Google — primary CTA */}
      <OAuthBtn
        provider="google" primary
        label="Continue with Google"
        icon="🇬"
        loading={loading === 'google'}
        onClick={() => handleOAuth('google')}
      />
      {/* Facebook */}
      <OAuthBtn
        provider="facebook"
        label="Continue with Facebook"
        icon="📘"
        loading={loading === 'facebook'}
        onClick={() => handleOAuth('facebook')}
      />
      {/* X / Twitter */}
      <OAuthBtn
        provider="twitter"
        label="Continue with X"
        icon="✖"
        loading={loading === 'twitter'}
        onClick={() => handleOAuth('twitter')}
      />

      <div style={{ textAlign:'center', marginTop:8, fontSize:10, color:'rgba(255,255,255,.2)', lineHeight:1.8 }}>
        Your delivery info stays private.<br />No passwords stored.
      </div>
    </Wrap>
  );
}

// ── Rider ID link step ────────────────────────────────────────
function RiderIDStep({ rc, user, onSuccess, onBack }) {
  const { linkRiderId } = useAuth();
  const [riderId, setRiderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState('');

  return (
    <Wrap rc={rc} onBack={onBack}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <div style={{ width:40, height:40, borderRadius:12, background:`${rc.color}18`, border:`1px solid ${rc.color}28`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>🏍️</div>
        <div>
          <div style={{ fontWeight:800, fontSize:15, color:'#fff' }}>Link your Rider ID</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginTop:1 }}>Signed in as {user?.email || user?.user_metadata?.full_name || 'you'}</div>
        </div>
      </div>

      <div style={{ ...gl('ok'), borderRadius:11, padding:'10px 12px', marginBottom:14, fontSize:11, color:'rgba(255,255,255,.55)', lineHeight:1.7 }}>
        🔑 Demo: <strong style={{ color:'#22D47C' }}>{DEMO.rider.id}</strong>
      </div>

      <FI label="Your Rider ID" val={riderId} set={v => { setRiderId(v.toUpperCase()); setErr(''); }} ph="e.g. RD-00001" />

      {err && <div style={{ color:'#EF4444', fontSize:12, marginBottom:9, fontWeight:600 }}>{err}</div>}

      <Btn v="ok" full disabled={loading || !riderId.trim()} onClick={async () => {
        setLoading(true); setErr('');
        try {
          await linkRiderId(riderId.trim());
          onSuccess({});
        } catch (e) { setErr(e.message); }
        finally { setLoading(false); }
      }}>
        {loading ? 'Verifying…' : 'Link Rider ID & Enter →'}
      </Btn>
    </Wrap>
  );
}

// ── Store ID + passcode step ──────────────────────────────────
function StoreIDStep({ rc, user, onSuccess, onBack }) {
  const { verifyStorePasscode } = useAuth();
  const [storeId,  setStoreId]  = useState('');
  const [passcode, setPass]     = useState('');
  const [mode,     setMode]     = useState('att'); // att | admin
  const [scanDone, setScan]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState('');

  return (
    <Wrap rc={rc} onBack={onBack}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <div style={{ width:40, height:40, borderRadius:12, background:`${rc.color}18`, border:`1px solid ${rc.color}28`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>🏪</div>
        <div>
          <div style={{ fontWeight:800, fontSize:15, color:'#fff' }}>Verify your Store</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginTop:1 }}>Signed in as {user?.email || user?.user_metadata?.full_name || 'you'}</div>
        </div>
      </div>

      <div style={{ ...gl(), borderRadius:11, padding:'10px 12px', marginBottom:14, fontSize:11, color:'rgba(255,255,255,.5)', lineHeight:1.7 }}>
        🔑 Demo — Store ID: <strong style={{ color:'#F59E0B' }}>{DEMO.store.id}</strong> · Passcode: <strong style={{ color:'#F59E0B' }}>{DEMO.store.pass}</strong>
      </div>

      {/* Attendant / Admin toggle */}
      <div style={{ display:'flex', gap:6, marginBottom:14, background:'rgba(255,255,255,.04)', borderRadius:10, padding:4 }}>
        {[{ k:'att', l:'Attendant', i:'👤' }, { k:'admin', l:'Admin', i:'🛡️' }].map(o => (
          <div key={o.k} onClick={() => { setMode(o.k); setScan(false); setErr(''); setPass(''); }}
            style={{ flex:1, padding:'8px', borderRadius:8, background: mode === o.k ? 'linear-gradient(135deg,#C144D4,#8B30C9)' : 'transparent', cursor:'pointer', textAlign:'center', transition:'all .17s' }}>
            <div style={{ fontSize:16, marginBottom:2 }}>{o.i}</div>
            <div style={{ fontSize:10, fontWeight:700, color: mode === o.k ? '#fff' : 'rgba(255,255,255,.4)' }}>{o.l}</div>
          </div>
        ))}
      </div>

      <FI label="Store ID" val={storeId} set={v => { setStoreId(v.toUpperCase()); setErr(''); }} ph="e.g. ST-0001" />
      <FI label={mode === 'admin' ? 'Admin Passcode' : 'Store Passcode'} val={passcode} set={v => { setPass(v); setErr(''); }} ph="Enter passcode" type="password" />

      {mode === 'admin' && storeId.trim() && passcode.length >= 4 && !scanDone && (
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:9, color:'rgba(255,255,255,.4)', fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Admin Face Verification</div>
          <FaceScan color="#F59E0B" onDone={() => setScan(true)} />
        </div>
      )}
      {mode === 'admin' && scanDone && (
        <div style={{ background:'rgba(34,212,124,.08)', border:'1px solid rgba(34,212,124,.25)', borderRadius:12, padding:'12px', marginBottom:13, textAlign:'center' }}>
          <div style={{ fontSize:22, marginBottom:4 }}>🛡️</div>
          <div style={{ fontWeight:700, color:'#22D47C', fontSize:13 }}>Admin Identity Verified</div>
        </div>
      )}

      {err && <div style={{ color:'#EF4444', fontSize:12, marginBottom:9, fontWeight:600 }}>{err}</div>}

      <Btn v="warn" full
        disabled={loading || !storeId.trim() || passcode.length < 4 || (mode === 'admin' && !scanDone)}
        onClick={async () => {
          setLoading(true); setErr('');
          try {
            const valid = await verifyStorePasscode(storeId.trim(), passcode, mode === 'admin');
            if (!valid) throw new Error('Wrong Store ID or passcode. Try again.');
            onSuccess({ isAdmin: mode === 'admin' });
          } catch (e) { setErr(e.message); }
          finally { setLoading(false); }
        }}>
        {loading ? 'Verifying…' : mode === 'admin' ? '🛡️ Enter as Admin →' : 'Enter Store →'}
      </Btn>
    </Wrap>
  );
}

// ── Main AuthGate ─────────────────────────────────────────────
export default function AuthGate({ role, onSuccess, onBack }) {
  const rc = RC[role];
  const [step,       setStep]     = useState('social'); // social | link
  const [authedUser, setAuthedUser] = useState(null);
  const [showIDReq,  setIDReq]    = useState(false);

  const handleSignedIn = (user) => {
    setAuthedUser(user);
    // Customers: OAuth is enough — no extra linking step
    if (role === 'customer') {
      onSuccess({});
      return;
    }
    // Riders + Stores: proceed to link step
    setStep('link');
  };

  return (
    <>
      {showIDReq && <IDRequestModal type={role} onClose={() => setIDReq(false)} />}

      {step === 'social' && (
        <SocialSignIn rc={rc} role={role} onBack={onBack} onSignedIn={handleSignedIn} />
      )}

      {step === 'link' && role === 'rider' && (
        <RiderIDStep rc={rc} user={authedUser} onSuccess={onSuccess} onBack={() => setStep('social')} />
      )}

      {step === 'link' && role === 'store' && (
        <StoreIDStep rc={rc} user={authedUser} onSuccess={onSuccess} onBack={() => setStep('social')} />
      )}
    </>
  );
}

// ── Shared wrapper ────────────────────────────────────────────
function Wrap({ rc, onBack, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.96)', backdropFilter:'blur(28px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:20 }}>
      <style>{CSS}</style>
      <div style={{ background:'rgba(14,14,28,.98)', border:'1px solid rgba(255,255,255,.1)', borderRadius:24, padding:'26px 22px', width:'100%', maxWidth:380, maxHeight:'94vh', overflowY:'auto', boxShadow:'0 32px 80px rgba(0,0,0,.7)' }}>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,.4)', fontSize:12, fontFamily:'inherit', padding:'0 0 18px', transition:'color .15s' }}
          onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,.75)'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,.4)'}>
          ← Back
        </button>
        {children}
      </div>
    </div>
  );
}