<script>
	import ExerciseCard from '$lib/components/ExerciseCard.svelte';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { SvelteSet } from 'svelte/reactivity';
	import { showErrorToast, showSuccessToast } from '$lib/stores/toast';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	export let data;

	let exercises = [];
	let availableCategories = [];
	let sortMode = 'date';
	let sortDirection = 'desc';
	let selectedCategories = [];
	let selectedLevel = '';
	let selectedDuration = '';
	let loading = false;
	let error = data?.error ?? '';
	let searchQuery = '';
	let searchInput;
	const deleting = new SvelteSet();

	const sortLabels = {
		date: 'Date',
		level: 'Level'
	};

	const levelLabels = {
		Beginner: 'Beginner',
		Intermediate: 'Intermediate',
		Advanced: 'Advanced'
	};

	const durationLabels = {
		lt10: '< 10 Min',
		'10-20': '10-20 Min',
		gt20: '> 20 Min'
	};

	const directionLabels = {
		asc: 'Ascending',
		desc: 'Descending'
	};

	$: {
		exercises = data?.exercises ?? [];
		availableCategories = data?.availableCategories ?? [];
		sortMode = data?.sortMode ?? 'date';
		sortDirection = data?.sortDirection ?? (sortMode === 'level' ? 'asc' : 'desc');
		selectedCategories = data?.selectedCategories ?? [];
		selectedLevel = data?.selectedLevel ?? '';
		selectedDuration = data?.selectedDuration ?? '';
		error = data?.error ?? '';
	}

	// initialize searchQuery from URL (once)
	onMount(() => {
		try {
			const q = $page.url.searchParams.get('q');
			if (q) searchQuery = q;
		} catch {}
	});

	// keep input visible and in-sync with URL `q` when the page store changes,
	// but don't overwrite while the user is actively typing (input is focused)
	$: try {
		const qFromUrl = $page.url.searchParams.get('q') ?? '';
		if (typeof document !== 'undefined' && searchInput && document.activeElement === searchInput) {
			// user is typing — don't clobber
		} else if (qFromUrl !== (searchQuery ?? '')) {
			searchQuery = qFromUrl;
		}
	} catch {}

	// client-side filtered list (applies on top of server filters)
	$: visibleExercises = (exercises || []).filter((ex) => {
		if (!searchQuery) return true;
		const q = String(searchQuery).toLowerCase();
		return (ex.name || '').toLowerCase().includes(q);
	});

	function buildHref(overrides = {}) {
		const params = new URLSearchParams();
		const nextSortMode = overrides.sortMode ?? sortMode;
		const nextSortDirection = overrides.sortDirection ?? sortDirection;
		const nextCategories = overrides.categories ?? selectedCategories;
		const nextLevel = overrides.level ?? selectedLevel;
		const nextDuration = overrides.duration ?? selectedDuration;

		if (nextSortMode) params.set('sort', nextSortMode);
		if (nextSortDirection) params.set('dir', nextSortDirection);
		for (const category of nextCategories) {
			params.append('category', category);
		}
		if (nextLevel) params.set('level', nextLevel);
		if (nextDuration) params.set('duration', nextDuration);
		const nextQuery = overrides.q ?? searchQuery;
		if (nextQuery) params.set('q', nextQuery);

		const query = params.toString();
		return query ? `?${query}` : '';
	}

	function sortHref(nextSortMode, nextSortDirection) {
		return buildHref({ sortMode: nextSortMode, sortDirection: nextSortDirection });
	}

	function navigateWith(overrides = {}) {
		goto(buildHref(overrides));
	}

	function clearAllFilters() {
		navigateWith({ categories: [], level: '', duration: '' });
	}

	function removeFilter(filterKey) {
		const overrides = { [filterKey]: '' };
		navigateWith(overrides);
	}

	function toggleCategory(category) {
		const nextCategories = selectedCategories.includes(category)
			? selectedCategories.filter((value) => value !== category)
			: [...selectedCategories, category];

		navigateWith({ categories: nextCategories });
	}

	function hasActiveFilters() {
		return Boolean(selectedCategories.length || selectedLevel || selectedDuration);
	}

	function isCategorySelected(category) {
		return selectedCategories.includes(category);
	}

	async function fetchExercises() {
		loading = true;
		error = '';
		try {
			const res = await fetch(`/api/exercises${buildHref()}`);
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body.error || res.statusText);
			}
			exercises = await res.json();
		} catch (e) {
			error = e.message || 'Failed to load exercises';
		} finally {
			loading = false;
		}
	}

	async function deleteExercise(id, name) {
		const confirmed = confirm(`Delete exercise "${name}"? This cannot be undone.`);
		if (!confirmed) return;

		deleting.add(id);
		try {
			const res = await fetch(`/api/exercises/${id}`, { method: 'DELETE' });
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body.error || res.statusText);
			}
			exercises = exercises.filter((e) => e._id !== id);
			showSuccessToast('Exercise deleted!');
		} catch (e) {
			showErrorToast('Delete failed: ' + (e.message || 'unknown error'));
		} finally {
			deleting.delete(id);
		}
	}
</script>

