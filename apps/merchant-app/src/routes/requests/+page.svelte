<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Card } from '@zaradrop/ui';
  import { requireAuth, merchantRequests, orderLoading, loadMerchantRequests, approveMerchantOrder, declineMerchantOrder } from '@zaradrop/hooks';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';

  let currentUser = null;
  let actionError = '';
  let storeId = 'store_1';

  onMount(async () => {
    const active = await requireAuth();
    if (!active) {
      goto('/login');
      return;
    }

    currentUser = active;
    storeId = active.id || 'store_1';
    await loadMerchantRequests(storeId);
  });

  async function accept(item) {
    actionError = '';
    try {
      await approveMerchantOrder(item.id, storeId);
    } catch (err) {
      actionError = err?.message ?? 'Unable to accept request.';
    }
  }

  async function decline(item) {
    actionError = '';
    try {
      await declineMerchantOrder(item.id, storeId);
    } catch (err) {
      actionError = err?.message ?? 'Unable to decline request.';
    }
  }
</script>

<section class="requests-page">
  <div class="header">
    <span class="eyebrow">Merchant request board</span>
    <h1>Approve incoming orders and dispatch assignments</h1>
    <p>Control which orders are ready for rider assignment and fulfillment.</p>
  </div>

  {#if actionError}
    <div class="error-banner">{actionError}</div>
  {/if}

  <div class="request-list">
    {#if get(orderLoading)}
      <div class="loading">Loading requests…</div>
    {:else if get(merchantRequests).length === 0}
      <div class="empty-state">No current merchant requests. New orders will appear here when customers place them.</div>
    {/if}

    {#each $merchantRequests as item}
      <Card>
        <div class="row">
          <div>
            <h3>Order {item.order_code ?? item.id}</h3>
            <p class="meta">Customer: {item.customer_id ?? 'unknown'} • ₦{(item.total / 100).toLocaleString()}</p>
          </div>
          <div class="status {item.status}">{item.status}</div>
        </div>
        <div class="actions">
          <Button variant="success" on:click={() => accept(item)} disabled={item.status !== 'pending'}>Accept</Button>
          <Button variant="danger" on:click={() => decline(item)} disabled={item.status !== 'pending'}>Decline</Button>
        </div>
      </Card>
    {/each}
  </div>
</section>

<style>
  .requests-page {
    min-height: 100vh;
    padding: 3rem;
    background: linear-gradient(135deg, #0c101f, #162145);
    color: white;
  }

  .header {
    max-width: 860px;
    margin-bottom: 2rem;
  }

  .meta {
    color: #c2c2e0;
  }

  .request-list {
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
    background: rgba(245, 178, 0, 0.16);
    color: #ffd166;
  }

  .status.accepted {
    background: rgba(102, 235, 133, 0.16);
    color: #72f790;
  }

  .status.declined {
    background: rgba(255, 90, 90, 0.16);
    color: #ff8787;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  .error-banner,
  .empty-state,
  .loading {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 22px;
    padding: 1rem;
    margin-bottom: 1rem;
    color: #f5f5f5;
  }
</style>
