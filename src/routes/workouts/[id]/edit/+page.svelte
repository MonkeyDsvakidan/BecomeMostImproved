<script>
  import { page } from '$app/stores'
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'

  let allExercises = []
  let exercisesLoading = true
  let errors = []
  let loading = false
  let submitting = false
  let submitted = false

  let form = {
    name: '',
    duration: 30,
    categories: [],
    level: 'Beginner',
    exerciseIds: []
  }

  let categoryInput = ''
  let selectedExercises = new Set()

  async function fetchExercises() {
    try {
      const res = await fetch('/api/exercises')
      if (!res.ok) throw new Error(res.statusText)
      allExercises = await res.json()
    } catch (e) {
      errors = ['Failed to load exercises']
    } finally {
      exercisesLoading = false
    }
  }

  async function loadWorkout() {
    const { id } = $page.params
    loading = true
    try {
      const res = await fetch(`/api/workouts/${id}`)
      if (!res.ok) throw new Error('Failed to load workout')
      const workout = await res.json()
      form = {
        name: workout.name || '',
        duration: workout.duration || 30,
        categories: workout.categories || [],
        level: workout.level || 'Beginner',
        exerciseIds: workout.exerciseIds || []
      }
      selectedExercises = new Set(form.exerciseIds)
    } catch (e) {
      errors = [e.message || 'Failed to load workout']
    } finally {
      loading = false
    }
  }

  onMount(() => {
    fetchExercises()
    loadWorkout()
  })

  function toggleExercise(id) {
    if (selectedExercises.has(id)) {
      selectedExercises.delete(id)
    } else {
      selectedExercises.add(id)
    }
    selectedExercises = selectedExercises
    form.exerciseIds = Array.from(selectedExercises)
  }

  function addCategory() {
    const trimmed = categoryInput.trim()
    if (trimmed && !form.categories.includes(trimmed)) {
      form.categories = [...form.categories, trimmed]
      categoryInput = ''
    }
  }

  function removeCategory(cat) {
    form.categories = form.categories.filter((c) => c !== cat)
  }

  function validateForm() {
    errors = []
    if (!form.name.trim()) errors.push('Name is required')
    if (form.categories.length === 0) errors.push('At least one category is required')
    if (!form.level) errors.push('Level is required')
    if (form.duration < 0 || isNaN(form.duration)) errors.push('Duration must be a non-negative number')
    if (form.exerciseIds.length === 0) errors.push('At least one exercise must be selected')
    return errors.length === 0
  }

  async function handleSubmit() {
    submitted = true
    if (!validateForm()) return

    submitting = true
    try {
      const res = await fetch(`/api/workouts/${$page.params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        errors = [body.error || res.statusText]
        submitting = false
        return
      }

      const updated = await res.json()
      alert(`Workout "${updated.name}" updated successfully!`)
      goto('/workouts')
    } catch (e) {
      errors = [e.message || 'Failed to update workout']
      submitting = false
    }
  }
</script>

<section class="container py-4">
  <div class="row justify-content-center">
    <div class="col-12 col-xl-9">
      <div class="card bg-dark text-light border border-secondary shadow-lg rounded-3">
        <div class="card-body p-4 p-md-5">
          <div class="d-flex flex-column gap-2 mb-4">
            <h1 class="display-6 fw-bold mb-0">Edit Workout</h1>
            <p class="text-secondary mb-0">Update the workout setup and the exercises inside it.</p>
          </div>

          {#if loading || exercisesLoading}
            <div class="text-center py-5">
              <div class="spinner-border text-primary" role="status" aria-label="Loading workout"></div>
              <p class="mt-3 text-secondary mb-0">Loading workout…</p>
            </div>
          {:else}
            <form on:submit|preventDefault={handleSubmit} class="d-flex flex-column gap-4">
              {#if errors.length > 0}
                <div class="alert alert-danger rounded-3 shadow-sm mb-0">
                  <strong class="d-block mb-2">Please fix these errors:</strong>
                  <ul class="mb-0 ps-3">
                    {#each errors as err}
                      <li>{err}</li>
                    {/each}
                  </ul>
                </div>
              {/if}

              <div class="form-floating">
                <input id="name" class={`form-control bg-dark text-light border-secondary ${submitted && !form.name.trim() ? 'is-invalid' : ''}`} type="text" bind:value={form.name} placeholder="e.g., Full Body Strength" required />
                <label for="name">Workout Name</label>
              </div>

              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label text-light fw-semibold" for="duration">Duration (minutes)</label>
                  <input id="duration" class={`form-control bg-dark text-light border-secondary ${submitted && (form.duration < 0 || isNaN(form.duration)) ? 'is-invalid' : ''}`} type="number" bind:value={form.duration} min="1" required />
                </div>
                <div class="col-md-4">
                  <label class="form-label text-light fw-semibold" for="level">Level</label>
                  <select id="level" class="form-select bg-dark text-light border-secondary" bind:value={form.level} required>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="form-label text-light fw-semibold" for="categoryInput">Categories</label>
                <div class="input-group">
                  <input id="categoryInput" type="text" class="form-control bg-dark text-light border-secondary" bind:value={categoryInput} placeholder="e.g., Strength, Cardio" on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())} />
                  <button type="button" class="btn btn-outline-warning" on:click={addCategory}>Add</button>
                </div>
                {#if submitted && form.categories.length === 0}<div class="text-danger small mt-2">At least one category is required.</div>{/if}
                {#if form.categories.length > 0}
                  <div class="d-flex flex-wrap gap-2 mt-3">
                    {#each form.categories as cat}
                      <span class="badge rounded-pill bg-secondary text-light d-inline-flex align-items-center gap-2 px-3 py-2">
                        {cat}
                        <button type="button" class="btn-close btn-close-white btn-sm" aria-label="Remove category" on:click={() => removeCategory(cat)}></button>
                      </span>
                    {/each}
                  </div>
                {/if}
              </div>

              <div>
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <label class="form-label text-light fw-semibold mb-0">Select Exercises</label>
                  <span class="text-secondary small">{form.exerciseIds.length} selected</span>
                </div>

                {#if allExercises.length === 0}
                  <div class="alert alert-warning rounded-3 mb-0">
                    No exercises available. <a href="/exercises/new" class="alert-link">Create one</a>.
                  </div>
                {:else}
                  <div class={`list-group list-group-flush rounded-3 border border-secondary overflow-hidden ${submitted && form.exerciseIds.length === 0 ? 'border-danger' : ''}`}>
                    {#each allExercises as exercise (exercise._id)}
                      <label class="list-group-item bg-dark text-light border-secondary d-flex gap-3 align-items-start py-3">
                        <input class="form-check-input mt-1" type="checkbox" checked={selectedExercises.has(exercise._id)} on:change={() => toggleExercise(exercise._id)} />
                        <span class="flex-grow-1">
                          <strong class="d-block mb-1">{exercise.name}</strong>
                          <span class="d-flex flex-wrap gap-2 align-items-center small text-secondary">
                            {#each exercise.categories as cat}
                              <span class="badge rounded-pill bg-secondary text-light">{cat}</span>
                            {/each}
                            <span>Level: {exercise.level}</span>
                          </span>
                        </span>
                      </label>
                    {/each}
                  </div>
                {/if}
                {#if submitted && form.exerciseIds.length === 0}<div class="text-danger small mt-2">At least one exercise must be selected.</div>{/if}
              </div>

              <div class="d-flex flex-column flex-sm-row justify-content-end gap-2 pt-2">
                <a href="/workouts" class="btn btn-outline-light">Cancel</a>
                <button type="submit" class="btn btn-primary btn-orange" disabled={submitting}>
                  {#if submitting}
                    <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                    Updating...
                  {:else}
                    Update Workout
                  {/if}
                </button>
              </div>
            </form>
          {/if}
        </div>
      </div>
    </div>
  </div>
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

  .btn-cancel,
  .btn-submit {
    padding: 0.6rem 1.5rem;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    border: none;
    transition: all 120ms ease;
    text-decoration: none;
    display: inline-block;
    text-align: center;
  }

  .btn-cancel {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #f5f5f5;
  }

  .btn-cancel:hover {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .btn-submit {
    background: #FF8C00;
    color: #111;
  }

  .btn-submit:hover:not(:disabled) {
    background: #ff9d1f;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 140, 0, 0.3);
  }

  .btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    .page {
      padding: 0.75rem;
    }

    .exercises-list {
      max-height: 400px;
    }

    .actions {
      flex-direction: column;
    }

    .btn-cancel,
    .btn-submit {
      width: 100%;
    }
  }
</style>