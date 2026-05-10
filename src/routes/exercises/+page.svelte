<script>
  import { onMount } from 'svelte'
  import ExerciseCard from '$lib/components/ExerciseCard.svelte'

  let exercises = []
  let loading = true
  let error = ''
  const deleting = new Set()

  async function fetchExercises() {
    loading = true
    error = ''
    try {
      const res = await fetch('/api/exercises')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || res.statusText)
      }
      exercises = await res.json()
    } catch (e) {
      error = e.message || 'Failed to load exercises'
    } finally {
      loading = false
    }
  }

  onMount(() => {
    fetchExercises()
  })

  async function deleteExercise(id, name) {
    const confirmed = confirm(`Delete exercise "${name}"? This cannot be undone.`)
    if (!confirmed) return

    deleting.add(id)
    try {
      const res = await fetch(`/api/exercises/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || res.statusText)
      }
      exercises = exercises.filter((e) => e._id !== id)
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
      <h1 class="display-6 fw-bold mb-1">Exercises</h1>
      <p class="text-secondary mb-0">Browse, create, and manage your exercise library.</p>
    </div>
    <div class="d-flex gap-2 flex-wrap">
      <button class="btn btn-outline-light" on:click={fetchExercises} disabled={loading}>
        {#if loading}
          <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
          Refreshing
        {:else}
          Refresh
        {/if}
      </button>
      <a href="/exercises/new" class="btn btn-primary btn-orange">Create New Exercise</a>
    </div>
  </div>

  {#if loading}
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status" aria-label="Loading exercises"></div>
      <p class="mt-3 text-secondary mb-0">Loading exercises…</p>
    </div>
  {:else if error}
    <div class="alert alert-danger rounded-3 shadow-sm">{error}</div>
  {:else if exercises.length === 0}
    <div class="text-center py-5 bg-dark border border-secondary rounded-3 shadow-sm">
      <div class="display-4 mb-3">🏀</div>
      <h2 class="h4">No exercises found</h2>
      <p class="text-secondary mb-3">Add your first drill to start building workouts.</p>
      <a href="/exercises/new" class="btn btn-primary btn-orange">Create Exercise</a>
    </div>
  {:else}
    <div class="row g-4">
      {#each exercises as ex (ex._id)}
        <div class="col-12 col-md-6 col-lg-4">
          <ExerciseCard exercise={ex} onDelete={deleteExercise} />
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