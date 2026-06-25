<script lang="ts">
  import { onMount } from 'svelte';
import { signIn, user } from '@zaradrop/hooks';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';

  let email = '';
  let password = '';
  let error = '';
  let loading = false;

  onMount(() => {
    if (get(user)) {
      goto('/dashboard');
    }
  });

  async function handleSubmit() {
    error = '';
    loading = true;
    try {
      await signIn(email, password);
      goto('/dashboard');
    } catch (err) {
      error = err?.message ?? 'Unable to sign in. Please check your credentials.';
    } finally {
      loading = false;
    }
  }
</script>

<section class="login-shell">
  <Card>
    <h1>Customer Sign In</h1>
    <p>Sign in to place orders, track deliveries, and manage your profile.</p>

    {#if error}
      <div class="error">{error}</div>
    {/if}

    <form on:submit|preventDefault={handleSubmit}>
      <Input type="email" bind:value={email} label="Email" placeholder="name@example.com" required />
      <Input type="password" bind:value={password} label="Password" placeholder="Enter password" required />
      <Button variant="primary" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</Button>
    </form>
  </Card>
</section>

<style>
  .login-shell {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    background: linear-gradient(135deg, #070b19, #120f2f);
  }

  h1 {
    margin: 0 0 1rem;
  }

  .error {
    color: #ff6b6b;
    margin-bottom: 1rem;
  }

  form {
    display: grid;
    gap: 1rem;
    margin-top: 1.25rem;
  }
</style>
