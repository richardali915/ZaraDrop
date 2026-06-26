import { get } from 'svelte/store';
import { user, initAuth } from './useAuth';
export async function requireAuth() {
    await initAuth();
    const sessionUser = get(user);
    return sessionUser;
}
