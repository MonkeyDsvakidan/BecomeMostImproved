<script>
	import { resolve } from '$app/paths';
	export let workout = {};
	export let onDelete = () => {};

	const { _id, name, duration = 0, categories = [], level = 'N/A', exercises = [] } = workout;
</script>

<article
	class="card bg-dark text-light border border-secondary shadow-sm h-100 rounded-3 workout-card"
>
	<div class="card-header bg-transparent border-secondary d-flex flex-column gap-2">
		<div class="d-flex justify-content-between align-items-start gap-3">
			<h2 class="h5 mb-0 fw-bold">{name}</h2>
			<span class="badge rounded-pill bg-primary text-dark">{exercises.length} exercises</span>
		</div>
		<div class="d-flex gap-2 flex-wrap">
			{#if categories && categories.length > 0}
				{#each categories as cat, index (cat + index)}
					<span class="badge rounded-pill bg-primary text-dark">{cat}</span>
				{/each}
			{/if}
		</div>
	</div>

	<div class="card-body d-flex flex-column gap-3">
		<div class="d-flex justify-content-between text-secondary small">
			<span><strong class="text-light">Level</strong>: {level}</span>
			<span>⏱ {duration} min</span>
		</div>

		<div class="btn-group mt-auto" role="group" aria-label="Workout actions">
			<a href={resolve(`/workouts/${_id}/session`)} class="btn btn-primary btn-orange">Start</a>
			<a href={resolve(`/workouts/${_id}/edit`)} class="btn btn-outline-info">Edit</a>
			<button class="btn btn-outline-danger" on:click={() => onDelete(_id, name)}>Delete</button>
		</div>
	</div>
</article>

<style>
	.workout-card {
		transition:
			transform 160ms ease,
			box-shadow 160ms ease,
			border-color 160ms ease;
	}

	.workout-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.35) !important;
		border-color: rgba(255, 140, 0, 0.35) !important;
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
