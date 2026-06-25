<script lang="ts">
  export let open = false;
  export let title = '';
  export let close: () => void;
</script>

{#if open}
  <div class="overlay" on:click={close}>
    <div class="dialog" on:click|stopPropagation>
      <div class="header">
        <h2>{title}</h2>
        <button class="close" on:click={close} aria-label="Close">×</button>
      </div>
      <div class="body"><slot /></div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(4, 8, 18, 0.75);
    display: grid;
    place-items: center;
    z-index: 60;
  }
  .dialog {
    width: min(92vw, 560px);
    border-radius: 28px;
    padding: 1.5rem;
    background: rgba(7, 13, 29, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(24px);
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .close {
    border: none;
    background: transparent;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
  }
  .body { gap: 1rem; display: grid; }
</style>
