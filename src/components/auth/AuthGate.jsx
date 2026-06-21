// src/components/AuthGate.jsx
// Full OAuth auth flow (Google, Facebook, X/Twitter).
// - Customers: sign in → done
// - Riders: sign in → enter Rider ID to link profile
// - Stores: sign in → enter Store ID + passcode → face scan (admin only)

import React, { useState, useEffect } from 'react';
import { ArrowRight, Globe, LogIn, ShieldCheck, Store, Truck, Users } from 'lucide-react';
import { C, G, GZ, CSS, DEMO } from '../../constants';
import { gl } from '../../utils';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { RC } from '../../data';
import { Back, FI, Btn } from '../shared/Micro';
import FaceScan from './FaceScan';
import IDRequestModal from './IDRequestModal';

// ── Provider button ───────────────────────────────────────────
function OAuthBtn({ provider, label, icon: Icon, primary, onClick, loading }) {
  const [hov, setHov] = useState(false);
  const color = provider === 'google' ? '#4285F4' : provider === 'facebook' ? '#4267B2' : '#1DA1F2';
  const bg = primary
    ? (hov ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.08)')
    : (hov ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.04)');

  return (
    <button
      disabled={loading}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        width:'100%', padding: primary ? '14px 18px' : '12px 18px',
        borderRadius:16, background:bg,
        border:`1px solid ${primary ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.12)'}`,
        cursor:loading ? 'not-allowed' : 'pointer', fontFamily:'inherit',
        display:'flex', alignItems:'center', justifyContent:'center', gap:14,
        transition:'all .18s', marginBottom:12,
        boxShadow: primary && hov ? '0 20px 36px rgba(0,0,0,.2)' : 'none',
        opacity: loading ? .7 : 1,
      }}>
      <span style={{ width:30, height:30, display:'inline-flex', alignItems:'center', justifyContent:'center', borderRadius:12, background:'rgba(255,255,255,.08)', color, flexShrink:0 }}>
        <Icon size={18} />
      </span>
      <span style={{ fontSize:14, fontWeight: primary ? 700 : 600, color: primary ? '#fff' : 'rgba(255,255,255,.82)' }}>
        {loading ? 'Redirecting…' : label}
      </span>
      {primary && <ArrowRight size={16} style={{ marginLeft:4, opacity: loading ? .4 : 1 }} />}
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
      <div style={{ paddingBottom:22, marginBottom:22, borderBottom:'1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
            <div style={{ width:52, height:52, borderRadius:18, background:`${roleColor}18`, border:`1px solid ${roleColor}28`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, color:roleColor, flexShrink:0 }}>
              {rc.icon}
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontWeight:900, fontSize:20, color:'#fff', marginBottom:4, lineHeight:1.1 }}>
                {role === 'customer' ? 'Order fast, sign in faster' : role === 'rider' ? 'Rider sign-in' : 'Store sign-in'}
              </div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,.6)', lineHeight:1.6 }}>
                {role === 'customer'
                  ? 'Use one tap social login to access ZaraDrop.'
                  : role === 'rider'
                  ? 'Authenticate, then connect your Rider ID to accept deliveries.'
                  : 'Authenticate, then verify your Store access with ID + passcode.'}
              </div>
            </div>
          </div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:14, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', color:'rgba(255,255,255,.7)', fontSize:12 }}>
            <ShieldCheck size={16} />
            Secure login
          </div>
        </div>
      </div>

      {err && <div style={{ color:'#EF4444', fontSize:13, marginBottom:14, textAlign:'center', fontWeight:700 }}>{err}</div>}

      <OAuthBtn
        provider="google" primary
        label="Continue with Google"
        icon={Globe}
        loading={loading === 'google'}
        onClick={() => handleOAuth('google')}
      />
      <OAuthBtn
        provider="facebook"
        label="Continue with Facebook"
        icon={Users}
        loading={loading === 'facebook'}
        onClick={() => handleOAuth('facebook')}
      />
      <OAuthBtn
        provider="twitter"
        label="Continue with X"
        icon={LogIn}
        loading={loading === 'twitter'}
        onClick={() => handleOAuth('twitter')}
      />

      <div style={{ textAlign:'center', marginTop:12, fontSize:11, color:'rgba(255,255,255,.45)', lineHeight:1.8 }}>
        Your delivery info stays private. No passwords are stored.
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
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
        <div style={{ width:44, height:44, borderRadius:14, background:`${rc.color}18`, border:`1px solid ${rc.color}28`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
          <Truck size={20} color={rc.color} />
        </div>
        <div>
          <div style={{ fontWeight:800, fontSize:16, color:'#fff' }}>Link your Rider ID</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,.55)', marginTop:2 }}>Signed in as {user?.email || user?.user_metadata?.full_name || 'you'}</div>
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
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
        <div style={{ width:44, height:44, borderRadius:14, background:`${rc.color}18`, border:`1px solid ${rc.color}28`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
          <Store size={20} color={rc.color} />
        </div>
        <div>
          <div style={{ fontWeight:800, fontSize:16, color:'#fff' }}>Verify your Store</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,.55)', marginTop:2 }}>Signed in as {user?.email || user?.user_metadata?.full_name || 'you'}</div>
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
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.92)', backdropFilter:'blur(22px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:20 }}>
      <style>{CSS}</style>
      <div style={{ background:'rgba(10,10,24,.98)', border:'1px solid rgba(255,255,255,.08)', borderRadius:28, padding:'28px 26px', width:'100%', maxWidth:460, maxHeight:'94vh', overflowY:'auto', boxShadow:'0 32px 90px rgba(0,0,0,.65)' }}>
        <button onClick={onBack} style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.08)', borderRadius:14, color:'rgba(255,255,255,.72)', fontSize:13, fontFamily:'inherit', padding:'10px 14px', cursor:'pointer', transition:'all .16s', marginBottom:18 }}
          onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,.75)'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,.4)'}>
          ← Back
        </button>
        {children}
      </div>
    </div>
  );
}