<script>
  import { goto } from '$app/navigation'

  let form = {
    name: '',
    categories: [],
    level: 'Beginner',
    description: '',
    sets: 3,
    reps: 10,
    duration: 30
  }

  let categoryInput = ''
  let errors = []
  let loading = false
  let submitted = false

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
    if (!form.description.trim()) errors.push('Description is required')
    if (form.sets < 0 || isNaN(form.sets)) errors.push('Sets must be a non-negative number')
    if (form.reps < 0 || isNaN(form.reps)) errors.push('Reps must be a non-negative number')
    if (form.duration < 0 || isNaN(form.duration)) errors.push('Duration must be a non-negative number')
    return errors.length === 0
  }

  async function handleSubmit() {
  if (!validateForm()) return

  loading = true
  submitted = true
  try {
    // ⬇️ ÄNDERE HIER: categories → category
    const payload = {
      name: form.name,
      category: form.categories,  // ← Umbenannt von 'categories' zu 'category'
      level: form.level,
      description: form.description,
      sets: form.sets,
      reps: form.reps,
      duration: form.duration
    }

    const res = await fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)  // ← Nutze payload statt form
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
    alert(`Exercise "${created.name}" created successfully!`)
    goto('/exercises')
  } catch (e) {
    errors = [e.message || 'Failed to create exercise']
    loading = false
  }
}
</script>

<section class="page">
  <header class="header">
    <h1>Create New Exercise</h1>
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
      <label for="name">Exercise Name *</label>
      <input
        id="name"
        type="text"
        bind:value={form.name}
        placeholder="e.g., Push-ups"
        required
      />
    </div>

    <div class="form-group">
      <label for="categoryInput">Categories *</label>
      <div class="category-input">
        <input
          id="categoryInput"
          type="text"
          bind:value={categoryInput}
          placeholder="e.g., Chest, Cardio"
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
      <label for="description">Description *</label>
      <textarea
        id="description"
        bind:value={form.description}
        placeholder="Describe how to perform this exercise..."
        required
      ></textarea>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="sets">Sets *</label>
        <input id="sets" type="number" bind:value={form.sets} min="0" required />
      </div>
      <div class="form-group">
        <label for="reps">Reps *</label>
        <input id="reps" type="number" bind:value={form.reps} min="0" required />
      </div>
      <div class="form-group">
        <label for="duration">Duration (minutes) *</label>
        <input id="duration" type="number" bind:value={form.duration} min="0" required />
      </div>
    </div>

    <div class="actions">
      <a href="/exercises" class="btn-cancel">Cancel</a>
      <button type="submit" class="btn-submit" disabled={loading}>
        {#if loading}Creating...{:else}Create Exercise{/if}
      </button>
    </div>
  </form>
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

  .form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
  }

  label {
    font-weight: 600;
    color: #ffffff;
    font-size: 0.95rem;
  }

  input[type='text'],
  input[type='number'],
  select,
  textarea {
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
  select:focus,
  textarea:focus {
    outline: none;
    border-color: #FF8C00;
    box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.1);
  }

  textarea {
    min-height: 120px;
    resize: vertical;
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

    .form-row {
      grid-template-columns: 1fr;
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