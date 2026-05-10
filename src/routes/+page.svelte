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

<section class="container py-4 dashboard">
  <div class="card bg-dark border-secondary shadow-lg rounded-3 mb-4 hero-card">
    <div class="card-body p-4 p-md-5 text-center text-md-start d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
      <div>
        <h1 class="display-5 fw-bold mb-2">Welcome to BallToTheTop</h1>
        <p class="lead text-secondary mb-0">Transform your fitness journey one workout at a time.</p>
      </div>
      <a href="/workouts/new" class="btn btn-primary btn-orange btn-lg">Create Workout</a>
    </div>
  </div>

  <div class="row g-4 mb-4">
    <div class="col-12 col-md-6 col-xl-3">
      <div class="card bg-dark border-secondary shadow-sm h-100 rounded-3 stat-card">
        <div class="card-body d-flex align-items-center gap-3">
          <div class="display-6">🏋️</div>
          <div>
            <div class="text-secondary small">Total Workouts</div>
            <div class="display-6 fw-bold text-primary mb-0">{totalWorkouts}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-6 col-xl-3">
      <div class="card bg-dark border-secondary shadow-sm h-100 rounded-3 stat-card">
        <div class="card-body d-flex align-items-center gap-3">
          <div class="display-6">💪</div>
          <div>
            <div class="text-secondary small">Total Exercises</div>
            <div class="display-6 fw-bold text-primary mb-0">{totalExercises}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-6 col-xl-3">
      <div class="card bg-dark border-secondary shadow-sm h-100 rounded-3 stat-card">
        <div class="card-body d-flex align-items-center gap-3">
          <div class="display-6">✅</div>
          <div>
            <div class="text-secondary small">Completed This Week</div>
            <div class="display-6 fw-bold text-primary mb-0">{stats.workoutsCompletedThisWeek ?? 0}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-6 col-xl-3">
      <div class="card bg-dark border-secondary shadow-sm h-100 rounded-3 stat-card">
        <div class="card-body d-flex align-items-center gap-3">
          <div class="display-6">⏱</div>
          <div>
            <div class="text-secondary small">Training Minutes</div>
            <div class="display-6 fw-bold text-primary mb-0">{stats.totalTrainingMinutes ?? 0}</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="row g-4 mb-4">
    <div class="col-12 col-lg-6">
      <div class="card bg-dark border-secondary shadow-sm h-100 rounded-3">
        <div class="card-body">
          <h2 class="h5 fw-bold mb-3">Workout Mix</h2>
          <div class="list-group list-group-flush rounded-3 overflow-hidden">
            {#each Object.entries(stats.levelDistribution ?? {}) as [level, count]}
              <div class="list-group-item bg-dark text-light border-secondary d-flex justify-content-between align-items-center">
                <span>{level}</span>
                <span class="badge bg-primary rounded-pill text-dark">{count}</span>
              </div>
            {/each}
          </div>
          {#if Object.keys(stats.levelDistribution ?? {}).length === 0}
            <p class="text-secondary mb-0">No workout levels yet.</p>
          {/if}
        </div>
      </div>
    </div>

    <div class="col-12 col-lg-6">
      <div class="card bg-dark border-secondary shadow-sm h-100 rounded-3">
        <div class="card-body">
          <h2 class="h5 fw-bold mb-3">Top Categories</h2>
          <div class="list-group list-group-flush rounded-3 overflow-hidden">
            {#each stats.topCategories ?? [] as item}
              <div class="list-group-item bg-dark text-light border-secondary d-flex justify-content-between align-items-center">
                <span>{item.name}</span>
                <span class="badge bg-secondary rounded-pill">{item.count}</span>
              </div>
            {/each}
          </div>
          {#if (stats.topCategories ?? []).length === 0}
            <p class="text-secondary mb-0">No workout categories yet.</p>
          {/if}
        </div>
      </div>
    </div>
  </div>

  {#if featuredWorkouts.length > 0}
    <div class="mb-4">
      <h2 class="h4 fw-bold mb-3">Featured Workouts</h2>
      <div class="row g-4">
        {#each featuredWorkouts as workout (workout._id)}
          <div class="col-12 col-md-6 col-xl-4">
            <article class="card bg-dark text-light border border-secondary shadow-sm h-100 rounded-3 featured-card">
              <div class="card-header bg-transparent border-secondary d-flex justify-content-between align-items-start">
                <h3 class="h5 mb-0 fw-bold">{workout.name}</h3>
                <span class="badge bg-primary text-dark rounded-pill">{workout.exercises?.length ?? 0}</span>
              </div>
              <div class="card-body d-flex flex-column gap-3">
                <div class="d-flex justify-content-between text-secondary small">
                  <span>⏱ {workout.duration} min</span>
                  <span>{workout.level}</span>
                </div>
                {#if workout.categories && workout.categories.length > 0}
                  <div class="d-flex flex-wrap gap-2">
                    {#each workout.categories as cat}
                      <span class="badge rounded-pill bg-secondary text-light">{cat}</span>
                    {/each}
                  </div>
                {/if}
                <a href="/workouts/{workout._id}/session" class="btn btn-primary btn-orange mt-auto">Start Workout</a>
              </div>
            </article>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if recentActivity.length > 0}
    <div class="mb-4">
      <h2 class="h4 fw-bold mb-3">Recent Activity</h2>
      <div class="row g-3">
        {#each recentActivity as session (session._id)}
          <div class="col-12">
            <div class="card bg-dark border-secondary shadow-sm rounded-3">
              <div class="card-body d-flex flex-column flex-md-row justify-content-between gap-3">
                <div>
                  <h3 class="h6 fw-bold mb-1">{session.workoutName}</h3>
                  <div class="text-secondary small">{new Date(session.completedAt).toLocaleString()}</div>
                </div>
                <div class="d-flex flex-wrap gap-2 align-items-center">
                  <span class="badge bg-secondary text-light rounded-pill">{session.exerciseCount} exercises</span>
                  <span class="badge bg-secondary text-light rounded-pill">{session.actualDurationSeconds > 0 ? `${Math.round(session.actualDurationSeconds / 60)} min` : `${session.plannedDuration} min`}</span>
                  <span class="badge bg-primary text-dark rounded-pill">{session.level}</span>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <div class="row g-3">
    {#if totalWorkouts > 3}
      <div class="col-12 col-md-4">
        <a href="/workouts" class="card bg-dark text-light border-secondary shadow-sm rounded-3 text-decoration-none dashboard-link h-100">
          <div class="card-body text-center py-4">
            <div class="display-6 mb-2">🎯</div>
            <div class="fw-semibold">View All Workouts</div>
          </div>
        </a>
      </div>
    {/if}
    {#if totalExercises > 0}
      <div class="col-12 col-md-4">
        <a href="/exercises" class="card bg-dark text-light border-secondary shadow-sm rounded-3 text-decoration-none dashboard-link h-100">
          <div class="card-body text-center py-4">
            <div class="display-6 mb-2">📋</div>
            <div class="fw-semibold">Browse Exercises</div>
          </div>
        </a>
      </div>
    {/if}
    <div class="col-12 col-md-4">
      <a href="/workouts/new" class="card bg-dark text-light border-secondary shadow-sm rounded-3 text-decoration-none dashboard-link h-100">
        <div class="card-body text-center py-4">
          <div class="display-6 mb-2">➕</div>
          <div class="fw-semibold">Create Workout</div>
        </div>
      </a>
    </div>
  </div>
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

  .dashboard-link {
    transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
  }

  .dashboard-link:hover {
    transform: translateY(-2px);
    box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.35) !important;
    border-color: rgba(255, 140, 0, 0.35) !important;
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
