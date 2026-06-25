import { get } from 'svelte/store';
import { user, initAuth } from './useAuth';
import type { User } from '@supabase/supabase-js';

export async function requireAuth() {
  await initAuth();
  const sessionUser: User | null = get(user);
  return sessionUser;
}
