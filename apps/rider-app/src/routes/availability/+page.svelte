<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Card } from '@zaradrop/ui';
  import { requireAuth, riderJobs, orderLoading, loadRiderJobs, acceptRiderJob, buildRouteMap, routeSummary, routeLoading, routeError } from '@zaradrop/hooks';
import type { LocationPoint, Order } from '@zaradrop/types';
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const RIDER_ORIGIN = 'Abuja Central, Abuja, Nigeria';

  let availability = 'offline';
  let lastLocation = 'Abuja Central';
  let currentUser: unknown = null;
  let actionError = '';
  let selectedJob: Order | null = null;
  let mapContainer: HTMLDivElement | null = null;
  let currentOrigin: LocationPoint | string = RIDER_ORIGIN;

  function toggleAvailability() {
    availability = availability === 'offline' ? 'online' : 'offline';
  }

  async function refreshRoute(job: Order | null) {
    if (!mapContainer || !GOOGLE_MAPS_API_KEY || !job?.destination) {
      return;
    }

    try {
      await buildRouteMap({
        apiKey: GOOGLE_MAPS_API_KEY,
        mapElement: mapContainer,
        origin: currentOrigin,
        destination: job.destination,
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function updateCurrentLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation || !GOOGLE_MAPS_API_KEY) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        currentOrigin = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: 'Your current location',
        };
        lastLocation = `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`;
        if (selectedJob) {
          await refreshRoute(selectedJob);
        }
      },
      (error) => {
        console.warn('Unable to access rider location:', error.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  }

  onMount(async () => {
    const active = await requireAuth();
    if (!active) {
      goto('/login');
      return;
    }

    currentUser = active;
    await loadRiderJobs();
    selectedJob = get(riderJobs)[0] ?? null;
    await updateCurrentLocation();
    await refreshRoute(selectedJob);
  });

  async function selectJob(job) {
    selectedJob = job;
    actionError = '';
    await refreshRoute(job);
  }

  async function acceptJob(orderId: string) {
    actionError = '';
    try {
      await acceptRiderJob(orderId);
      await loadRiderJobs();
      selectedJob = get(riderJobs).find((job) => job.id === orderId) ?? selectedJob;
      await refreshRoute(selectedJob);
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

  <div class="route-panel">
    <div class="route-header">
      <div>
        <h2>Selected job route</h2>
        <p>{selectedJob ? `Routing to ${selectedJob.destination}` : 'Choose a job to preview the route and distance.'}</p>
      </div>
      <Button variant="secondary" on:click={updateCurrentLocation}>Refresh location</Button>
    </div>
    <div class="route-map-wrapper">
      <div bind:this={mapContainer} class="route-map"></div>
    </div>
    {#if $routeLoading}
      <div class="route-status">Calculating the best route…</div>
    {/if}
    {#if $routeError}
      <div class="route-error">{$routeError}</div>
    {/if}
    {#if $routeSummary}
      <div class="route-summary">
        <strong>{ $routeSummary.routeSummary }</strong>
        <p>ETA: { $routeSummary.etaText }</p>
      </div>
    {/if}
  </div>

  <div class="job-board">
    <div class="board-header">
      <h2>Available delivery jobs</h2>
      <span>{get(orderLoading) ? 'Refreshing…' : `${get(riderJobs).length} open jobs`}</span>
    </div>

    {#if get(riderJobs).length === 0}
      <div class="empty-state">No live jobs in the queue right now. Check back once riders are active.</div>
    {/if}

    {#each $riderJobs as job}
      <Card class:selected={selectedJob?.id === job.id} on:click={() => selectJob(job)}>
        <div class="job-row">
          <div>
            <h3>Order {job.order_code ?? job.id}</h3>
            <p>{job.destination ?? 'Route pending address'}</p>
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

  .route-panel {
    margin-bottom: 1.5rem;
    padding: 1.5rem;
    border-radius: 28px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
  }

  .route-map-wrapper {
    min-height: 320px;
    border-radius: 24px;
    overflow: hidden;
    background: #0f172a;
    border: 1px solid rgba(255,255,255,0.09);
    margin: 1rem 0;
  }

  .route-map {
    min-height: 320px;
    width: 100%;
  }

  .route-status,
  .route-error,
  .route-summary {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 20px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
  }

  .route-error {
    color: #fda4af;
  }

  .route-summary p {
    margin: 0.5rem 0 0;
    color: rgba(255,255,255,0.76);
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

  .selected {
    border: 1px solid rgba(99,102,241,0.4);
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
