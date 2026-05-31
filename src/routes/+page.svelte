<script>
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	export let data;

	$: workouts = data?.workouts ?? [];
	$: exercises = data?.exercises ?? [];
	$: favoriteWorkouts = data?.favoriteWorkouts ?? [];
	$: recentActivity = data?.recentActivity ?? [];
	$: totalWorkouts = workouts.length;
	$: totalExercises = exercises.length;

	let deletingSession = null;
	let deleteError = '';
	let deleteForm;

	function openDeleteSession(session) {
		deletingSession = session;
		deleteError = '';
	}

	function closeDeleteSession() {
		deletingSession = null;
		deleteError = '';
	}

	function handleDeleteSessionSubmit({ cancel }) {
		if (!deletingSession) {
			cancel();
			return;
		}

		return async ({ result, update }) => {
			if (result.type === 'failure') {
				deleteError = result.data?.error || 'Failed to remove session from history';
				return;
			}

			await update();
			closeDeleteSession();
		};
	}
</script>

<section class="container py-4 dashboard">
	<div class="card bg-dark border-secondary shadow-lg rounded-3 mb-4">
		<div
			class="card-body p-3 p-md-4 d-flex flex-column flex-md-row align-items-center gap-2 gap-md-3"
		>
			<img src="/icon.svg" alt="" aria-hidden="true" class="hero-icon" width="112" height="112" decoding="async" fetchpriority="high" />
			<div class="text-center text-md-start flex-grow-1">
				<h1 class="display-5 fw-bold mb-2">Welcome to BallToTheTop</h1>
				<div class="d-flex flex-wrap gap-3 mt-3">
					{#if totalWorkouts > 3}
						<a href={resolve('/workouts')} class="card action-card text-decoration-none text-center text-light bg-dark border-secondary rounded-3 p-3">
							<div class="display-6 mb-1">🎯</div>
							<div class="fw-semibold">View All Workouts</div>
						</a>
					{/if}
					{#if totalExercises > 0}
						<a href={resolve('/exercises')} class="card action-card text-decoration-none text-center text-light bg-dark border-secondary rounded-3 p-3">
							<div class="display-6 mb-1">📋</div>
							<div class="fw-semibold">Browse Exercises</div>
						</a>
					{/if}
					<a href={resolve('/workouts/new')} class="card action-card text-decoration-none text-center text-light bg-dark border-secondary rounded-3 p-3">
						<div class="display-6 mb-1">➕</div>
						<div class="fw-semibold">Create Workout</div>
					</a>
					<a href={resolve('/exercises/new')} class="card action-card text-decoration-none text-center text-light bg-dark border-secondary rounded-3 p-3">
						<div class="display-6 mb-1">✏️</div>
						<div class="fw-semibold">Create Exercise</div>
					</a>
				</div>
			</div>
		</div>
	</div>

	{#if favoriteWorkouts.length > 0}
		<div class="mb-4">
			<h2 class="h4 fw-bold mb-3">Favorite Workouts</h2>
			<div class="row g-4">
				{#each favoriteWorkouts as workout (workout._id)}
					<div class="col-12 col-md-6 col-xl-4">
						<article
							class="card bg-dark text-light border border-secondary shadow-sm h-100 rounded-3"
						>
							<div
								class="card-header bg-transparent border-secondary d-flex justify-content-between align-items-start"
							>
								<h3 class="h5 mb-0 fw-bold">{workout.name}</h3>
								<span class="badge bg-primary text-dark rounded-pill"
									>{workout.exercises?.length ?? 0}</span
								>
							</div>
							<div class="card-body d-flex flex-column gap-3">
								<div class="d-flex justify-content-between text-secondary small">
									<span>⏱ {workout.duration} min</span>
									<span>{workout.level}</span>
								</div>
								{#if workout.categories && workout.categories.length > 0}
									<div class="d-flex flex-wrap gap-2">
										{#each workout.categories as cat, index (cat + index)}
											<span class="badge rounded-pill bg-primary text-dark">{cat}</span>
										{/each}
									</div>
								{/if}
								<a
									href={resolve(`/workouts/${workout._id}/session`)}
									class="btn btn-primary btn-orange mt-auto">Start Workout</a
								>
							</div>
						</article>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="mb-4">
			<h2 class="h4 fw-bold mb-3">Favorite Workouts</h2>
			<div class="text-secondary">No favorite workouts yet. Click the ⭐ icon on any workout to add it here.</div>
		</div>
	{/if}

	{#if recentActivity.length > 0}
		<div class="mb-4">
			<h2 class="h4 fw-bold mb-3">Recent Activity</h2>
			<div class="row g-3">
				{#each recentActivity as session (session._id)}
					<div class="col-12">
						<div class="card bg-dark border-secondary shadow-sm rounded-3">
							<div class="card-body d-flex flex-column flex-md-row justify-content-between gap-3 align-items-md-center">
								<div>
									<h3 class="h6 fw-bold mb-1 text-light">{session.workoutName}</h3>
									<div class="text-secondary small">
										{new Date(session.completedAt).toLocaleString()}
									</div>
								</div>
								<div class="d-flex flex-wrap gap-2 align-items-center ms-md-auto">
									<span class="badge bg-primary text-dark rounded-pill">
										{session.exerciseCount} exercises</span
									>
									<span class="badge bg-primary text-dark rounded-pill">
										{session.actualDurationLabel ?? '00:00'}</span
									>
									<span class="badge bg-primary text-dark rounded-pill">{session.level}</span>
									<button
										type="button"
										class="btn btn-sm btn-outline-danger session-remove-btn"
										aria-label={`Remove ${session.workoutName} from history`}
										on:click={() => openDeleteSession(session)}
										title="Remove from history"
									>
										×
									</button>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if deletingSession}
		<div class="history-modal-backdrop" role="presentation" on:click={closeDeleteSession}></div>
		<div
			class="history-modal card bg-dark text-light border border-secondary shadow-lg rounded-4"
			role="dialog"
			tabindex="0"
			aria-modal="true"
			aria-labelledby="history-modal-title"
			on:keydown={(event) => event.key === 'Escape' && closeDeleteSession()}
		>
			<div class="card-body p-4 d-flex flex-column gap-3">
				<h2 id="history-modal-title" class="h5 fw-bold mb-0">Remove this workout from history?</h2>
				<p class="text-secondary mb-0">
					This removes only the session entry, not the workout itself.
				</p>
				{#if deleteError}
					<div class="alert alert-danger rounded-3 mb-0">{deleteError}</div>
				{/if}
				<div class="d-flex flex-column flex-sm-row justify-content-end gap-2 pt-2">
					<button type="button" class="btn btn-outline-light" on:click={closeDeleteSession}>
						Cancel
					</button>
					<form method="POST" action="?/deleteSession" use:enhance={handleDeleteSessionSubmit} bind:this={deleteForm}>
						<input type="hidden" name="sessionId" value={deletingSession._id} />
						<button type="submit" class="btn btn-danger">Remove</button>
					</form>
				</div>
			</div>
		</div>
	{/if}

	<!-- Bottom action cards removed because hero now contains action cards to avoid duplication -->
</section>

<style>
	.dashboard {
		padding: 0;
	}

	.hero-icon {
		width: 7rem;
		height: 7rem;
		flex: 0 0 auto;
		object-fit: cover;
		border-radius: 0.4rem;
		filter: drop-shadow(0 0.5rem 1rem rgba(0, 0, 0, 0.35));
	}

	@media (min-width: 768px) {
		.hero-icon {
			width: 7rem;
			height: 7rem;
		}
	}

	.action-card {
		min-width: 11rem;
		min-height: 7rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		transition:
			transform 160ms ease,
			box-shadow 160ms ease,
			border-color 160ms ease;
	}

	.action-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.35) !important;
		border-color: rgba(255, 140, 0, 0.35) !important;
	}

	@media (min-width: 768px) {
		.action-card {
			min-height: 8.5rem;
		}
	}

	.btn-orange {
		background: #ff8c00;
		border-color: #ff8c00;
		color: #111111;
	}

	.btn-orange:hover,
	.btn-orange:focus {
		background: #ff9d1f;
		border-color: #ff9d1f;
		color: #111111;
	}

</style>