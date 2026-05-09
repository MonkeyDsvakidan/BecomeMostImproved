<script>
  import { page } from '$app/stores'
  import { onMount, onDestroy } from 'svelte'
  import { goto } from '$app/navigation'

  let workout = null
  let loading = true
  let error = ''
  let currentIndex = 0
  let isPaused = false
  let isFinished = false
  let timeRemaining = 0
  let timerInterval = null
  let isTimeUp = false
  let showBreakScreen = false
  let breakTimeRemaining = 10

  $: currentExercise = workout?.exercises?.[currentIndex]
  $: totalExercises = workout?.exercises?.length ?? 0
  $: progressPercent = totalExercises > 0 ? ((currentIndex + 1) / totalExercises) * 100 : 0

  async function loadWorkout() {
    const { id } = $page.params
    loading = true
    error = ''
    try {
      const res = await fetch(`/api/workouts/${id}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || res.statusText)
      }
      workout = await res.json()
      if (workout?.exercises?.length > 0) {
        initializeTimer()
      }
    } catch (e) {
      error = e.message || 'Failed to load workout'
    } finally {
      loading = false
    }
  }

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
    loadWorkout()
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

  function finishWorkout() {
    stopTimer()
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

<section class="page">
  {#if loading}
    <div class="loading">Loading workout…</div>
  {:else if error}
    <div class="error">{error}</div>
  {:else if isFinished}
    <div class="finished-screen">
      <div class="finished-content">
        <h1>🎉 Workout Complete!</h1>
        <p class="finished-text">Great job! You've finished <strong>{workout.name}</strong>.</p>
        <div class="finished-stats">
          <div class="stat">
            <span class="stat-label">Exercises Completed</span>
            <span class="stat-value">{totalExercises}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Total Duration</span>
            <span class="stat-value">{workout.duration} min</span>
          </div>
        </div>
        <button class="btn-back" on:click={goBack}>Back to Workouts</button>
      </div>
    </div>
  {:else if showBreakScreen}
    <div class="break-screen">
      <div class="break-content">
        <h2>Great work! 💪</h2>
        <p class="break-text">Take a short break</p>
        <div class="break-timer">{breakTimeRemaining}s</div>
        <p class="break-next">Next: <strong>{currentIndex + 1 < totalExercises ? workout.exercises[currentIndex + 1].name : 'Finish'}</strong></p>
        <button class="btn-skip-break" on:click={nextExercise}>Skip Break</button>
      </div>
    </div>
  {:else if currentExercise}
    <header class="session-header">
      <h1>{workout.name}</h1>
      <button class="btn-exit" on:click={goBack}>Exit</button>
    </header>

    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" style="width: {progressPercent}%"></div>
      </div>
      <p class="progress-text">Exercise {currentIndex + 1} of {totalExercises}</p>
    </div>

    <div class="exercise-card">
      <h2 class="exercise-name">{currentExercise.name}</h2>

      <p class="exercise-description">{currentExercise.description}</p>

      <div class="exercise-details">
        {#if currentExercise.sets !== undefined}
          <div class="detail-item">
            <span class="detail-label">Sets</span>
            <span class="detail-value">{currentExercise.sets}</span>
          </div>
        {/if}
        {#if currentExercise.reps !== undefined}
          <div class="detail-item">
            <span class="detail-label">Reps</span>
            <span class="detail-value">{currentExercise.reps}</span>
          </div>
        {/if}
        {#if currentExercise.duration !== undefined}
          <div class="detail-item">
            <span class="detail-label">Duration</span>
            <span class="detail-value">{currentExercise.duration} min</span>
          </div>
        {/if}
      </div>

      {#if currentExercise.duration}
        <div class="timer" class:time-up={isTimeUp}>
          <div class="timer-display">{formatTime(timeRemaining)}</div>
          <div class="timer-note">{isTimeUp ? "Time's Up!" : isPaused ? 'Paused' : 'Timer'}</div>
          {#if isTimeUp}
            <button class="btn-time-up" on:click={continueAfterTimeUp}>Continue</button>
          {/if}
        </div>
      {/if}

      <div class="exercise-categories">
        {#each currentExercise.category ?? [] as cat}
          <span class="category-badge">{cat}</span>
        {/each}
      </div>
    </div>

    <div class="controls">
      <button class="btn-control btn-pause" on:click={togglePause}>
        {isPaused ? '▶ Resume' : '⏸ Pause'}
      </button>
      <button class="btn-control btn-skip" on:click={skipExercise}>Skip</button>
      <button class="btn-control btn-next" on:click={nextExercise}>
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

  .session-header h1 {
    margin: 0;
    font-size: 1.5rem;
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

  .finished-content h1 {
    margin: 0;
    font-size: 2.5rem;
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

  .break-content h2 {
    margin: 0;
    font-size: 2rem;
    color: #4caf50;
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