import { supabase } from '@zaradrop/lib';
import { writable } from 'svelte/store';
import type { User } from '@supabase/supabase-js';

export const user = writable<User | null>(null);
export const authLoading = writable<boolean>(true);

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  user.set(data.user);
  return data.user;
}

export async function signOut() {
  await supabase.auth.signOut();
  user.set(null);
}

export async function initAuth() {
  const { data } = await supabase.auth.getSession();
  user.set(data.session?.user ?? null);
  authLoading.set(false);
}
