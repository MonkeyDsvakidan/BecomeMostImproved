<script>
  export let data

  $: workouts = data?.workouts ?? []
  $: exercises = data?.exercises ?? []
  $: featuredWorkouts = data?.featuredWorkouts ?? []
  $: recentActivity = data?.recentActivity ?? []
  $: stats = data?.stats ?? {}
  $: totalWorkouts = stats.totalWorkouts ?? workouts.length
  $: totalExercises = stats.totalExercises ?? exercises.length
</script>

<svelte:head>
  <title>BallToTheTop - Home</title>
  <meta name="description" content="Transform your fitness journey with BallToTheTop" />
</svelte:head>

<section class="dashboard">
  <header class="hero">
    <div class="hero-content">
      <h1 class="title">Welcome to BallToTheTop</h1>
      <p class="subtitle">Transform your fitness journey one workout at a time</p>
    </div>
  </header>

  <section class="stats-section">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🏋️</div>
        <div class="stat-info">
          <span class="stat-label">Total Workouts</span>
          <span class="stat-number">{totalWorkouts}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💪</div>
        <div class="stat-info">
          <span class="stat-label">Total Exercises</span>
          <span class="stat-number">{totalExercises}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <span class="stat-label">Completed This Week</span>
          <span class="stat-number">{stats.workoutsCompletedThisWeek ?? 0}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏱</div>
        <div class="stat-info">
          <span class="stat-label">Training Minutes</span>
          <span class="stat-number">{stats.totalTrainingMinutes ?? 0}</span>
        </div>
      </div>
    </div>
  </section>

  <section class="insights-section">
    <div class="insights-grid">
      <article class="insight-card">
        <h2 class="section-title">Workout Mix</h2>
        <div class="insight-list">
          {#each Object.entries(stats.levelDistribution ?? {}) as [level, count]}
            <div class="insight-row">
              <span>{level}</span>
              <strong>{count}</strong>
            </div>
          {/each}
          {#if Object.keys(stats.levelDistribution ?? {}).length === 0}
            <p class="muted-text">No workout levels yet.</p>
          {/if}
        </div>
      </article>

      <article class="insight-card">
        <h2 class="section-title">Top Categories</h2>
        <div class="insight-list">
          {#each stats.topCategories ?? [] as item}
            <div class="insight-row">
              <span>{item.name}</span>
              <strong>{item.count}</strong>
            </div>
          {/each}
          {#if (stats.topCategories ?? []).length === 0}
            <p class="muted-text">No workout categories yet.</p>
          {/if}
        </div>
      </article>
    </div>
  </section>

  {#if featuredWorkouts.length > 0}
    <section class="featured-section">
      <h2 class="section-title">Featured Workouts</h2>
      <div class="workouts-grid">
        {#each featuredWorkouts as workout (workout._id)}
          <article class="workout-card">
            <div class="card-header">
              <h3 class="workout-name">{workout.name}</h3>
              <span class="exercise-badge">{workout.exercises?.length ?? 0}</span>
            </div>

            <div class="card-meta">
              <span class="duration">⏱ {workout.duration} min</span>
              <span class="level">{workout.level}</span>
            </div>

            {#if workout.categories && workout.categories.length > 0}
              <div class="categories">
                {#each workout.categories as cat}
                  <span class="category-pill">{cat}</span>
                {/each}
              </div>
            {/if}

            <a href="/workouts/{workout._id}/session" class="btn-start">
              Start Workout
            </a>
          </article>
        {/each}
      </div>
    </section>
  {/if}

  {#if recentActivity.length > 0}
    <section class="recent-section">
      <h2 class="section-title">Recent Activity</h2>
      <div class="recent-list">
        {#each recentActivity as session (session._id)}
          <article class="recent-card">
            <div class="recent-main">
              <strong>{session.workoutName}</strong>
              <span>{new Date(session.completedAt).toLocaleString()}</span>
            </div>
            <div class="recent-meta">
              <span>{session.exerciseCount} exercises</span>
              <span>{session.actualDurationSeconds > 0 ? `${Math.round(session.actualDurationSeconds / 60)} min` : `${session.plannedDuration} min`}</span>
              <span>{session.level}</span>
            </div>
          </article>
        {/each}
      </div>
    </section>
  {/if}

  <section class="cta-section">
    <div class="cta-grid">
      {#if totalWorkouts > 3}
        <a href="/workouts" class="cta-card">
          <span class="cta-icon">🎯</span>
          <span class="cta-text">View All Workouts</span>
        </a>
      {/if}
      {#if totalExercises > 0}
        <a href="/exercises" class="cta-card">
          <span class="cta-icon">📋</span>
          <span class="cta-text">Browse Exercises</span>
        </a>
      {/if}
      <a href="/workouts/new" class="cta-card cta-create">
        <span class="cta-icon">➕</span>
        <span class="cta-text">Create Workout</span>
      </a>
    </div>
  </section>
</section>

<style>
  .dashboard {
    padding: 0;
  }

  .hero {
    background: linear-gradient(135deg, rgba(255, 140, 0, 0.2), rgba(255, 140, 0, 0.05));
    border-bottom: 1px solid rgba(255, 140, 0, 0.2);
    padding: 3rem 1.25rem;
    text-align: center;
  }

  .hero-content {
    max-width: 900px;
    margin: 0 auto;
  }

  .title {
    margin: 0 0 0.5rem;
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #FF8C00, #ffb366);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    margin: 0;
    color: #b0b0b0;
    font-size: 1.15rem;
    font-weight: 400;
  }

  .loading,
  .error {
    text-align: center;
    padding: 2rem;
    color: #ccc;
  }

  .error {
    color: #ff9999;
  }

  .stats-section {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2.5rem 1.25rem;
  }

  .insights-section,
  .recent-section {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 1.25rem 2.5rem;
  }

  .insights-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
  }

  .insight-card,
  .recent-card {
    background: #2a2a2a;
    border: 1px solid rgba(255, 140, 0, 0.15);
    border-radius: 12px;
    padding: 1.25rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .insight-list,
  .recent-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .insight-row,
  .recent-main,
  .recent-meta {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
  }

  .recent-card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .recent-main span,
  .muted-text {
    color: #b0b0b0;
    font-size: 0.9rem;
  }

  .recent-meta {
    flex-wrap: wrap;
    color: #ffd9b8;
    font-size: 0.9rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .stat-card {
    background: #2a2a2a;
    border: 1px solid rgba(255, 140, 0, 0.15);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: all 160ms ease;
  }

  .stat-card:hover {
    border-color: rgba(255, 140, 0, 0.3);
    box-shadow: 0 6px 16px rgba(255, 140, 0, 0.15);
  }

  .stat-icon {
    font-size: 2.5rem;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .stat-label {
    color: #b0b0b0;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .stat-number {
    color: #FF8C00;
    font-size: 1.8rem;
    font-weight: 700;
  }

  .featured-section {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2.5rem 1.25rem;
  }

  .section-title {
    margin: 0 0 1.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: #ffffff;
  }

  .workouts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .workout-card {
    background: #2a2a2a;
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    transition: all 160ms ease;
  }

  .workout-card:hover {
    border-color: rgba(255, 140, 0, 0.3);
    box-shadow: 0 8px 20px rgba(255, 140, 0, 0.15);
    transform: translateY(-2px);
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .workout-name {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 600;
    color: #ffffff;
  }

  .exercise-badge {
    background: rgba(255, 140, 0, 0.15);
    color: #ffd9b8;
    padding: 0.3rem 0.7rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .card-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.9rem;
    color: #b0b0b0;
  }

  .duration {
    font-weight: 500;
  }

  .level {
    background: rgba(255, 140, 0, 0.08);
    color: #ffd9b8;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
  }

  .categories {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .category-pill {
    background: rgba(255, 255, 255, 0.03);
    color: #ffd9b8;
    padding: 0.25rem 0.6rem;
    border-radius: 6px;
    font-size: 0.8rem;
  }

  .btn-start {
    background: #FF8C00;
    color: #111111;
    border: none;
    padding: 0.6rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    text-decoration: none;
    display: inline-block;
    text-align: center;
    cursor: pointer;
    transition: all 120ms ease;
    margin-top: auto;
  }

  .btn-start:hover {
    background: #ff9d1f;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 140, 0, 0.3);
  }

  .cta-section {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2.5rem 1.25rem;
  }

  .cta-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .cta-card {
    background: rgba(255, 140, 0, 0.08);
    border: 2px solid rgba(255, 140, 0, 0.2);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    color: #ffffff;
    transition: all 160ms ease;
  }

  .cta-card:hover {
    background: rgba(255, 140, 0, 0.15);
    border-color: #FF8C00;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 140, 0, 0.2);
  }

  .cta-card.cta-create {
    background: rgba(255, 140, 0, 0.15);
    border-color: #FF8C00;
  }

  .cta-card.cta-create:hover {
    background: rgba(255, 140, 0, 0.25);
    box-shadow: 0 8px 20px rgba(255, 140, 0, 0.3);
  }

  .cta-icon {
    font-size: 1.8rem;
  }

  .cta-text {
    font-weight: 600;
    text-align: center;
  }

  @media (max-width: 640px) {
    .hero {
      padding: 2rem 1rem;
    }

    .title {
      font-size: 1.8rem;
    }

    .subtitle {
      font-size: 1rem;
    }

    .stats-section,
    .featured-section,
    .cta-section {
      padding: 1.5rem 0.75rem;
    }

    .workouts-grid,
    .cta-grid {
      grid-template-columns: 1fr;
    }

    .stat-card {
      padding: 1.25rem;
    }

    .workout-card {
      padding: 1.25rem;
    }
  }
</style>
