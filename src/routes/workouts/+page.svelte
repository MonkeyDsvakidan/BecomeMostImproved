<script>
  import WorkoutCard from '$lib/components/WorkoutCard.svelte'

  export let data

  let workouts = data?.workouts ?? []
  let loading = false
  let error = data?.error ?? ''
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

</script>

<section class="container py-4">
  <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
    <div>
      <h1 class="display-6 fw-bold mb-1">Workouts</h1>
      <p class="text-secondary mb-0">Manage workout plans and launch sessions quickly.</p>
    </div>
    <div class="d-flex gap-2 flex-wrap">
      <button class="btn btn-outline-light" on:click={fetchWorkouts} disabled={loading}>
        {#if loading}
          <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
          Refreshing
        {:else}
          Refresh
        {/if}
      </button>
      <a href="/workouts/new" class="btn btn-primary btn-orange">Create New Workout</a>
    </div>
  </div>

  {#if loading}
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status" aria-label="Loading workouts"></div>
      <p class="mt-3 text-secondary mb-0">Loading workouts…</p>
    </div>
  {:else if error}
    <div class="alert alert-danger rounded-3 shadow-sm">{error}</div>
  {:else if workouts.length === 0}
    <div class="text-center py-5 bg-dark border border-secondary rounded-3 shadow-sm">
      <div class="display-4 mb-3">🎯</div>
      <h2 class="h4">No workouts found</h2>
      <p class="text-secondary mb-3">Create a workout by combining exercises into a session.</p>
      <a href="/workouts/new" class="btn btn-primary btn-orange">Create Workout</a>
    </div>
  {:else}
    <div class="row g-4">
      {#each workouts as workout (workout._id)}
        <div class="col-12 col-md-6 col-lg-4">
          <WorkoutCard {workout} onDelete={deleteWorkout} />
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  .btn-orange {
    background: #FF8C00;
    border-color: #FF8C00;
    color: #111111;
  }

  .btn-orange:hover,
  .btn-orange:focus {
    background: #ff9d1f;
    border-color: #ff9d1f;
    color: #111111;
  }
</style>