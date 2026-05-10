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
  <div class="card bg-dark border-secondary shadow-lg rounded-3 mb-4">
    <div class="card-body p-4 p-md-5 d-flex flex-column flex-md-row align-items-center gap-4 gap-md-5">
      <img src="/icon.svg" alt="" aria-hidden="true" class="hero-icon" />
      <div class="text-center text-md-start flex-grow-1">
        <h1 class="display-5 fw-bold mb-2">Welcome to BallToTheTop</h1>
        <p class="lead text-secondary mb-0">Transform your fitness journey one workout at a time.</p>
      </div>
      <a href="/workouts/new" class="btn btn-primary btn-orange btn-lg ms-md-auto">Create Workout</a>
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
            <article class="card bg-dark text-light border border-secondary shadow-sm h-100 rounded-3">
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

  .hero-icon {
    width: 7rem;
    height: 7rem;
    flex: 0 0 auto;
    filter: drop-shadow(0 0.75rem 1.5rem rgba(0, 0, 0, 0.35));
  }

  @media (min-width: 768px) {
    .hero-icon {
      width: 8.5rem;
      height: 8.5rem;
    }
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

  .stat-card {
    transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.35) !important;
    border-color: rgba(255, 140, 0, 0.25) !important;
  }
</style>
