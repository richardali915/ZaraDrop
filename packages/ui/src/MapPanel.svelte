<script lang="ts">
  export let title = 'Live route map';
  export let description = 'Real-time routing preview for deliveries.';
</script>

<div class="map-panel">
  <div class="panel-header">
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  </div>
  <div class="map-container">
    <slot />
  </div>
</div>

<style>
  .map-panel {
    border-radius: 28px;
    background: var(--zd-card);
    border: 1px solid var(--zd-border);
    box-shadow: var(--zd-shadow-lg);
    padding: 1.5rem;
    display: grid;
    gap: 1rem;
  }
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }
  .panel-header h2 {
    margin: 0;
    font-size: 1.2rem;
  }
  .panel-header p {
    margin: 0.35rem 0 0;
    color: var(--zd-muted);
  }
  .map-container {
    min-height: 340px;
    border-radius: 24px;
    overflow: hidden;
    background: #0f172a;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
</style>
