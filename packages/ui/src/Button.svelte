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
    border-radius: 14px;
    font-weight: 700;
    padding: 0.95rem 1.4rem;
    transition: transform 0.18s ease, filter 0.18s ease;
  }
  button:hover {
    transform: translateY(-1px);
    filter: brightness(1.05);
  }
  .primary {
    background: linear-gradient(135deg, #c144d4, #ff6b35);
    color: white;
  }
  .secondary {
    background: rgba(255,255,255,.08);
    color: white;
    border: 1px solid rgba(255,255,255,.12);
  }
  .ghost {
    background: transparent;
    color: white;
    border: 1px solid rgba(255,255,255,.14);
  }
</style>
