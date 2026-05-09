<script>
  import { page } from '$app/stores'
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'

  let allExercises = []
  let exercisesLoading = true
  let errors = []
  let loading = false
  let submitting = false

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

<section class="page">
  <header class="header">
    <h1>Edit Workout</h1>
  </header>

  {#if loading || exercisesLoading}
    <div class="loading">Loading workout…</div>
  {:else}
    <form on:submit|preventDefault={handleSubmit} class="form">
      {#if errors.length > 0}
        <div class="error-box">
          <strong>Please fix these errors:</strong>
          <ul>
            {#each errors as err}
              <li>{err}</li>
            {/each}
          </ul>
        </div>
      {/if}

      <div class="form-group">
        <label for="name">Workout Name *</label>
        <input
          id="name"
          type="text"
          bind:value={form.name}
          placeholder="e.g., Full Body Strength"
          required
        />
      </div>

      <div class="form-group">
        <label for="duration">Duration (minutes) *</label>
        <input id="duration" type="number" bind:value={form.duration} min="1" required />
      </div>

      <div class="form-group">
        <label for="categoryInput">Categories *</label>
        <div class="category-input">
          <input
            id="categoryInput"
            type="text"
            bind:value={categoryInput}
            placeholder="e.g., Strength, Cardio"
            on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
          />
          <button type="button" on:click={addCategory} class="btn-add">Add</button>
        </div>
        {#if form.categories.length > 0}
          <div class="category-tags">
            {#each form.categories as cat}
              <span class="tag">
                {cat}
                <button type="button" on:click={() => removeCategory(cat)} class="remove">&times;</button>
              </span>
            {/each}
          </div>
        {/if}
      </div>

      <div class="form-group">
        <label for="level">Level *</label>
        <select id="level" bind:value={form.level} required>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      <div class="form-group">
        <label>Exercises * ({form.exerciseIds.length} selected)</label>
        <div class="exercises-list">
          {#each allExercises as exercise (exercise._id)}
            <label class="exercise-item">
              <input
                type="checkbox"
                checked={selectedExercises.has(exercise._id)}
                on:change={() => toggleExercise(exercise._id)}
              />
              <span class="exercise-info">
                <strong>{exercise.name}</strong>
                <span class="exercise-meta">
                  {#each exercise.categories as cat}
                    <span class="badge">{cat}</span>
                  {/each}
                  <span class="level-badge">{exercise.level}</span>
                </span>
              </span>
            </label>
          {/each}
        </div>
      </div>

      <div class="actions">
        <a href="/workouts" class="btn-cancel">Cancel</a>
        <button type="submit" class="btn-submit" disabled={submitting}>
          {#if submitting}Updating...{:else}Update Workout{/if}
        </button>
      </div>
    </form>
  {/if}
</section>

<style>
  .page {
    max-width: 700px;
    margin: 0 auto;
    padding: 1.25rem;
  }

  .header {
    margin-bottom: 1.5rem;
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
  }

  .loading {
    text-align: center;
    padding: 2rem;
    color: #b0b0b0;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .error-box {
    background: rgba(255, 100, 100, 0.1);
    border: 1px solid rgba(255, 100, 100, 0.3);
    border-radius: 8px;
    padding: 1rem;
    color: #ff9999;
  }

  .error-box strong {
    display: block;
    margin-bottom: 0.5rem;
  }

  .error-box ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-weight: 600;
    font-size: 0.95rem;
  }

  input[type='text'],
  input[type='number'],
  select {
    background: #2a2a2a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 0.6rem;
    color: #f5f5f5;
    font-family: inherit;
    transition: border-color 160ms ease;
  }

  input[type='text']:focus,
  input[type='number']:focus,
  select:focus {
    outline: none;
    border-color: #FF8C00;
  }

  .category-input {
    display: flex;
    gap: 0.5rem;
  }

  .category-input input {
    flex: 1;
  }

  .btn-add {
    background: rgba(255, 140, 0, 0.2);
    border: 1px solid rgba(255, 140, 0, 0.4);
    color: #ffd9b8;
    padding: 0.6rem 1rem;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 120ms ease;
  }

  .btn-add:hover {
    background: rgba(255, 140, 0, 0.3);
    border-color: #FF8C00;
  }

  .category-tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
  }

  .tag {
    background: rgba(255, 140, 0, 0.15);
    color: #ffd9b8;
    padding: 0.4rem 0.7rem;
    border-radius: 999px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  .remove {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0;
    transition: opacity 120ms ease;
  }

  .remove:hover {
    opacity: 0.7;
  }

  .exercises-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 300px;
    overflow-y: auto;
    padding: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.2);
  }

  .exercise-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(255, 140, 0, 0.02);
    border-radius: 6px;
    cursor: pointer;
    transition: background 120ms ease;
  }

  .exercise-item:hover {
    background: rgba(255, 140, 0, 0.08);
  }

  .exercise-item input[type='checkbox'] {
    margin-top: 0.25rem;
    cursor: pointer;
  }

  .exercise-info {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    flex: 1;
  }

  .exercise-info strong {
    color: #f5f5f5;
  }

  .exercise-meta {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .badge,
  .level-badge {
    background: rgba(255, 255, 255, 0.05);
    color: #ffd9b8;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1rem;
  }

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