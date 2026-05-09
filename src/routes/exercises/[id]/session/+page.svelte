<script>
  import { page } from '$app/stores'
  import { onMount, onDestroy } from 'svelte'
  import { goto } from '$app/navigation'

  let exercise = null
  let loading = true
  let error = ''
  let isPaused = false
  let isFinished = false
  let timeRemaining = 0
  let timerInterval = null
  let isTimeUp = false

  async function loadExercise() {
    const { id } = $page.params
    loading = true
    error = ''
    try {
      const res = await fetch(`/api/exercises/${id}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || res.statusText)
      }
      exercise = await res.json()
      initializeTimer()
    } catch (e) {
      error = e.message || 'Failed to load exercise'
    } finally {
      loading = false
    }
  }

  function initializeTimer() {
    isTimeUp = false
    isFinished = false
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

  function togglePause() {
    isPaused = !isPaused
    if (!isPaused && timeRemaining > 0) {
      startTimer()
    } else {
      stopTimer()
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

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  function handleFinish() {
    isFinished = true
    stopTimer()
  }

  onMount(() => {
    loadExercise()
  })

  onDestroy(() => {
    stopTimer()
  })
</script>

<section class="session">
  {#if loading}
    <div class="loading">Loading exercise…</div>
  {:else if error}
    <div class="error">{error}</div>
    <a href="/exercises" class="btn-back">Back to Exercises</a>
  {:else if exercise}
    {#if !isFinished}
      <header class="session-header">
        <h1>{exercise.name}</h1>
        <p class="description">{exercise.description}</p>
      </header>

      <div class="exercise-details">
        <div class="detail-box">
          <span class="label">Sets</span>
          <span class="value">{exercise.sets}</span>
        </div>
        <div class="detail-box">
          <span class="label">Reps</span>
          <span class="value">{exercise.reps}</span>
        </div>
        <div class="detail-box">
          <span class="label">Level</span>
          <span class="value">{exercise.level}</span>
        </div>
      </div>

      {#if exercise.categories && exercise.categories.length > 0}
        <div class="categories">
          {#each exercise.categories as cat}
            <span class="category-tag">{cat}</span>
          {/each}
        </div>
      {/if}

      <div class="timer-container">
        <div class="timer" class:time-up={isTimeUp}>
          {formatTime(timeRemaining)}
        </div>
      </div>

      <div class="controls">
        <button
          class="btn-pause"
          on:click={togglePause}
          disabled={timeRemaining === 0}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button class="btn-finish" on:click={handleFinish}>
          Finish Exercise
        </button>
      </div>
    {:else}
      <div class="completion">
        <div class="celebration">🎉</div>
        <h2>Exercise Complete!</h2>
        <p class="stats">
          <strong>{exercise.name}</strong> - {exercise.duration} minutes
        </p>
        <a href="/exercises" class="btn-back">Back to Exercises</a>
      </div>
    {/if}
  {/if}
</section>

<style>
  .session {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 1.25rem;
    background: #1a1a1a;
    color: #f5f5f5;
  }

  .loading,
  .error {
    text-align: center;
    padding: 2rem;
    font-size: 1.1rem;
  }

  .error {
    color: #ff9999;
  }

  .session-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .session-header h1 {
    margin: 0 0 0.5rem;
    font-size: 2rem;
    font-weight: 700;
  }

  .description {
    margin: 0;
    color: #b0b0b0;
    font-size: 1rem;
    line-height: 1.5;
  }

  .exercise-details {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    width: 100%;
    max-width: 600px;
    margin-bottom: 2rem;
  }

  .detail-box {
    background: #2a2a2a;
    border: 1px solid rgba(255, 140, 0, 0.15);
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .label {
    color: #b0b0b0;
    font-size: 0.85rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    color: #FF8C00;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .categories {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
    max-width: 600px;
    margin-bottom: 2rem;
  }

  .category-tag {
    background: rgba(255, 140, 0, 0.08);
    color: #ffd9b8;
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .timer-container {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-bottom: 3rem;
  }

  .timer {
    font-size: 5rem;
    font-weight: 700;
    color: #f5f5f5;
    font-family: 'Courier New', monospace;
    letter-spacing: 0.1em;
    text-align: center;
    min-width: 300px;
    padding: 2rem;
    border: 3px solid rgba(255, 140, 0, 0.2);
    border-radius: 16px;
    background: rgba(255, 140, 0, 0.02);
    transition: all 300ms ease;
  }

  .timer.time-up {
    color: #4ADE80;
    border-color: #4ADE80;
    background: rgba(74, 222, 128, 0.05);
    animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  .controls {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
    max-width: 600px;
  }

  .btn-pause,
  .btn-finish,
  .btn-back {
    padding: 0.7rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    border: none;
    text-decoration: none;
    display: inline-block;
    text-align: center;
    transition: all 120ms ease;
  }

  .btn-pause {
    background: #FF8C00;
    color: #111;
  }

  .btn-pause:hover:not(:disabled) {
    background: #ff9d1f;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 140, 0, 0.3);
  }

  .btn-pause:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-finish {
    background: #555;
    color: #f5f5f5;
  }

  .btn-finish:hover {
    background: #666;
    transform: translateY(-2px);
  }

  .completion {
    text-align: center;
    padding: 2rem;
  }

  .celebration {
    font-size: 4rem;
    margin-bottom: 1rem;
    animation: bounce 1s ease-in-out;
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  .completion h2 {
    margin: 0 0 1rem;
    font-size: 2.5rem;
    color: #4ADE80;
  }

  .stats {
    margin: 0 0 2rem;
    color: #b0b0b0;
    font-size: 1.05rem;
  }

  .btn-back {
    background: #FF8C00;
    color: #111;
    padding: 0.7rem 2rem;
    margin-top: 1rem;
  }

  .btn-back:hover {
    background: #ff9d1f;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 140, 0, 0.3);
  }

  @media (max-width: 640px) {
    .session {
      padding: 1rem;
    }

    .session-header h1 {
      font-size: 1.5rem;
    }

    .exercise-details {
      grid-template-columns: 1fr;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .timer {
      font-size: 3.5rem;
      min-width: 200px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .controls {
      flex-direction: column;
      gap: 0.75rem;
    }

    .btn-pause,
    .btn-finish {
      width: 100%;
    }

    .completion h2 {
      font-size: 1.8rem;
    }
  }
</style>