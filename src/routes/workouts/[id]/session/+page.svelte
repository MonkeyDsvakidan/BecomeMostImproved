<script>
  import { onMount, onDestroy } from 'svelte'
  import { goto } from '$app/navigation'

  export let data

  let workout = data?.workout ?? null
  let loading = false
  let error = data?.error ?? ''
  let currentIndex = 0
  let isPaused = false
  let isFinished = false
  let timeRemaining = 0
  let timerInterval = null
  let isTimeUp = false
  let showBreakScreen = false
  let breakTimeRemaining = 10
  let sessionStartedAt = 0

  $: currentExercise = workout?.exercises?.[currentIndex]
  $: totalExercises = workout?.exercises?.length ?? 0
  $: progressPercent = totalExercises > 0 ? ((currentIndex + 1) / totalExercises) * 100 : 0

  function initializeTimer() {
    isTimeUp = false
    showBreakScreen = false
    const exercise = workout?.exercises?.[currentIndex]
    timeRemaining = (exercise?.duration ?? 0) * 60
    if (timeRemaining > 0) {
      startTimer()
    }
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval)
    timerInterval = setInterval(() => {
      if (!isPaused && timeRemaining > 0) {
        timeRemaining--
        if (timeRemaining === 0) {
          isTimeUp = true
          stopTimer()
          playTimerSound()
        }
      }
    }, 1000)
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  function playTimerSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (e) {
      // Fallback if audio API not available
    }
  }

  onMount(() => {
    sessionStartedAt = Date.now()
    if (workout?.exercises?.length > 0) {
      initializeTimer()
    }
  })

  onDestroy(() => {
    stopTimer()
  })

  function nextExercise() {
    stopTimer()
    if (currentIndex < totalExercises - 1) {
      currentIndex++
      isPaused = false
      isTimeUp = false
      showBreakScreen = false
      initializeTimer()
    } else {
      finishWorkout()
    }
  }

  function skipExercise() {
    nextExercise()
  }

  function togglePause() {
    isPaused = !isPaused
    if (!isPaused && timeRemaining > 0) {
      startTimer()
    } else {
      stopTimer()
    }
  }

  function continueAfterTimeUp() {
    if (currentIndex < totalExercises - 1) {
      showBreakScreen = true
      breakTimeRemaining = 10
      startBreakTimer()
    } else {
      finishWorkout()
    }
  }

  function startBreakTimer() {
    if (timerInterval) clearInterval(timerInterval)
    timerInterval = setInterval(() => {
      breakTimeRemaining--
      if (breakTimeRemaining === 0) {
        stopTimer()
        nextExercise()
      }
    }, 1000)
  }

  async function finishWorkout() {
    stopTimer()
    if (workout?._id) {
      const actualDurationSeconds = sessionStartedAt > 0 ? Math.max(0, Math.round((Date.now() - sessionStartedAt) / 1000)) : 0
      fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workoutId: workout._id,
          workoutName: workout.name,
          startedAt: new Date(sessionStartedAt).toISOString(),
          completedAt: new Date().toISOString(),
          exerciseCount: totalExercises,
          plannedDuration: workout.duration ?? 0,
          actualDurationSeconds,
          level: workout.level ?? 'N/A',
          categories: workout.categories ?? []
        })
      }).catch((error) => {
        console.error('Failed to save session', error)
      })
    }
    isFinished = true
  }

  function goBack() {
    stopTimer()
    goto('/workouts')
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
</script>

<section class="container py-4 workout-session">
  {#if loading}
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status" aria-label="Loading workout"></div>
      <p class="mt-3 text-secondary mb-0">Loading workout…</p>
    </div>
  {:else if error}
    <div class="alert alert-danger rounded-3 shadow-sm">{error}</div>
  {:else if isFinished}
    <div class="card bg-dark border-secondary shadow-lg rounded-3 mx-auto" style="max-width: 760px;">
      <div class="card-body p-4 p-md-5 text-center">
        <div class="display-4 mb-3">🎉</div>
        <h1 class="display-6 fw-bold mb-3">Workout Complete!</h1>
        <p class="text-secondary mb-4">Great job! You've finished <strong class="text-light">{workout.name}</strong>.</p>
        <div class="row g-3 mb-4">
          <div class="col-12 col-md-6">
            <div class="p-3 bg-black bg-opacity-25 border border-secondary rounded-3 h-100">
              <div class="text-secondary small">Exercises Completed</div>
              <div class="display-6 fw-bold text-primary">{totalExercises}</div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="p-3 bg-black bg-opacity-25 border border-secondary rounded-3 h-100">
              <div class="text-secondary small">Total Duration</div>
              <div class="display-6 fw-bold text-primary">{workout.duration} min</div>
            </div>
          </div>
        </div>
        <button class="btn btn-primary btn-orange btn-lg" on:click={goBack}>Back to Workouts</button>
      </div>
    </div>
  {:else if showBreakScreen}
    <div class="alert alert-warning border-0 shadow-sm rounded-3 mx-auto" style="max-width: 760px;">
      <div class="d-flex flex-column align-items-center text-center gap-3 py-3">
        <div class="display-5">💪</div>
        <h2 class="h3 fw-bold mb-0">Great work!</h2>
        <p class="mb-0">Take a short break before the next exercise.</p>
        <div class="display-4 fw-bold text-dark bg-white rounded-3 px-4 py-2">{breakTimeRemaining}s</div>
        <p class="mb-0">Next: <strong>{currentIndex + 1 < totalExercises ? workout.exercises[currentIndex + 1].name : 'Finish'}</strong></p>
        <button class="btn btn-dark" on:click={nextExercise}>Skip Break</button>
      </div>
    </div>
  {:else if totalExercises === 0}
    <div class="card bg-dark border-secondary shadow-sm rounded-3 mx-auto" style="max-width: 760px;">
      <div class="card-body p-5 text-center">
        <div class="display-4 mb-3">❌</div>
        <h1 class="h2 fw-bold">No Exercises</h1>
        <p class="text-secondary mb-3">This workout doesn't have any exercises yet.</p>
        <p class="text-secondary">Add exercises to this workout before you can start it.</p>
        <a href="/workouts" class="btn btn-outline-light">Back to Workouts</a>
      </div>
    </div>
  {:else if currentExercise}
    <div class="d-flex justify-content-between align-items-center gap-3 mb-3">
      <div>
        <h1 class="display-6 fw-bold mb-1">{workout.name}</h1>
        <p class="text-secondary mb-0">Exercise {currentIndex + 1} of {totalExercises}</p>
      </div>
      <button class="btn btn-outline-light" on:click={goBack}>Exit</button>
    </div>

    <div class="progress mb-4" style="height: 10px;">
      <div class="progress-bar bg-primary" role="progressbar" style="width: {progressPercent}%" aria-valuenow={progressPercent} aria-valuemin="0" aria-valuemax="100"></div>
    </div>

    <div class="card bg-dark border-secondary shadow-lg rounded-3 mb-4">
      <div class="card-body p-4 p-md-5 d-flex flex-column gap-4">
        <div class="d-flex flex-column gap-2">
          <h2 class="display-6 fw-bold mb-0">{currentExercise.name}</h2>
          <p class="text-secondary mb-0">{currentExercise.description}</p>
        </div>

        <div class="row g-3">
          {#if currentExercise.sets !== undefined}
            <div class="col-12 col-md-4">
              <div class="p-3 rounded-3 bg-black bg-opacity-25 border border-secondary h-100 text-center">
                <div class="text-secondary small">Sets</div>
                <div class="display-6 fw-bold text-primary">{currentExercise.sets}</div>
              </div>
            </div>
          {/if}
          {#if currentExercise.reps !== undefined}
            <div class="col-12 col-md-4">
              <div class="p-3 rounded-3 bg-black bg-opacity-25 border border-secondary h-100 text-center">
                <div class="text-secondary small">Reps</div>
                <div class="display-6 fw-bold text-primary">{currentExercise.reps}</div>
              </div>
            </div>
          {/if}
          {#if currentExercise.duration !== undefined}
            <div class="col-12 col-md-4">
              <div class="p-3 rounded-3 bg-black bg-opacity-25 border border-secondary h-100 text-center">
                <div class="text-secondary small">Duration</div>
                <div class="display-6 fw-bold text-primary">{currentExercise.duration} min</div>
              </div>
            </div>
          {/if}
        </div>

        {#if currentExercise.duration}
          <div class={`text-center p-4 rounded-3 border ${isTimeUp ? 'bg-success bg-opacity-10 border-success' : 'bg-black bg-opacity-25 border-secondary'}`}>
            <div class="display-1 fw-bold timer-display mb-2">{formatTime(timeRemaining)}</div>
            <div class="text-secondary mb-3">{isTimeUp ? "Time's Up!" : isPaused ? 'Paused' : 'Timer'}</div>
            {#if isTimeUp}
              <button class="btn btn-primary btn-orange" on:click={continueAfterTimeUp}>Continue</button>
            {/if}
          </div>
        {/if}

        <div class="d-flex flex-wrap gap-2">
          {#each currentExercise.category ?? [] as cat}
            <span class="badge rounded-pill bg-secondary text-light px-3 py-2">{cat}</span>
          {/each}
        </div>
      </div>
    </div>

    <div class="d-flex flex-column flex-md-row gap-2 justify-content-end">
      <button class="btn btn-outline-warning" on:click={togglePause}>
        {isPaused ? '▶ Resume' : '⏸ Pause'}
      </button>
      <button class="btn btn-outline-light" on:click={skipExercise}>Skip</button>
      <button class="btn btn-primary btn-orange" on:click={nextExercise}>
        {currentIndex < totalExercises - 1 ? 'Next Exercise' : 'Finish Workout'}
      </button>
    </div>
  {/if}
</section>

<style>
  .page {
    max-width: 900px;
    margin: 0 auto;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .loading,
  .error {
    padding: 2rem;
    text-align: center;
    color: #ccc;
    font-size: 1.1rem;
  }

  .error {
    color: #ff9999;
  }

  .session-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .btn-exit {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.06);
    color: #f5f5f5;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 120ms ease;
  }

  .btn-exit:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .progress-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .progress-bar {
    height: 8px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 999px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #FF8C00, #ffb366);
    transition: width 400ms ease;
  }

  .progress-text {
    margin: 0;
    font-size: 0.9rem;
    color: #b0b0b0;
    text-align: center;
  }

  .exercise-card {
    background: #2a2a2a;
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
  }

  .exercise-name {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 700;
    color: #ffffff;
  }

  .exercise-description {
    margin: 0;
    color: #d3d3d3;
    font-size: 1rem;
    line-height: 1.6;
  }

  .exercise-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1.5rem;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(255, 140, 0, 0.08);
    border-radius: 10px;
  }

  .detail-label {
    color: #b0b0b0;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .detail-value {
    color: #FF8C00;
    font-size: 1.6rem;
    font-weight: 700;
  }

  .timer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 2rem;
    background: rgba(255, 140, 0, 0.12);
    border-radius: 12px;
    border: 2px solid rgba(255, 140, 0, 0.3);
  }

  .timer.time-up {
    background: rgba(76, 175, 80, 0.12);
    border-color: rgba(76, 175, 80, 0.4);
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.02);
    }
  }

  .timer-display {
    font-size: 3.5rem;
    font-weight: 700;
    color: #FF8C00;
    font-family: 'Courier New', monospace;
    letter-spacing: 0.05em;
  }

  .timer.time-up .timer-display {
    color: #4caf50;
  }

  .timer-note {
    color: #b0b0b0;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .btn-time-up {
    background: #4caf50;
    color: #111;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 0.5rem;
    transition: all 120ms ease;
  }

  .btn-time-up:hover {
    background: #66bb6a;
    transform: translateY(-1px);
  }

  .exercise-categories {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .category-badge {
    background: rgba(255, 255, 255, 0.03);
    color: #ffd9b8;
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    font-size: 0.85rem;
  }

  .controls {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .btn-control {
    padding: 0.8rem 1rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 120ms ease;
  }

  .btn-pause {
    background: rgba(255, 140, 0, 0.2);
    border: 1px solid rgba(255, 140, 0, 0.4);
    color: #ffd9b8;
  }

  .btn-pause:hover {
    background: rgba(255, 140, 0, 0.3);
    border-color: #FF8C00;
    transform: translateY(-2px);
  }

  .btn-skip {
    background: rgba(255, 255, 255, 0.06);
    color: #f5f5f5;
  }

  .btn-skip:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
  }

  .btn-next {
    background: #FF8C00;
    color: #111111;
  }

  .btn-next:hover {
    background: #ff9d1f;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(255, 140, 0, 0.4);
  }

  .finished-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
  }

  .finished-content {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
  }

  .finished-text {
    color: #d3d3d3;
    font-size: 1.1rem;
    margin: 0;
  }

  .finished-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1.5rem;
    background: rgba(255, 140, 0, 0.1);
    border-radius: 10px;
  }

  .stat-label {
    color: #b0b0b0;
    font-size: 0.9rem;
  }

  .stat-value {
    color: #FF8C00;
    font-size: 2rem;
    font-weight: 700;
  }

  .btn-back {
    background: #FF8C00;
    color: #111;
    border: none;
    padding: 0.6rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 120ms ease;
  }

  .btn-back:hover {
    background: #ff9d1f;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(255, 140, 0, 0.3);
  }

  .break-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
  }

  .break-content {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
    padding: 2rem;
    background: rgba(76, 175, 80, 0.1);
    border: 2px solid rgba(76, 175, 80, 0.3);
    border-radius: 12px;
  }

  .break-text {
    color: #d3d3d3;
    font-size: 1.1rem;
    margin: 0;
  }

  .break-timer {
    font-size: 3rem;
    font-weight: 700;
    color: #4caf50;
    font-family: 'Courier New', monospace;
  }

  .break-next {
    color: #b0b0b0;
    margin: 0;
    font-size: 0.95rem;
  }

  .btn-skip-break {
    background: transparent;
    border: 1px solid rgba(76, 175, 80, 0.4);
    color: #4caf50;
    padding: 0.5rem 1.2rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 120ms ease;
  }

  .btn-skip-break:hover {
    background: rgba(76, 175, 80, 0.1);
    border-color: #4caf50;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
  }

  .empty-content {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
    padding: 2rem;
    background: rgba(255, 100, 100, 0.1);
    border: 2px solid rgba(255, 100, 100, 0.3);
    border-radius: 12px;
    max-width: 400px;
  }

  .empty-text {
    color: #d3d3d3;
    font-size: 1.1rem;
    margin: 0;
    font-weight: 600;
  }

  .empty-desc {
    color: #b0b0b0;
    font-size: 0.95rem;
    margin: 0;
  }

  .btn-back-to-workouts {
    background: #FF8C00;
    color: #111;
    border: none;
    padding: 0.7rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    text-decoration: none;
    display: inline-block;
    cursor: pointer;
    transition: all 120ms ease;
    margin-top: 0.5rem;
  }

  .btn-back-to-workouts:hover {
    background: #ff9d1f;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 140, 0, 0.3);
  }

  @media (max-width: 640px) {
    .page {
      padding: 0.75rem;
    }

    .exercise-card {
      padding: 1.25rem;
    }

    .exercise-name {
      font-size: 1.4rem;
    }

    .timer-display {
      font-size: 2.5rem;
    }

    .break-timer {
      font-size: 2rem;
    }

    .break-content {
      padding: 1.5rem;
    }

    .controls {
      grid-template-columns: 1fr;
    }

    .finished-stats {
      grid-template-columns: 1fr;
    }
  }
</style>