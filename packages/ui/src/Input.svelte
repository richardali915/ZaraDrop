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
    gap: 0.45rem;
    font-size: 0.9rem;
    color: white;
  }
  input {
    width: 100%;
    padding: 1rem 1.1rem;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,.12);
    background: rgba(255,255,255,.06);
    color: white;
    outline: none;
  }
  input:focus {
    border-color: rgba(193,68,212,.75);
    box-shadow: 0 0 0 3px rgba(193,68,212,.1);
  }
</style>
