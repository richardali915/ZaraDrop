import { writable } from 'svelte/store';
import { supabase } from '@zaradrop/lib';
export const user = writable(null);
export const authLoading = writable(true);
export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error)
        throw error;
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
