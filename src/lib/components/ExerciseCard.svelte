<script>
	import { resolve } from '$app/paths';
	export let exercise = {};
	export let onDelete = () => {};

	const { _id, name, category = [], level = 'N/A', duration = 0, description = '' } = exercise;
</script>

<article
	class="card bg-dark text-light border border-secondary shadow-sm h-100 rounded-3 exercise-card"
>
	<div class="card-header bg-transparent border-secondary d-flex flex-column gap-2">
		<div class="d-flex justify-content-between align-items-start gap-3">
			<h2 class="h5 mb-0 fw-bold">{name}</h2>
			<span class="badge rounded-pill bg-success text-dark">{level}</span>
		</div>
		<div class="d-flex flex-wrap gap-2">
			{#each category as cat, index (cat + index)}
				<span class="badge rounded-pill bg-success text-dark">{cat}</span>
			{/each}
		</div>
	</div>

	<div class="card-body d-flex flex-column gap-3">
		<div class="d-flex justify-content-between text-secondary small">
			<span><strong class="text-light">Level</strong>: {level}</span>
			<span>⏱ {duration} min</span>
		</div>

		{#if description}
			<p class="card-text text-light-emphasis mb-0 flex-grow-1">{description}</p>
		{/if}

		<div class="btn-group mt-auto" role="group" aria-label="Exercise actions">
			<a href={resolve(`/exercises/${_id}/session`)} class="btn btn-primary btn-orange">Start</a>
			<a href={resolve(`/exercises/${_id}/edit`)} class="btn btn-outline-info">Edit</a>
			<button class="btn btn-outline-danger" on:click={() => onDelete(_id, name)}>Delete</button>
		</div>
	</div>
</article>

<style>
	.exercise-card {
		transition:
			transform 160ms ease,
			box-shadow 160ms ease,
			border-color 160ms ease;
	}

	.exercise-card:hover {
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
