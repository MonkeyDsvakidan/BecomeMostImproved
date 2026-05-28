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
			<h2 class="h5 mb-0 fw-bold card-title-clamp">{name}</h2>
			<div class="d-flex align-items-center gap-2">
				<span class="badge rounded-pill bg-success text-dark">{level}</span>
				<a href={resolve(`/exercises/${_id}/edit`)} class="btn btn-sm btn-outline-info" aria-label="Edit exercise">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden>
						<path d="M12.854.146a.5.5 0 0 1 .707 0l2.586 2.586a.5.5 0 0 1 0 .707l-9.793 9.793a.5.5 0 0 1-.168.11l-4 1.5a.5.5 0 0 1-.65-.65l1.5-4a.5.5 0 0 1 .11-.168L12.854.146zM11.5 2.207 3.79 9.914l-.94 2.507 2.507-.94L13.207 3.5 11.5 2.207z"/>
					</svg>
				</a>
				<button class="btn btn-sm btn-outline-danger" aria-label="Delete exercise" on:click={() => onDelete(_id, name)}>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden>
						<path d="M5.5 5.5A.5.5 0 0 1 6 5h4a.5.5 0 0 1 .5.5v7A.5.5 0 0 1 10 13H6a.5.5 0 0 1-.5-.5v-7z"/>
						<path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 1 1 0-2H5.5l1-1h3l1 1H13.5a1 1 0 0 1 1 1zM4 4v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4H4z"/>
					</svg>
				</button>
			</div>
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
			<p class="card-text text-light-emphasis mb-0 flex-grow-1 card-description-clamp">{description}</p>
		{/if}

		<div class="btn-group mt-auto" role="group" aria-label="Exercise actions">
			<a href={resolve(`/exercises/${_id}/session`)} class="btn btn-primary btn-orange">Start</a>
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

	.card-title-clamp {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
		min-height: 3.25rem;
		line-height: 1.15;
	}

	.card-description-clamp {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		overflow: hidden;
		min-height: 4.5rem;
	}

	.card-header .d-flex.flex-wrap {
		min-height: 2.25rem;
		align-content: flex-start;
	}
</style>
