<script lang="ts">
  import { Button, Card, Badge } from '@zaradrop/ui';
  import { goto } from '$app/navigation';
</script>

<section class="hero">
  <div class="panel">
    <span class="eyebrow">Merchant HQ</span>
    <h1>Run inventory, orders, and rider dispatch from one secure dashboard.</h1>
    <p>Approve seller access, manage order flow, and get real-time merchant commerce insights.</p>
    <div class="actions">
      <Button variant="primary" on:click={() => goto('/requests')}>View Orders</Button>
      <Button variant="secondary" on:click={() => goto('/requests')}>Manage Store</Button>
    </div>
  </div>
  <div class="feature-grid">
    <Card>
      <h2>Order approval</h2>
      <p>Confirm pick-up, schedule dispatch, and communicate with riders instantly.</p>
    </Card>
    <Card>
      <h2>Merchant performance</h2>
      <p>Track revenue, fulfillment times, and loyalty metrics from every store.</p>
    </Card>
    <Card>
      <h2>Store verification</h2>
      <p>Only approved merchants receive order routing and premium rider coverage.</p>
    </Card>
  </div>
  <div class="badge-row">
    <Badge>Fast payouts</Badge>
    <Badge>Verified stores</Badge>
    <Badge>Seamless inventory</Badge>
  </div>
</section>

<style>
  .hero {
    min-height: 100vh;
    display: grid;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    padding: 4rem 1.5rem;
    background: radial-gradient(circle at top, rgba(16, 185, 129, 0.16), transparent 40%), linear-gradient(180deg, #020509, #090c14 85%);
  }
  .panel {
    max-width: 820px;
    width: 100%;
    padding: 2.75rem;
    border-radius: 30px;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.08);
    box-shadow: 0 32px 100px rgba(0,0,0,.2);
    backdrop-filter: blur(24px);
  }
  .eyebrow {
    color: var(--zd-accent);
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-size: 0.85rem;
    margin-bottom: 1rem;
    display: inline-flex;
  }
  h1 {
    font-size: min(3.3rem, 7vw);
    margin-bottom: 1rem;
    line-height: 1.05;
  }
  p {
    opacity: 0.84;
    line-height: 1.9;
    max-width: 680px;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 2rem;
  }
  .feature-grid {
    display: grid;
    gap: 1.2rem;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    width: 100%;
  }
  .badge-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin-top: 1.5rem;
  }
</style>
