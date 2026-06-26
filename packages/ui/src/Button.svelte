<script lang="ts">
  export let type = 'button';
  export let variant: 'primary' | 'secondary' | 'ghost' = 'primary';
</script>

<button class={variant} type={type}>
  <slot />
</button>

<style>
  button {
    border: none;
    border-radius: 18px;
    font-weight: 700;
    padding: 0.95rem 1.45rem;
    min-height: 48px;
    transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.25s ease;
    box-shadow: var(--zd-shadow);
    letter-spacing: 0.01em;
    white-space: nowrap;
  }
  button:hover {
    transform: translateY(-1px);
  }
  .primary {
    background: var(--zd-button-primary);
    color: var(--zd-button-primary-text);
    box-shadow: 0 18px 45px rgba(139, 48, 201, 0.18);
  }
  .secondary {
    background: var(--zd-button-secondary);
    color: var(--zd-text);
    border: 1px solid var(--zd-border);
  }
  .ghost {
    background: transparent;
    color: var(--zd-text);
    border: 1px solid var(--zd-border);
  }
</style>