<section class="container py-4">
	<div
		class="page-header d-flex flex-column flex-xl-row justify-content-between align-items-xl-end gap-3 mb-4"
	>
		<div class="page-header-copy">
			<h1 class="display-6 fw-bold mb-1">Exercises</h1>
			<p class="text-secondary mb-0">Browse, create, and manage your exercise library.</p>
		</div>
		<div class="d-flex gap-2 flex-wrap justify-content-xl-end align-items-center">
			<div class="input-group me-2">
				<input
					bind:this={searchInput}
					type="search"
					class="form-control form-control-sm bg-dark border-secondary text-white"
					placeholder="Search exercises"
					bind:value={searchQuery}
					on:keydown={(e) =>
						e.key === 'Enter' && (e.preventDefault(), navigateWith({ q: searchQuery }))}
				/>
				<button
					class="btn btn-sm btn-outline-light"
					type="button"
					on:click={() => {
						searchQuery = '';
						navigateWith({ q: '' });
					}}
					title="Clear search">×</button
				>
			</div>
			<button class="btn btn-outline-light" on:click={fetchExercises} disabled={loading}>
				{#if loading}
					<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
					Refreshing
				{:else}
					Refresh
				{/if}
			</button>
			<a href={resolve('/exercises/new')} class="btn btn-primary btn-orange">Create New Exercise</a>
		</div>
	</div>

	<div class="controls-panel rounded-4 p-3 p-md-4 mb-4">
		<div class="d-flex flex-column gap-4">
			<div
				class="d-flex flex-column flex-lg-row gap-3 align-items-lg-center justify-content-between"
			>
				<div class="d-flex flex-wrap align-items-center gap-2">
					<span class="text-secondary small fw-semibold text-uppercase">Sort by:</span>
					<div class="btn-group" role="group" aria-label="Sort exercises">
						<a
							href={sortHref('date', sortDirection)}
							class={`btn btn-sm ${sortMode === 'date' ? 'btn-primary btn-orange' : 'btn-outline-light'}`}
							>{sortLabels.date}</a
						>
						<a
							href={sortHref('level', sortDirection)}
							class={`btn btn-sm ${sortMode === 'level' ? 'btn-primary btn-orange' : 'btn-outline-light'}`}
							>{sortLabels.level}</a
						>
					</div>
					<div class="btn-group" role="group" aria-label="Sort direction">
						<a
							href={sortHref(sortMode, 'asc')}
							class={`btn btn-sm ${sortDirection === 'asc' ? 'btn-primary btn-orange' : 'btn-outline-light'}`}
							aria-label={`Sort ${sortLabels[sortMode]} ${directionLabels.asc}`}
							title={`Sort ${sortLabels[sortMode]} ${directionLabels.asc}`}>↑</a
						>
						<a
							href={sortHref(sortMode, 'desc')}
							class={`btn btn-sm ${sortDirection === 'desc' ? 'btn-primary btn-orange' : 'btn-outline-light'}`}
							aria-label={`Sort ${sortLabels[sortMode]} ${directionLabels.desc}`}
							title={`Sort ${sortLabels[sortMode]} ${directionLabels.desc}`}>↓</a
						>
					</div>
				</div>
				<a
					href={buildHref({ categories: [], level: '', duration: '' })}
					class="btn btn-outline-warning"
				>
					Clear all filters
				</a>
			</div>

			<div class="row g-3">
				<div class="col-12">
					<div class="d-flex align-items-center gap-2 mb-2">
						<div class="form-label text-light fw-semibold mb-0">Categories</div>
						<span class="text-secondary small ms-2">Pick one or more tags</span>
					</div>
					<div class="d-flex flex-wrap gap-2">
						{#each availableCategories as category (category)}
							<button
								type="button"
								class={`btn btn-sm category-toggle ${isCategorySelected(category) ? 'is-active' : 'is-inactive'}`}
								on:click={() => toggleCategory(category)}
								aria-pressed={isCategorySelected(category)}
								style:background-color={isCategorySelected(category) ? '#ff8c00' : 'transparent'}
								style:border-color={isCategorySelected(category)
									? '#ff8c00'
									: 'rgba(255, 255, 255, 0.35)'}
								style:color={isCategorySelected(category) ? '#111111' : '#f1f3f5'}
							>
								{isCategorySelected(category) ? '✓ ' : ''}{category}
							</button>
						{/each}
					</div>
					{#if selectedCategories.length > 0}
						<div class="mt-2 small text-secondary">
							Selected:
							{#each selectedCategories as category (category)}
								<span class="selected-category-pill ms-2">{category}</span>
							{/each}
						</div>
					{/if}
				</div>
				<div class="col-12 col-md-4 col-lg-3">
					<div class="form-label text-light fw-semibold mb-2">Level</div>
					<div class="d-flex flex-wrap gap-2">
						<a
							href={buildHref({ level: '' })}
							class={`btn btn-sm ${selectedLevel === '' ? 'btn-primary btn-orange' : 'btn-outline-light'}`}
							>All</a
						>
						{#each Object.entries(levelLabels) as [level, label]}
							<a
								href={buildHref({ level })}
								class={`btn btn-sm ${selectedLevel === level ? 'btn-primary btn-orange' : 'btn-outline-light'}`}
								>{label}</a
							>
						{/each}
					</div>
				</div>
				<div class="col-12 col-md-4 col-lg-4">
					<div class="form-label text-light fw-semibold mb-2">Duration</div>
					<div class="d-flex flex-wrap gap-2">
						<a
							href={buildHref({ duration: '' })}
							class={`btn btn-sm ${selectedDuration === '' ? 'btn-primary btn-orange' : 'btn-outline-light'}`}
							>All</a
						>
						{#each Object.entries(durationLabels) as [duration, label]}
							<a
								href={buildHref({ duration })}
								class={`btn btn-sm ${selectedDuration === duration ? 'btn-primary btn-orange' : 'btn-outline-light'}`}
								>{label}</a
							>
						{/each}
					</div>
				</div>
			</div>

			{#if hasActiveFilters()}
				<div class="d-flex flex-wrap gap-2">
					{#each selectedCategories as category (category)}
						<a
							href={buildHref({
								categories: selectedCategories.filter((value) => value !== category)
							})}
							class="filter-badge text-decoration-none">Category: {category} ×</a
						>
					{/each}
					{#if selectedLevel}
						<a href={buildHref({ level: '' })} class="filter-badge text-decoration-none"
							>Level: {selectedLevel} ×</a
						>
					{/if}
					{#if selectedDuration}
						<a href={buildHref({ duration: '' })} class="filter-badge text-decoration-none"
							>Duration: {durationLabels[selectedDuration]} ×</a
						>
					{/if}
				</div>
			{/if}
		</div>
	</div>

	{#if loading}
		<div class="text-center py-5">
			<div class="spinner-border text-primary" role="status" aria-label="Loading exercises"></div>
			<p class="mt-3 text-secondary mb-0">Loading exercises…</p>
		</div>
	{:else if error}
		<div class="alert alert-danger rounded-3 shadow-sm">{error}</div>
	{:else if exercises.length === 0}
		<div class="text-center py-5 bg-dark border border-secondary rounded-3 shadow-sm">
			<div class="display-4 mb-3">🏀</div>
			<h2 class="h4">No exercises found</h2>
			<p class="text-secondary mb-3">Add your first drill to start building workouts.</p>
			<a href={resolve('/exercises/new')} class="btn btn-primary btn-orange">Create Exercise</a>
		</div>
	{:else}
		<div class="row g-4">
			{#each visibleExercises as ex (ex._id)}
				<div class="col-12 col-md-6 col-lg-4">
					<ExerciseCard exercise={ex} onDelete={deleteExercise} />
				</div>
			{/each}
		</div>
	{/if}
</section>

<style>
	.page-header-copy {
		max-width: 38rem;
	}

	.controls-panel {
		background: #23272f;
		border: 1px solid rgba(255, 140, 0, 0.55);
		box-shadow:
			0 0 0 1px rgba(255, 140, 0, 0.08),
			0 0.75rem 1.5rem rgba(0, 0, 0, 0.18);
	}

	.filter-panel {
		background: #23272f;
		border: 1px solid rgba(255, 140, 0, 0.55);
		box-shadow:
			0 0 0 1px rgba(255, 140, 0, 0.08),
			0 0.75rem 1.5rem rgba(0, 0, 0, 0.18);
	}

	.category-toggle {
		border-width: 1px;
		transition:
			background-color 160ms ease,
			border-color 160ms ease,
			color 160ms ease,
			box-shadow 160ms ease,
			transform 160ms ease;
	}

	.category-toggle.is-inactive {
		background: transparent;
		border-color: rgba(255, 255, 255, 0.35);
		color: #f1f3f5;
	}

	.category-toggle.is-inactive:hover,
	.category-toggle.is-inactive:focus {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 255, 255, 0.55);
		color: #ffffff;
	}

	.category-toggle.is-active {
		background: #ff8c00;
		border-color: #ff8c00;
		color: #111111;
		box-shadow: 0 0 0 0.2rem rgba(255, 140, 0, 0.22);
	}

	.category-toggle.is-active:hover,
	.category-toggle.is-active:focus {
		background: #ff9d1f;
		border-color: #ff9d1f;
		color: #111111;
		transform: translateY(-1px);
		box-shadow: 0 0 0 0.2rem rgba(255, 157, 31, 0.28);
	}

	.selected-category-pill {
		display: inline-block;
		background: rgba(255, 140, 0, 0.18);
		border: 1px solid rgba(255, 140, 0, 0.65);
		color: #ffcc8a;
		border-radius: 999px;
		padding: 0.2rem 0.55rem;
		font-weight: 600;
	}

	.filter-badge {
		background: rgba(255, 140, 0, 0.14);
		border: 1px solid rgba(255, 140, 0, 0.6);
		color: #ffcc8a;
		border-radius: 999px;
		padding: 0.35rem 0.7rem;
		font-size: 0.875rem;
		line-height: 1;
	}

	.filter-badge:hover,
	.filter-badge:focus {
		background: rgba(255, 140, 0, 0.22);
		color: #fff0d8;
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
