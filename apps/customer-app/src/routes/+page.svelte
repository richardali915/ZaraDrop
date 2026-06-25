<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Card, Badge } from '@zaradrop/ui';
  import { goto } from '$app/navigation';
  let loaded = false;

  onMount(() => {
    setTimeout(() => (loaded = true), 200);
  });
</script>

<section class="hero">
  <div class="panel">
    <div class="eyebrow">ZaraDrop Customer Portal</div>
    <h1>Seamless delivery with enterprise-grade speed.</h1>
    <p>Order, track, and manage deliveries across Abuja with real-time updates and premium customer experience.</p>
    <div class="actions">
      <Button variant="primary" on:click={() => goto('/login')}>Start Order</Button>
      <Button variant="secondary" on:click={() => goto('/dashboard')}>My Dashboard</Button>
    </div>
  </div>
  <div class="feature-grid">
    <Card>
      <h2>Live tracking</h2>
      <p>Follow your package from merchant pickup to doorstep delivery in real time.</p>
    </Card>
    <Card>
      <h2>Verified riders</h2>
      <p>Each rider is authenticated and approved before they accept your delivery.</p>
    </Card>
    <Card>
      <h2>Smart routing</h2>
      <p>Intelligent dispatch lowers wait times and keeps every delivery on schedule.</p>
    </Card>
  </div>
  {#if loaded}
    <div class="status-bar">
      <Badge>Verified merchants</Badge>
      <Badge>24/7 support</Badge>
      <Badge>Instant payments</Badge>
    </div>
  {/if}
</section>

<style>
  .hero {
    min-height: 100vh;
    display: grid;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    padding: 4rem 1.5rem;
    background: linear-gradient(135deg, #0a0018, #10042f);
  }
  .panel {
    max-width: 820px;
    width: 100%;
    border-radius: 30px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.18);
    backdrop-filter: blur(24px);
    padding: 3rem;
  }
  .eyebrow {
    color: var(--zd-accent);
    font-size: 0.95rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 1rem;
  }
  h1 {
    font-size: min(3.6rem, 7vw);
    margin-bottom: 1rem;
    line-height: 1.02;
  }
  p {
    opacity: 0.84;
    font-size: 1.05rem;
    line-height: 1.9;
    max-width: 720px;
  }
  .actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 2rem;
  }
  .feature-grid {
    display: grid;
    gap: 1.2rem;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
  .status-bar {
    display: flex;
    gap: 0.8rem;
    flex-wrap: wrap;
    margin-top: 1.5rem;
  }
  h2 {
    margin: 0 0 0.75rem;
  }
  card {
    display: block;
  }
</style>
