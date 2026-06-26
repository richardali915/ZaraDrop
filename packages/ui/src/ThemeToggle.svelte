<script lang="ts">
  import { theme, toggleTheme } from '@zaradrop/hooks';
</script>

<button class="theme-toggle" type="button" on:click={toggleTheme} aria-label="Toggle theme">
  {#if $theme === 'dark'}
    <span>☀️</span>
    <span>Light mode</span>
  {:else}
    <span>🌙</span>
    <span>Dark mode</span>
  {/if}
</button>

<style>
  .theme-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    border-radius: 999px;
    border: 1px solid var(--zd-border);
    background: var(--zd-surface);
    color: var(--zd-text);
    padding: 0.8rem 1rem;
    font-weight: 700;
    font-size: 0.92rem;
    box-shadow: var(--zd-shadow);
    transition: transform 0.18s ease, background 0.25s ease, border-color 0.25s ease, color 0.25s ease;
  }

  .theme-toggle:hover {
    transform: translateY(-1px);
    background: var(--zd-surface-hover);
  }

  .theme-toggle span:first-child {
    font-size: 1rem;
    display: inline-flex;
  }
</style>
