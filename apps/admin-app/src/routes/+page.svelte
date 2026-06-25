<script lang="ts">
  import { Button, Card, Badge } from '@zaradrop/ui';
  import { goto } from '$app/navigation';
</script>

<section class="hero">
  <div class="panel">
    <span class="eyebrow">Admin Console</span>
    <h1>Approve riders, merchants, and orders using enterprise controls.</h1>
    <p>Monitor platform health, verify registrations, and manage compliance from one secure dashboard.</p>
    <div class="actions">
      <Button variant="primary" on:click={() => goto('/approvals')}>Review Approvals</Button>
      <Button variant="secondary" on:click={() => goto('/approvals')}>Open Reports</Button>
    </div>
  </div>
  <div class="feature-grid">
    <Card>
      <h2>Approval workflows</h2>
      <p>Approve or reject riders and stores with audit logs and status controls.</p>
    </Card>
    <Card>
      <h2>Live operations</h2>
      <p>Get real-time metrics on deliveries, rider activity, and merchant onboarding.</p>
    </Card>
    <Card>
      <h2>Admin security</h2>
      <p>Protect the platform with role-based session controls and centralized auth.</p>
    </Card>
  </div>
  <div class="badge-row">
    <Badge>Role access</Badge>
    <Badge>Policy guardrails</Badge>
    <Badge>Audit-ready</Badge>
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
    background: radial-gradient(circle at top, rgba(243, 65, 36, 0.15), transparent 40%), linear-gradient(180deg, #050407, #0b0d14 85%);
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
