import React, { useState, useEffect, useCallback } from 'react';
import { CSS, C } from './constants';
import { useAuth }          from './hooks/useAuth';
import { useWallet }        from './hooks/useWallet';
import { useChat }          from './hooks/useChat';
import { useNotifications } from './hooks/useNotifications';
import { useStore }         from './hooks/useStore';
import { useRider }         from './hooks/useRider';
import { subscribeToPush }  from './lib/pushNotifications';
import RoleSelector     from './components/RoleSelector';
import AuthGate         from './components/AuthGate';
import AppShell         from './components/AppShell';
import AttendantCheckIn from './components/AttendantCheckIn';
import CustomerApp      from './components/CustomerApp';
import RiderApp         from './components/RiderApp';
import StoreApp         from './components/StoreApp';
import { ToastContainer } from './components/Toast';

function LoadingScreen() {
  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <style>{CSS}</style>
      <div style={{ width:64, height:64, borderRadius:20, background:'linear-gradient(135deg,#FF6B35,#C144D4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, marginBottom:20, boxShadow:'0 12px 40px rgba(193,68,212,.4)', animation:'shimmer 1.5s ease-in-out infinite' }}>⚡</div>
      <div style={{ color:'rgba(255,255,255,.3)', fontSize:12, letterSpacing:2, textTransform:'uppercase' }}>Loading ZaraDrop…</div>
    </div>
  );
}

export default function App() {
  const { user, profile, loading: authLoading, signOut } = useAuth();

  const [pendingRole,       setPendingRole]      = useState(null);
  const [activeRole,        setActiveRole]       = useState(null);
  const [tab,               setTab]              = useState(0);
  const [isMobile,          setMobile]           = useState(window.innerWidth < 768);
  const [currentAttendant,  setCurrentAttendant] = useState(null);
  const [isStoreAdmin,      setIsStoreAdmin]     = useState(false);
  const [showCheckIn,       setShowCheckIn]      = useState(false);
  const [showChat,          setShowChat]         = useState(false);
  const [showNotif,         setShowNotif]        = useState(false);
  const [chatJump,          setChatJump]         = useState(null);

  // Responsive
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  // ── OAuth redirect handler ─────────────────────────────────
  // After Google/Facebook/X redirects back, Supabase restores the
  // session. We read the intended role from sessionStorage.
  useEffect(() => {
    if (!authLoading && user) {
      const savedRole = sessionStorage.getItem('zaradrop_pending_role');
      if (savedRole && !activeRole) {
        sessionStorage.removeItem('zaradrop_pending_role');
        // If profile exists with a role, use that; otherwise use saved role
        const resolvedRole = profile?.role || savedRole;
        setActiveRole(resolvedRole);
        setPendingRole(null);
      } else if (profile?.role && !activeRole && !pendingRole) {
        setActiveRole(profile.role);
      }
    }
    if (!authLoading && !user) {
      setLoading_internal(false);
    }
  }, [authLoading, user, profile]);

  // eslint-disable-next-line no-unused-vars
  const [, setLoading_internal] = useState(true);

  // Resolve active role from profile
  useEffect(() => {
    if (!authLoading && user && profile?.role && !activeRole && !pendingRole) {
      setActiveRole(profile.role);
    }
  }, [authLoading, user, profile, activeRole, pendingRole]);

  // Store: attendant check-in
  useEffect(() => {
    if (activeRole === 'store' && !currentAttendant) {
      if (isStoreAdmin) {
        setCurrentAttendant({ id:'admin', name:'Store Admin', role:'Admin', color:'#F59E0B' });
      } else {
        setShowCheckIn(true);
      }
    }
  }, [activeRole, isStoreAdmin]);

  // Push subscription on login
  useEffect(() => {
    if (user?.id) subscribeToPush(user.id).catch(() => {});
  }, [user?.id]);

  // Live hooks
  const wallet    = useWallet(user?.id);
  const chat      = useChat(user?.id);
  const notifs    = useNotifications(user?.id);
  const storeHook = useStore(activeRole === 'store' ? user?.id : null);
  const riderHook = useRider(activeRole === 'rider' ? user?.id : null);

  const handleRoleSelect = useCallback((role) => {
    // If already signed in and profile has this role, go straight in
    if (user && profile?.role === role) { setActiveRole(role); setTab(0); return; }
    // If signed in but no profile yet, go to linking step in AuthGate
    if (user && !profile?.role) {
      sessionStorage.setItem('zaradrop_pending_role', role);
      setPendingRole(role);
      return;
    }
    // Not signed in — go to AuthGate
    setPendingRole(role);
  }, [user, profile]);

  const handleAuthSuccess = useCallback((opts = {}) => {
    setIsStoreAdmin(!!opts.isAdmin);
    const role = pendingRole || sessionStorage.getItem('zaradrop_pending_role') || 'customer';
    setActiveRole(role);
    setPendingRole(null);
    sessionStorage.removeItem('zaradrop_pending_role');
    setTab(0); setShowChat(false); setShowNotif(false);
  }, [pendingRole]);

  const openChat = useCallback((convId) => {
    setChatJump(convId); setShowChat(true); setShowNotif(false);
  }, []);

  // ── Loading splash ─────────────────────────────────────────
  if (authLoading) return <LoadingScreen />;

  // ── No role yet → landing ──────────────────────────────────
  if (!activeRole && !pendingRole) return (
    <>
      <ToastContainer toasts={notifs.toasts} onDismiss={notifs.dismissToast} />
      <RoleSelector onSelect={handleRoleSelect} />
    </>
  );

  // ── Auth gate ──────────────────────────────────────────────
  if (pendingRole) return (
    <>
      <style>{CSS}</style>
      <ToastContainer toasts={notifs.toasts} onDismiss={notifs.dismissToast} />
      <AuthGate
        role={pendingRole}
        onSuccess={handleAuthSuccess}
        onBack={() => setPendingRole(null)}
      />
    </>
  );

  const commonProps = { isMobile, user, profile, wallet, chat, openChat, notifs, signOut };

  return (
    <>
      <ToastContainer toasts={notifs.toasts} onDismiss={notifs.dismissToast} position="top-right" />

      {activeRole === 'store' && showCheckIn && (
        <AttendantCheckIn storeHook={storeHook}
          onCheckedIn={(att) => {
            setCurrentAttendant(att);
            storeHook.recordAttendantSession?.(att.id);
            setShowCheckIn(false);
          }} />
      )}

      <AppShell
        role={activeRole} tab={tab} setTab={setTab}
        chat={chat} notifs={notifs}
        showChat={showChat} setShowChat={setShowChat}
        showNotif={showNotif} setShowNotif={setShowNotif}
        chatJump={chatJump} setChatJump={setChatJump}
        onRoleSelect={handleRoleSelect}
        isMobile={isMobile} userId={user?.id}
      >
        {activeRole === 'customer' && <CustomerApp tab={tab} {...commonProps} />}
        {activeRole === 'rider'    && <RiderApp    tab={tab} {...commonProps} riderHook={riderHook} />}
        {activeRole === 'store'    && <StoreApp    tab={tab} {...commonProps} storeHook={storeHook} currentAttendant={currentAttendant} isStoreAdmin={isStoreAdmin} />}
      </AppShell>
    </>
  );
}