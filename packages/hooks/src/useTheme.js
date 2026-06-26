import { writable } from 'svelte/store';
const isBrowser = typeof window !== 'undefined';
const modeFromSystem = () => isBrowser && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const initialTheme = isBrowser
    ? window.localStorage.getItem('zd-theme') ?? modeFromSystem()
    : 'dark';
export const theme = writable(initialTheme);
export function initTheme() {
    if (!isBrowser)
        return;
    const savedTheme = window.localStorage.getItem('zd-theme');
    const nextTheme = savedTheme || modeFromSystem();
    document.documentElement.dataset.zdTheme = nextTheme;
    theme.set(nextTheme);
}
export function setTheme(value) {
    if (isBrowser) {
        window.localStorage.setItem('zd-theme', value);
        document.documentElement.dataset.zdTheme = value;
    }
    theme.set(value);
}
export function toggleTheme() {
    theme.update((current) => {
        const next = current === 'dark' ? 'light' : 'dark';
        setTheme(next);
        return next;
    });
}
