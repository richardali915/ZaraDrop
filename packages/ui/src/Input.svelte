<script lang="ts">
  export let label = '';
  export let type = 'text';
  export let value = '';
  export let placeholder = '';
  export let id = '';
  export let onInput: (event: Event) => void;
</script>

<label class="field">
  {#if label}<span>{label}</span>{/if}
  <input id={id} type={type} bind:value on:input={onInput} placeholder={placeholder} />
</label>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    font-size: 0.95rem;
    color: var(--zd-text);
  }
  span {
    color: var(--zd-text-dim);
    font-size: 0.85rem;
  }
  input {
    width: 100%;
    border-radius: 18px;
    border: 1px solid var(--zd-input-border);
    background: var(--zd-input);
    color: var(--zd-text);
    padding: 1rem 1.1rem;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }
  input:focus {
    border-color: var(--zd-input-focus);
    box-shadow: 0 0 0 3px var(--zd-input-focus);
  }
</style>
