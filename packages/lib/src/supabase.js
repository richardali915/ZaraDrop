// Shared supabase client for all apps (Vite-friendly)
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = process.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON = process.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY (or REACT_APP_ equivalents).\n' +
    'Create a .env file with those values or set them in your CI/deploy system.'
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

export async function callFn(name, payload) {
  const { data, error } = await supabase.functions.invoke(name, { body: payload });
  if (error) throw new Error(error.message || 'Edge function error');
  return data;
}

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

export const toKobo   = (naira) => Math.round(naira * 100);
export const toNaira  = (kobo)  => kobo / 100;
export const fmtNaira = (kobo)  => `₦${(kobo / 100).toLocaleString('en-NG')}`;

export const today = () => new Date().toISOString().split('T')[0];
