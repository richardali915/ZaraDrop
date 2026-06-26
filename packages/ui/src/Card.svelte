<div class="card"><slot /></div>

<style>
  .card {
    border-radius: 26px;
    background: var(--zd-card);
    border: 1px solid var(--zd-border);
    box-shadow: var(--zd-shadow-lg);
    padding: 1.6rem;
    backdrop-filter: blur(28px);
    transition: transform 0.18s ease, border-color 0.25s ease, background 0.25s ease;
  }
  .card:hover {
    transform: translateY(-1px);
  }
</style>
