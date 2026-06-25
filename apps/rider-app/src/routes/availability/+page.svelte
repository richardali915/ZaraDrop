<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Card } from '@zaradrop/ui';
  import { requireAuth, riderJobs, orderLoading, loadRiderJobs, acceptRiderJob } from '@zaradrop/hooks';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';

  let availability = 'offline';
  let lastLocation = 'Abuja Central';
  let currentUser = null;
  let actionError = '';

  function toggleAvailability() {
    availability = availability === 'offline' ? 'online' : 'offline';
  }

  onMount(async () => {
    const active = await requireAuth();
    if (!active) {
      goto('/login');
      return;
    }

    currentUser = active;
    await loadRiderJobs();
  });

  async function acceptJob(orderId: string) {
    actionError = '';
    try {
      await acceptRiderJob(orderId);
    } catch (err) {
      actionError = err?.message ?? 'Unable to accept the delivery job.';
    }
  }
</script>

<section class="availability-page">
  <div class="header">
    <span class="eyebrow">Rider dashboard</span>
    <h1>Set availability and accept deliveries in real time.</h1>
    <p>Rider access is approved only after your identity is verified and your profile is active.</p>
  </div>

  <div class="status-panel">
    <Card>
      <h2>Current status</h2>
      <p>{availability === 'online' ? 'Available for pickups' : 'Currently offline'}</p>
      <Button variant="primary" on:click={toggleAvailability}>{availability === 'online' ? 'Go Offline' : 'Go Online'}</Button>
    </Card>
    <Card>
      <h2>Location</h2>
      <p>{lastLocation}</p>
    </Card>
  </div>

  {#if actionError}
    <div class="error-banner">{actionError}</div>
  {/if}

  <div class="job-board">
    <div class="board-header">
      <h2>Available delivery jobs</h2>
      <span>{get(orderLoading) ? 'Refreshing…' : `${get(riderJobs).length} open jobs`}</span>
    </div>

    {#if get(riderJobs).length === 0}
      <div class="empty-state">No live jobs in the queue right now. Check back once riders are active.</div>
    {/if}

    {#each $riderJobs as job}
      <Card>
        <div class="job-row">
          <div>
            <h3>Order {job.order_code ?? job.id}</h3>
            <p>Amount • ₦{(job.total / 100).toLocaleString()}</p>
            <p class="meta">Status: {job.status} • Placed {job.created_at ? new Date(job.created_at).toLocaleTimeString() : 'just now'}</p>
          </div>
          <Button variant="success" on:click={() => acceptJob(job.id)} disabled={availability === 'offline' || job.status !== 'ready'}>Accept job</Button>
        </div>
      </Card>
    {/each}
  </div>
</section>

<style>
  .availability-page {
    min-height: 100vh;
    padding: 3rem;
    background: linear-gradient(135deg, #06101a, #101f39);
    color: white;
  }

  .header {
    max-width: 860px;
    margin-bottom: 2rem;
  }

  .status-panel {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    margin-bottom: 1.5rem;
  }

  .error-banner,
  .empty-state {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 22px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .job-board {
    display: grid;
    gap: 1rem;
  }

  .board-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .job-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
  }

  .meta {
    color: rgba(255,255,255,0.7);
    margin-top: 0.45rem;
  }
</style>
