<script>
  import { onMount } from 'svelte'
  import WorkoutCard from '$lib/components/WorkoutCard.svelte'

  let workouts = []
  let loading = true
  let error = ''
  const deleting = new Set()

  async function fetchWorkouts() {
    loading = true
    error = ''
    try {
      const res = await fetch('/api/workouts')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || res.statusText)
      }
      workouts = await res.json()
    } catch (e) {
      error = e.message || 'Failed to load workouts'
    } finally {
      loading = false
    }
  }

  onMount(() => {
    fetchWorkouts()
  })

  async function deleteWorkout(id, name) {
    const confirmed = confirm(`Delete workout "${name}"? This cannot be undone.`)
    if (!confirmed) return

    deleting.add(id)
    try {
      const res = await fetch(`/api/workouts/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || res.statusText)
      }
      workouts = workouts.filter((w) => w._id !== id)
    } catch (e) {
      alert('Delete failed: ' + (e.message || 'unknown error'))
    } finally {
      deleting.delete(id)
    }
  }

  function startWorkout(id) {
    goto(`/workouts/${id}`)
  }
</script>

<section class="page">
  <header class="header">
    <h1>Workouts</h1>
    <div class="actions-top">
      <button class="refresh" on:click={fetchWorkouts} disabled={loading}>Refresh</button>
      <a href="/workouts/new" class="btn-new">Create New Workout</a>
    </div>
  </header>

  {#if loading}
    <div class="loading">Loading workouts…</div>
  {:else if error}
    <div class="error">{error}</div>
  {:else if workouts.length === 0}
    <div class="empty">No workouts found. <a href="/workouts/new">Create one</a>.</div>
  {:else}
    <div class="grid">
      {#each workouts as workout (workout._id)}
        <WorkoutCard
          {workout}
          onDelete={deleteWorkout}
        />
      {/each}
    </div>
  {/if}
</section>

<style>
  :global(body) {
    background: #1a1a1a;
    color: #f5f5f5;
  }

  .page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 1.25rem;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    gap: 1rem;
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
  }

  .actions-top {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .refresh,
  .btn-new {
    padding: 0.4rem 0.75rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 120ms ease;
    text-decoration: none;
    display: inline-block;
  }

  .refresh {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.06);
    color: #f5f5f5;
  }

  .refresh:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.03);
  }

  .btn-new {
    background: #FF8C00;
    color: #111;
    border: none;
  }

  .btn-new:hover {
    background: #ff9d1f;
    transform: translateY(-1px);
  }

  .refresh:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .loading,
  .error,
  .empty {
    padding: 2rem;
    text-align: center;
    color: #ccc;
  }

  .empty a {
    color: #FF8C00;
    text-decoration: none;
    font-weight: 600;
  }

  .empty a:hover {
    text-decoration: underline;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  @media (max-width: 640px) {
    .page {
      padding: 0.75rem;
    }

    .header {
      flex-direction: column;
      align-items: flex-start;
    }

    .actions-top {
      width: 100%;
    }

    .refresh,
    .btn-new {
      flex: 1;
    }

    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>