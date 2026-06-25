<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Card } from '@zaradrop/ui';
  import { requireAuth } from '@zaradrop/hooks';
  import { goto } from '$app/navigation';

  let approvals = [
    { id: 'store-123', type: 'merchant', name: 'Bella Foods', status: 'pending', requested: '10 minutes ago', details: 'Merchant onboarding approval' },
    { id: 'rider-842', type: 'rider', name: 'Chinedu A.', status: 'pending', requested: '25 minutes ago', details: 'Rider identity verification' },
    { id: 'order-978', type: 'order', name: 'Order #978', status: 'pending', requested: '1 hour ago', details: 'High-value delivery requires approval' }
  ];

  let actionError = '';

  onMount(async () => {
    const active = await requireAuth();
    if (!active) {
      goto('/login');
    }
  });

  function approve(item) {
    item.status = 'approved';
    item.details = item.type === 'order' ? 'Order is approved for routing.' : 'Request approved.';
  }

  function reject(item) {
    item.status = 'rejected';
    item.details = item.type === 'order' ? 'Order requires manual review.' : 'Request rejected.';
  }
</script>

<section class="approvals-page">
  <div class="header">
    <span class="eyebrow">Admin Operations</span>
    <h1>Review pending approvals</h1>
    <p>Approve merchants, riders, and orders before they enter the delivery network.</p>
  </div>

  {#if actionError}
    <div class="error-banner">{actionError}</div>
  {/if}

  <div class="approval-list">
    {#each approvals as item}
      <Card>
        <div class="row">
          <div>
            <h3>{item.name}</h3>
            <p class="meta">{item.type} request • {item.requested}</p>
          </div>
          <div class="status {item.status}">{item.status}</div>
        </div>
        <p class="details">{item.details}</p>
        <div class="actions">
          <Button variant="success" on:click={() => approve(item)} disabled={item.status !== 'pending'}>Approve</Button>
          <Button variant="danger" on:click={() => reject(item)} disabled={item.status !== 'pending'}>Reject</Button>
        </div>
      </Card>
    {/each}
  </div>
</section>

<style>
  .approvals-page {
    padding: 3rem;
    min-height: 100vh;
    background: linear-gradient(135deg, #080a1d, #131a36);
    color: white;
  }

  .header {
    max-width: 860px;
    margin-bottom: 2rem;
  }

  .meta {
    color: #b9b9d1;
  }

  .details {
    margin-top: 1rem;
    color: rgba(255,255,255,0.8);
  }

  .approval-list {
    display: grid;
    gap: 1rem;
  }

  .row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
  }

  .status {
    border-radius: 999px;
    padding: 0.55rem 1rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .status.pending {
    background: rgba(255, 184, 0, 0.16);
    color: #ffd166;
  }

  .status.approved {
    background: rgba(72, 187, 120, 0.16);
    color: #61ffb9;
  }

  .status.rejected {
    background: rgba(255, 98, 98, 0.16);
    color: #ff7b7b;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  .error-banner {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 20px;
    padding: 1rem;
    margin-bottom: 1rem;
  }
</style>
