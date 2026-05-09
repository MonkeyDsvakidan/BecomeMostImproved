<script>
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
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

  function startExercise(id) {
    // Placeholder action for "Start" — navigate or start timer as needed
    goto(`/exercises/${id}`)
  }
</script>

<section class="page">
  <header class="header">
    <h1>Exercises</h1>
    <div class="actions-top">
      <button class="refresh" on:click={fetchExercises} disabled={loading}>Refresh</button>
      <a href="/exercises/new" class="btn-new">Create New Exercise</a>
    </div>
  </header>

  {#if loading}
    <div class="loading">Loading exercises…</div>
  {:else if error}
    <div class="error">{error}</div>
  {:else if exercises.length === 0}
    <div class="empty">No exercises found.</div>
  {:else}
    <div class="grid">
      {#each exercises as ex (ex._id)}
        <ExerciseCard
          exercise={ex}
          onStart={startExercise}
          onDelete={deleteExercise}
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
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  h1 { margin: 0; font-size: 1.5rem }

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

  .loading, .error, .empty {
    padding: 2rem;
    text-align: center;
    color: #ccc;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1rem;
  }

  .card {
    background: #121212;
    border: 1px solid rgba(255,255,255,0.04);
    padding: 1rem;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.45);
  }

  .card-top { display:flex; align-items:flex-start; justify-content:space-between; gap: 0.5rem }
  .ex-name { margin: 0; font-size: 1.05rem }

  .badges { display:flex; gap: 0.4rem; flex-wrap:wrap }
  .badge {
    background: rgba(255,255,255,0.03);
    color: #ffd9b8;
    padding: 0.18rem 0.4rem;
    border-radius: 999px;
    font-size: 0.72rem;
  }

  .meta { display:flex; gap: 1rem; color: #cfcfcf; font-size: 0.9rem }
  .desc { color: #d3d3d3; margin: 0; flex: 1 }

  .actions {
    display:flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }

  .start {
    background: #FF8C00;
    color: #111;
    border: none;
    padding: 0.45rem 0.7rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
  }

  .delete {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.06);
    color: #f5f5f5;
    padding: 0.4rem 0.6rem;
    border-radius: 8px;
    cursor: pointer;
  }

  .start:disabled, .delete:disabled, .refresh:disabled { opacity: 0.6; cursor: not-allowed }

  @media (max-width: 640px) {
    .page { padding: 0.75rem }
    .actions { justify-content: space-between }
  }
</style>