<script lang="ts">
  import { Button, Card } from '@zaradrop/ui';
  import { goto } from '$app/navigation';
</script>

<section class="hero">
  <div class="panel">
    <p class="eyebrow">Rider Portal</p>
    <h1>Deliver faster with routes, earnings, and live dispatch.</h1>
    <p>Access rider assignments, status controls, and real-time route updates for every shift.</p>
    <div class="actions">
      <Button variant="primary" on:click={() => goto('/availability')}>Start Shift</Button>
      <Button variant="secondary" on:click={() => goto('/availability')}>View Dashboard</Button>
    </div>
  </div>
  <div class="grid">
    <Card>
      <h2>Shift readiness</h2>
      <p>Set availability, confirm identity, and join approved driver teams instantly.</p>
    </Card>
    <Card>
      <h2>Live tasks</h2>
      <p>Track queued pickups, optimize routes, and receive high-priority deliveries.</p>
    </Card>
    <Card>
      <h2>Secure payouts</h2>
      <p>Review earnings and withdrawals through verified bank or wallet settlement.</p>
    </Card>
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
    background: radial-gradient(circle at top, rgba(29, 78, 216, 0.18), transparent 40%), linear-gradient(180deg, #020406, #080a13 85%);
  }
  .panel {
    max-width: 760px;
    width: 100%;
    padding: 2.5rem;
    border-radius: 28px;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.08);
    box-shadow: 0 32px 90px rgba(0,0,0,.2);
    backdrop-filter: blur(20px);
  }
  .eyebrow {
    color: var(--zd-accent);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.85rem;
    margin-bottom: 1rem;
  }
  h1 {
    font-size: min(3rem, 6vw);
    margin-bottom: 1rem;
  }
  p {
    opacity: 0.85;
    line-height: 1.9;
    max-width: 640px;
  }
  .actions {
    margin-top: 2rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .grid {
    display: grid;
    gap: 1.2rem;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    width: 100%;
  }
  h2 { margin-bottom: 0.75rem; }
</style>
