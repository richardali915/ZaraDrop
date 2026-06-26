<script lang="ts">
  import { onMount } from 'svelte';
  import { initTheme } from '@zaradrop/hooks';
  import ThemeToggle from '@zaradrop/ui/ThemeToggle.svelte';
  export let data;

  onMount(() => {
    initTheme();
  });
</script>

<div class="app-shell">
  <div class="theme-panel">
    <ThemeToggle />
  </div>
  <slot />
</div>

<style>
  .app-shell {
    min-height: 100vh;
    position: relative;
  }
  .theme-panel {
    position: fixed;
    right: 1.25rem;
    top: 1.2rem;
    z-index: 90;
  }
</style>
