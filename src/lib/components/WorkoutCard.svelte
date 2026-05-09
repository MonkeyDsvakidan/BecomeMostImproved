<script>
  export let workout = {}
  export let onStart = () => {}
  export let onDelete = () => {}

  const { _id, name, duration = 0, categories = [], level = 'N/A', exercises = [] } = workout
</script>

<article class="card">
  <div class="card-head">
    <h2 class="name">{name}</h2>
    <span class="exercise-count">{exercises.length} exercises</span>
  </div>

  <div class="meta">
    <span class="duration">⏱ {duration} min</span>
    <span class="level-badge">Level: <strong>{level}</strong></span>
  </div>

  {#if categories && categories.length > 0}
    <div class="categories">
      {#each categories as cat}
        <span class="category-tag">{cat}</span>
      {/each}
    </div>
  {/if}

  <div class="actions">
    <button class="btn-start" on:click={() => onStart(_id)}>Start</button>
    <button class="btn-delete" on:click={() => onDelete(_id, name)}>Delete</button>
  </div>
</article>

<style>
  .card {
    background: #2a2a2a;
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    transition: all 160ms ease;
  }

  .card:hover {
    border-color: rgba(255, 140, 0, 0.3);
    box-shadow: 0 6px 16px rgba(255, 140, 0, 0.1);
  }

  .card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .name {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 600;
    color: #ffffff;
  }

  .exercise-count {
    background: rgba(255, 140, 0, 0.15);
    color: #ffd9b8;
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 500;
    white-space: nowrap;
  }

  .meta {
    display: flex;
    gap: 1rem;
    font-size: 0.9rem;
    color: #c5c5c5;
  }

  .duration {
    font-weight: 500;
  }

  .level-badge {
    font-weight: 500;
  }

  .categories {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .category-tag {
    background: rgba(255, 255, 255, 0.03);
    color: #ffd9b8;
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
    font-size: 0.8rem;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 0.25rem;
  }

  .btn-start,
  .btn-delete {
    padding: 0.45rem 0.7rem;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 120ms ease;
  }

  .btn-start {
    background: #FF8C00;
    color: #111111;
  }

  .btn-start:hover {
    background: #ff9d1f;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(255, 140, 0, 0.3);
  }

  .btn-start:active {
    transform: translateY(0);
  }

  .btn-delete {
    background: rgba(255, 255, 255, 0.06);
    color: #f5f5f5;
  }

  .btn-delete:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #ffffff;
  }

  .btn-delete:active {
    background: rgba(255, 255, 255, 0.09);
  }

  .btn-start:disabled,
  .btn-delete:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>