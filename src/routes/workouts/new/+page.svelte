<script>
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'

  let allExercises = []
  let exercisesLoading = true
  let errors = []
  let loading = false

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

  onMount(() => {
    fetchExercises()
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

    loading = true
    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        if (body.errors && Array.isArray(body.errors)) {
          errors = body.errors
        } else {
          errors = [body.error || res.statusText]
        }
        loading = false
        return
      }

      const created = await res.json()
      alert(`Workout "${created.name}" created successfully!`)
      goto('/workouts')
    } catch (e) {
      errors = [e.message || 'Failed to create workout']
      loading = false
    }
  }
</script>

<section class="page">
  <header class="header">
    <h1>Create New Workout</h1>
  </header>

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
        placeholder="e.g., Morning Strength Training"
        required
      />
    </div>

    <div class="form-group">
      <label for="duration">Duration (minutes) *</label>
      <input id="duration" type="number" bind:value={form.duration} min="0" required />
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
      <label>Select Exercises *</label>
      {#if exercisesLoading}
        <div class="loading">Loading exercises…</div>
      {:else if allExercises.length === 0}
        <div class="empty">No exercises available. <a href="/exercises/new">Create one</a>.</div>
      {:else}
        <div class="exercises-list">
          {#each allExercises as exercise (exercise._id)}
            <label class="exercise-checkbox">
              <input
                type="checkbox"
                checked={selectedExercises.has(exercise._id)}
                on:change={() => toggleExercise(exercise._id)}
              />
              <div class="exercise-info">
                <span class="exercise-name">{exercise.name}</span>
                <span class="exercise-meta">
                  {#each exercise.category ?? [] as cat}
                    <span class="badge">{cat}</span>
                  {/each}
                  <span class="level">Level: {exercise.level}</span>
                </span>
              </div>
            </label>
          {/each}
        </div>
      {/if}
      <div class="selected-count">
        {form.exerciseIds.length} exercise{form.exerciseIds.length !== 1 ? 's' : ''} selected
      </div>
    </div>

    <div class="actions">
      <a href="/workouts" class="btn-cancel">Cancel</a>
      <button type="submit" class="btn-submit" disabled={loading}>
        {#if loading}Creating...{:else}Create Workout{/if}
      </button>
    </div>
  </form>
</section>

<style>
  .page {
    max-width: 800px;
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

  .form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .error-box {
    background: rgba(220, 50, 50, 0.15);
    border: 1px solid rgba(220, 50, 50, 0.4);
    color: #ff9999;
    padding: 0.75rem 1rem;
    border-radius: 8px;
  }

  .error-box strong {
    display: block;
    margin-bottom: 0.5rem;
  }

  .error-box ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  .error-box li {
    margin: 0.25rem 0;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-weight: 600;
    color: #ffffff;
    font-size: 0.95rem;
  }

  input[type='text'],
  input[type='number'],
  select {
    background: #2a2a2a;
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #f5f5f5;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.95rem;
    font-family: inherit;
    transition: border-color 160ms ease;
  }

  input[type='text']:focus,
  input[type='number']:focus,
  select:focus {
    outline: none;
    border-color: #FF8C00;
    box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.1);
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
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
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
  }

  .tag {
    background: rgba(255, 140, 0, 0.15);
    color: #ffd9b8;
    padding: 0.35rem 0.6rem;
    border-radius: 999px;
    font-size: 0.9rem;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  .remove {
    background: none;
    border: none;
    color: inherit;
    font-size: 1.1rem;
    cursor: pointer;
    padding: 0;
    margin-left: 0.2rem;
  }

  .loading,
  .empty {
    color: #ccc;
    padding: 1rem;
    text-align: center;
  }

  .empty a {
    color: #FF8C00;
    text-decoration: none;
    font-weight: 600;
  }

  .exercises-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: #2a2a2a;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 1rem;
    max-height: 400px;
    overflow-y: auto;
  }

  .exercise-checkbox {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 6px;
    transition: background-color 120ms ease;
  }

  .exercise-checkbox:hover {
    background: rgba(255, 140, 0, 0.08);
  }

  .exercise-checkbox input[type='checkbox'] {
    margin-top: 0.25rem;
    cursor: pointer;
    accent-color: #FF8C00;
  }

  .exercise-info {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    flex: 1;
  }

  .exercise-name {
    font-weight: 600;
    color: #ffffff;
  }

  .exercise-meta {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
    font-size: 0.8rem;
    color: #c5c5c5;
  }

  .badge {
    background: rgba(255, 140, 0, 0.12);
    color: #ffd9b8;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
  }

  .level {
    color: #b0b0b0;
  }

  .selected-count {
    font-size: 0.9rem;
    color: #b0b0b0;
    margin-top: -0.25rem;
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1rem;
  }

  .btn-cancel,
  .btn-submit {
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 120ms ease;
    text-decoration: none;
    display: inline-block;
  }

  .btn-cancel {
    background: rgba(255, 255, 255, 0.06);
    color: #f5f5f5;
  }

  .btn-cancel:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  .btn-submit {
    background: #FF8C00;
    color: #111111;
  }

  .btn-submit:hover:not(:disabled) {
    background: #ff9d1f;
    transform: translateY(-1px);
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
      max-height: 300px;
    }

    .actions {
      flex-direction: column-reverse;
    }

    .btn-cancel,
    .btn-submit {
      width: 100%;
    }
  }
</style>