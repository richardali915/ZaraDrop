<script lang="ts">
  import { onMount } from 'svelte';
  import { signOut, requireAuth, orders, orderLoading, loadCustomerOrders, placeCustomerOrder, cancelCustomerOrder } from '@zaradrop/hooks';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';

  let loaded = false;
  let currentUser = null;
  let destination = 'Wuse II Market';
  let paymentMethod = 'wallet';
  let total = 4800;
  let items = 'Fresh groceries and essentials';
  let creating = false;
  let actionError = '';

  onMount(async () => {
    const active = await requireAuth();
    if (!active) {
      goto('/login');
      return;
    }
    currentUser = active;
    await loadCustomerOrders();
    loaded = true;
  });

  async function handleSignOut() {
    await signOut();
    goto('/login');
  }

  async function submitOrder() {
    actionError = '';
    creating = true;

    try {
      await placeCustomerOrder({
        store_id: 'store_1',
        total,
        payment_method: paymentMethod,
        destination,
        items: [
          { name: items, quantity: 1, price: total, subtotal: total }
        ]
      });
    } catch (err) {
      actionError = err?.message ?? 'Unable to place order.';
    } finally {
      creating = false;
    }
  }

  async function handleCancel(orderId: string) {
    try {
      await cancelCustomerOrder(orderId);
    } catch (err) {
      actionError = err?.message ?? 'Unable to cancel order.';
    }
  }

  function statusLabel(status: string) {
    const labels = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      ready: 'Ready for pickup',
      assigned: 'Rider assigned',
      delivering: 'Delivering',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      accepted: 'Accepted',
      declined: 'Declined'
    };
    return labels[status] ?? status;
  }
</script>

<section class="dashboard-shell">
  <div class="home-panel">
    <div class="heading-row">
      <div>
        <h1>Welcome back</h1>
        <p>Order your next delivery, view active orders, and track your rider in real time.</p>
      </div>
      <button class="primary" on:click={handleSignOut}>Sign Out</button>
    </div>
  </div>

  {#if loaded}
    <div class="dashboard-grid">
      <div class="orders-panel">
        <div class="panel-header">
          <h2>My orders</h2>
          <span>{get(orderLoading) ? 'Refreshing…' : `${get(orders).length} orders`}</span>
        </div>

        {#if get(orders).length === 0}
          <div class="empty-state">
            <p>No active orders yet. Place one below to get started.</p>
          </div>
        {/if}

        {#each $orders as order}
          <article class="order-card">
            <div class="order-line">
              <div>
                <strong>Order {order.order_code ?? order.id}</strong>
                <p>{order.destination ?? 'Pickup delivery destination'}</p>
              </div>
              <div class="status-pill {order.status}">{statusLabel(order.status)}</div>
            </div>
            <div class="order-meta">
              <span>₦{(order.total / 100).toLocaleString()}</span>
              <span>{order.created_at ? new Date(order.created_at).toLocaleString() : 'Just now'}</span>
            </div>
            {#if order.status === 'pending' || order.status === 'confirmed' || order.status === 'preparing'}
              <button class="secondary" on:click={() => handleCancel(order.id)}>Cancel order</button>
            {/if}
          </article>
        {/each}
      </div>

      <div class="create-panel">
        <div class="panel-header">
          <h2>New order</h2>
          <span>Create a fast checkout for your next delivery.</span>
        </div>

        {#if actionError}
          <div class="error-banner">{actionError}</div>
        {/if}

        <form on:submit|preventDefault={submitOrder} class="order-form">
          <label>
            Destination
            <input type="text" bind:value={destination} placeholder="Delivery address" required />
          </label>
          <label>
            Order details
            <input type="text" bind:value={items} placeholder="Items and notes" required />
          </label>
          <label>
            Total (NGN)
            <input type="number" bind:value={total} min="100" required />
          </label>
          <label>
            Payment method
            <select bind:value={paymentMethod}>
              <option value="wallet">Wallet</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
            </select>
          </label>
          <button class="primary" type="submit" disabled={creating}>{creating ? 'Placing order…' : 'Place order'}</button>
        </form>
      </div>
    </div>
  {/if}
</section>

<style>
  .dashboard-shell {
    min-height: 100vh;
    padding: 3rem;
    background: linear-gradient(135deg, #070c21, #10153f);
    color: white;
  }

  .home-panel {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 28px;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .heading-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
  }

  .dashboard-grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: 2fr 1fr;
  }

  .orders-panel,
  .create-panel {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 28px;
    padding: 1.75rem;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.2rem;
  }

  .order-card {
    margin-bottom: 1rem;
    padding: 1.25rem;
    border-radius: 22px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
  }

  .order-line {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    margin-bottom: 0.85rem;
  }

  .status-pill {
    border-radius: 999px;
    padding: 0.55rem 0.9rem;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .status-pill.pending { background: rgba(250,204,21,0.16); color: #ffda79; }
  .status-pill.confirmed { background: rgba(56,189,248,0.16); color: #7dd3fc; }
  .status-pill.preparing { background: rgba(99,102,241,0.16); color: #c7d2fe; }
  .status-pill.ready { background: rgba(52,211,153,0.18); color: #a7f3d0; }
  .status-pill.assigned,
  .status-pill.delivering { background: rgba(255,166,0,0.16); color: #ffd580; }
  .status-pill.delivered { background: rgba(34,197,94,0.16); color: #d1fae5; }
  .status-pill.cancelled,
  .status-pill.declined { background: rgba(248,113,113,0.16); color: #fecaca; }
  .status-pill.accepted { background: rgba(52,211,153,0.16); color: #a7f3d0; }

  .order-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.95rem;
    color: rgba(255,255,255,0.72);
    margin-bottom: 1rem;
  }

  .empty-state,
  .error-banner {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .order-form {
    display: grid;
    gap: 1rem;
  }

  label {
    display: grid;
    gap: 0.5rem;
    font-size: 0.95rem;
    color: rgba(255,255,255,0.82);
  }

  input,
  select {
    width: 100%;
    padding: 1rem 1rem;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.13);
    background: rgba(255,255,255,0.05);
    color: white;
  }

  input:focus,
  select:focus {
    outline: none;
    border-color: rgba(193,68,212,0.8);
    box-shadow: 0 0 0 3px rgba(193,68,212,0.12);
  }

  .secondary,
  .primary {
    border: none;
    border-radius: 999px;
    padding: 0.95rem 1.5rem;
    cursor: pointer;
    font-weight: 700;
  }

  .secondary {
    background: rgba(255,255,255,0.08);
    color: white;
  }

  .primary {
    background: linear-gradient(90deg, #6c5ce7, #00b894);
    color: white;
  }
</style>
