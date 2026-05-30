<script>
	import { resolve } from '$app/paths';
	import { showErrorToast, showSuccessToast } from '$lib/stores/toast';
	export let workout = {};
	export let onDelete = () => {};

	const { _id, name, duration = 0, categories = [], level = 'N/A', exercises = [], isFavorite = false } = workout;

	let isFavoriteLocal = Boolean(isFavorite);
	let toggling = false;

	async function toggleFavorite() {
		if (toggling) return;
		const prev = isFavoriteLocal;
		isFavoriteLocal = !prev; // optimistic
		toggling = true;
		try {
			const res = await fetch('/api/workouts/toggleFavorite', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ workoutId: String(_id) })
			});

			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body.error || res.statusText || 'Request failed');
			}

			const data = await res.json();
			isFavoriteLocal = Boolean(data.isFavorite);
			showSuccessToast(isFavoriteLocal ? 'Added to favorites' : 'Removed from favorites');
		} catch (e) {
			isFavoriteLocal = prev; // revert
			showErrorToast('Favorite update failed: ' + (e.message || 'unknown'));
		} finally {
			toggling = false;
		}
	}
</script>

<article class="card bg-dark text-light border border-secondary shadow-sm h-100 rounded-3 workout-card">
	<div class="card-header bg-transparent border-secondary d-flex flex-column gap-2">
		<div class="d-flex justify-content-between align-items-start gap-3">
			<h2 class="h5 mb-0 fw-bold card-title-clamp">{name}</h2>
			<div class="d-flex align-items-center gap-2">
				<button
					class="btn btn-sm favorite-toggle"
					type="button"
					aria-pressed={isFavoriteLocal}
					title={isFavoriteLocal ? 'Remove from favorites' : 'Add to favorites'}
					on:click={toggleFavorite}
					disabled={toggling}
				>
					{#if isFavoriteLocal}
						<span aria-hidden="true">★</span>
					{:else}
						<span aria-hidden="true">☆</span>
					{/if}
				</button>
				<span class="badge rounded-pill bg-primary text-dark">{exercises.length} exercises</span>
				<a href={resolve(`/workouts/${_id}/edit`)} class="btn btn-sm btn-outline-info" aria-label="Edit workout">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
						<path d="M12.854.146a.5.5 0 0 1 .707 0l2.586 2.586a.5.5 0 0 1 0 .707l-9.793 9.793a.5.5 0 0 1-.168.11l-4 1.5a.5.5 0 0 1-.65-.65l1.5-4a.5.5 0 0 1 .11-.168L12.854.146zM11.5 2.207 3.79 9.914l-.94 2.507 2.507-.94L13.207 3.5 11.5 2.207z"/>
					</svg>
				</a>
				<button class="btn btn-sm btn-outline-danger" aria-label="Delete workout" on:click={() => onDelete(_id, name)}>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
						<path d="M5.5 5.5A.5.5 0 0 1 6 5h4a.5.5 0 0 1 .5.5v7A.5.5 0 0 1 10 13H6a.5.5 0 0 1-.5-.5v-7z"/>
						<path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 1 1 0-2H5.5l1-1h3l1 1H13.5a1 1 0 0 1 1 1zM4 4v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4H4z"/>
					</svg>
				</button>
			</div>
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

	.card-title-clamp {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
		min-height: 3.25rem;
		line-height: 1.15;
	}

	.card-header .d-flex.flex-wrap {
		min-height: 2.25rem;
		align-content: flex-start;
	}

	.favorite-toggle {
		font-size: 1rem;
		line-height: 1;
		padding: 0.25rem 0.5rem;
		background: transparent;
		border: 1px solid rgba(255,255,255,0.08);
		color: #ffd54f;
	}

	.favorite-toggle:disabled {
		opacity: 0.6;
	}
</style>
