// src/lib/supabase.js
// Works with Create React App (process.env.REACT_APP_*)
// NOT Vite (which uses import.meta.env.VITE_*)

import { createClient } from '@supabase/supabase-js';

// CRA exposes env vars as process.env.REACT_APP_*
// Your .env file must have:
//   REACT_APP_SUPABASE_URL=https://xxxx.supabase.co
//   REACT_APP_SUPABASE_ANON_KEY=eyJ...
const SUPABASE_URL  = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error(
    'Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY.\n' +
    'Create a .env file in your project root with those values.\n' +
    'Get them from: Supabase Dashboard → Project Settings → API'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession:    true,
    autoRefreshToken:  true,
    detectSessionInUrl:true,
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});

// ── Edge function caller ─────────────────────────────────────
export async function callFn(name, payload) {
  const { data, error } = await supabase.functions.invoke(name, { body: payload });
  if (error) throw new Error(error.message || 'Edge function error');
  return data;
}

// ── Storage helpers ──────────────────────────────────────────
export async function uploadAvatar(userId, file) {
  const ext  = file.name.split('.').pop();
  const path = `avatars/${userId}.${ext}`;
  const { error } = await supabase.storage.from('profiles').upload(path, file, { upsert: true });
  if (error) throw error;
  return supabase.storage.from('profiles').getPublicUrl(path).data.publicUrl;
}

export async function uploadChatImage(convId, file) {
  const path = `chat/${convId}/${Date.now()}.${file.name.split('.').pop()}`;
  const { error } = await supabase.storage.from('chat-media').upload(path, file, { upsert: false });
  if (error) throw error;
  return supabase.storage.from('chat-media').getPublicUrl(path).data.publicUrl;
}

// ── Kobo ↔ Naira helpers ─────────────────────────────────────
export const toKobo   = (naira) => Math.round(naira * 100);
export const toNaira  = (kobo)  => kobo / 100;
export const fmtNaira = (kobo)  => `₦${(kobo / 100).toLocaleString('en-NG')}`;

// ── Date helpers ─────────────────────────────────────────────
export const today = () => new Date().toISOString().split('T')[0];