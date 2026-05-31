<script>
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { SvelteSet } from 'svelte/reactivity';
	import { showSuccessToast } from '$lib/stores/toast';

	export let data;

	let allExercises = data?.exercises ?? [];
	let exercisesLoading = false;
	let errors = data?.error ? [data.error] : [];
	let loading = false;
	let submitting = false;
	let submitted = false;

	let form = {
		name: data?.workout?.name ?? '',
		duration: data?.workout?.duration ?? 30,
		categories: data?.workout?.categories ?? [],
		level: data?.workout?.level ?? 'Beginner',
		exerciseIds: data?.workout?.exerciseIds ?? []
	};

	let categoryInput = '';
	let showAllExercises = false;
	let selectedExercises = new SvelteSet(form.exerciseIds);

	// Auto-duration controls (mirror new page behavior)
	let autoDuration = true;
	let pausePerExercise = 0;

	$: selectedExerciseObjects = form.exerciseIds
		? form.exerciseIds
				.map((id) => allExercises.find((e) => String(e._id) === String(id)))
				.filter(Boolean)
		: [];

	$: calculatedDuration =
		selectedExerciseObjects.reduce((sum, ex) => sum + (Number(ex.duration) || 0), 0) +
		(pausePerExercise ? pausePerExercise * selectedExerciseObjects.length : 0);

	$: if (autoDuration) {
		form.duration = calculatedDuration;
	}

	$: missingDurations = selectedExerciseObjects.some(
		(ex) => ex.duration == null || ex.duration === ''
	);

	$: knownExerciseCategories = Array.from(
		new Set(
			allExercises
				.flatMap((exercise) => (exercise.category ?? []).map((cat) => String(cat).trim()))
				.filter(Boolean)
		)
	);

	function normalizeCategoryValue(value) {
		return String(value ?? '')
			.trim()
			.toLowerCase();
	}

	function findCanonicalCategory(rawValue) {
		const trimmed = String(rawValue ?? '').trim();
		const normalized = normalizeCategoryValue(trimmed);
		if (!normalized) return '';

		const exactMatch = knownExerciseCategories.find(
			(category) => normalizeCategoryValue(category) === normalized
		);
		if (exactMatch) return exactMatch;

		const fuzzyMatches = knownExerciseCategories.filter((category) => {
			const normalizedCategory = normalizeCategoryValue(category);
			return normalizedCategory.includes(normalized) || normalized.includes(normalizedCategory);
		});

		if (fuzzyMatches.length > 0) {
			return fuzzyMatches.sort((a, b) => b.length - a.length)[0];
		}

		return trimmed;
	}

	$: normalizedWorkoutCategories = form.categories
		.map((cat) => cat.trim().toLowerCase())
		.filter(Boolean);
	$: activeFilterLabel = form.categories.length > 0 ? form.categories.join(', ') : '';
	$: filterFeedbackLabel =
		normalizedWorkoutCategories.length === 1
			? `category '${form.categories[0]}'`
			: `categories '${form.categories.join(', ')}'`;
	$: filteredExercises =
		showAllExercises || normalizedWorkoutCategories.length === 0
			? allExercises
			: allExercises.filter((exercise) => {
					const exerciseCategories = (exercise.category ?? []).map((cat) =>
						String(cat).trim().toLowerCase()
					);
					return exerciseCategories.some((category) =>
						normalizedWorkoutCategories.some(
							(workoutCategory) =>
								category.includes(workoutCategory) || workoutCategory.includes(category)
						)
					);
				});

	const fieldErrorMatchers = {
		name: ['name is required'],
		duration: ['duration must be a non-negative number'],
		level: ['level is required'],
		categories: ['at least one category is required'],
		exerciseIds: ['at least one exercise must be selected']
	};

	function getFieldError(field) {
		const matchers = fieldErrorMatchers[field] ?? [];
		const found = errors.find((err) => {
			const lowered = err.toLowerCase();
			return matchers.some((matcher) => lowered.includes(matcher));
		});
		return found ?? '';
	}

	function isFieldInvalid(field) {
		return Boolean(getFieldError(field));
	}

	function toggleExercise(id) {
		if (selectedExercises.has(id)) {
			selectedExercises.delete(id);
		} else {
			selectedExercises.add(id);
		}
		selectedExercises = selectedExercises;
		form.exerciseIds = Array.from(selectedExercises);
	}

	function addCategory() {
		const canonical = findCanonicalCategory(categoryInput);
		const normalizedCanonical = normalizeCategoryValue(canonical);
		const alreadyExists = form.categories.some(
			(category) => normalizeCategoryValue(category) === normalizedCanonical
		);

		if (canonical && !alreadyExists) {
			form.categories = [...form.categories, canonical];
			showAllExercises = false;
			categoryInput = '';
		}
	}

	function removeCategory(cat) {
		form.categories = form.categories.filter((c) => c !== cat);
		showAllExercises = false;
	}

	function showAllExercisesList() {
		showAllExercises = true;
	}

	function validateForm() {
		errors = [];
		if (!form.name.trim()) errors.push('Name is required');
		if (form.categories.length === 0) errors.push('At least one category is required');
		if (!form.level) errors.push('Level is required');
		if (form.duration < 0 || isNaN(form.duration))
			errors.push('Duration must be a non-negative number');
		if (form.exerciseIds.length === 0) errors.push('At least one exercise must be selected');
		return errors.length === 0;
	}

	function enhanceSubmit({ cancel }) {
		submitted = true;
		if (!validateForm()) {
			cancel();
			return;
		}

		submitting = true;

		return async ({ result, update }) => {
			await update();
			submitting = false;

			if (result.type === 'success' && result.data?.success) {
				showSuccessToast(result.data.message || 'Workout updated successfully!');
				await goto(resolve('/workouts'));
				return;
			}

			if (result.type === 'failure') {
				const failureData = result.data ?? {};
				errors = failureData.errors ?? [failureData.error || 'Failed to update workout'];
				return;
			}

			errors = ['Failed to update workout'];
		};
	}
</script>

<section class="container py-4">
	<div class="row justify-content-center">
		<div class="col-12 col-xl-9">
			<div class="card bg-dark text-light border border-secondary shadow-lg rounded-3">
				<div class="card-body p-4 p-md-5">
					<div class="d-flex flex-column gap-2 mb-4">
						<h1 class="display-6 fw-bold mb-0">Edit Workout</h1>
						<p class="text-secondary mb-0">Update the workout setup and the exercises inside it.</p>
					</div>

					{#if loading || exercisesLoading}
						<div class="text-center py-5">
							<div
								class="spinner-border text-primary"
								role="status"
								aria-label="Loading workout"
							></div>
							<p class="mt-3 text-secondary mb-0">Loading workout…</p>
						</div>
					{:else}
						<form method="POST" use:enhance={enhanceSubmit} class="d-flex flex-column gap-4">
							{#if errors.length > 0}
								<div class="alert alert-danger rounded-3 shadow-sm mb-0">
									<strong class="d-block mb-2">Please fix these errors:</strong>
									<ul class="mb-0 ps-3">
										{#each errors as err, index (err + index)}
											<li>{err}</li>
										{/each}
									</ul>
								</div>
							{/if}

							<div>
								<label class="form-label text-light fw-semibold" for="name"
									>Workout Name <span style="color: red;">*</span></label
								>
								<input
									id="name"
									name="name"
									class={`form-control bg-dark border-secondary text-input ${(submitted && !form.name.trim()) || isFieldInvalid('name') ? 'is-invalid' : ''}`}
									type="text"
									bind:value={form.name}
									title="Workout Name (required)"
									placeholder="e.g., Full Body Strength"
									required
								/>
								{#if (submitted && !form.name.trim()) || isFieldInvalid('name')}
									<div class="invalid-feedback">{getFieldError('name') || 'Name is required'}</div>
								{/if}
							</div>

							<div class="row g-3">
								<div class="col-md-4">
									<label class="form-label text-light fw-semibold" for="duration"
										>Duration (minutes) <span style="color: red;">*</span></label
									>
									<div class="d-flex align-items-center gap-2">
										<input
											id="duration"
											name="duration"
											class={`form-control bg-dark border-secondary control-input ${(submitted && (form.duration < 0 || isNaN(form.duration))) || isFieldInvalid('duration') ? 'is-invalid' : ''}`}
											type="number"
											bind:value={form.duration}
											min="0"
											required
											on:input={() => (autoDuration = false)}
										/>
										{#if autoDuration}
											<span class="badge bg-success text-dark">Auto-calculated</span>
										{:else}
											<button
												type="button"
												class="btn btn-sm btn-outline-secondary"
												on:click={() => (autoDuration = true)}
												title="Recalculate from selected exercises">Use auto</button
											>
										{/if}
									</div>
									<input type="hidden" name="autoDuration" value={autoDuration} />
									<input type="hidden" name="pausePerExercise" value={pausePerExercise} />
									<div class="small text-secondary mt-1">
										Total Duration: {calculatedDuration} minutes {#if missingDurations}
											— Some selected exercises have no duration (assumed 0){/if}
									</div>
									{#if (submitted && (form.duration < 0 || isNaN(form.duration))) || isFieldInvalid('duration')}
										<div class="invalid-feedback">
											{getFieldError('duration') || 'Duration must be a non-negative number'}
										</div>
									{/if}
								</div>
								<div class="col-md-4">
									<label class="form-label text-light fw-semibold" for="level"
										>Level <span style="color: red;">*</span></label
									>
									<select
										id="level"
										name="level"
										class={`form-select bg-dark border-secondary control-input ${isFieldInvalid('level') ? 'is-invalid' : ''}`}
										bind:value={form.level}
										required
									>
										<option value="Beginner">Beginner</option>
										<option value="Intermediate">Intermediate</option>
										<option value="Advanced">Advanced</option>
									</select>
									{#if isFieldInvalid('level')}
										<div class="invalid-feedback">{getFieldError('level')}</div>
									{/if}
								</div>
							</div>

							<div>
								<label class="form-label text-light fw-semibold" for="categoryInput"
									>Categories <span style="color: red;">*</span></label
								>
								<div class="input-group">
									<input
										id="categoryInput"
										type="text"
										class={`form-control bg-dark border-secondary text-input ${(submitted && form.categories.length === 0) || isFieldInvalid('categories') ? 'is-invalid' : ''}`}
										bind:value={categoryInput}
										placeholder="e.g., Strength, Cardio"
										on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
									/>
									<button type="button" class="btn btn-outline-warning" on:click={addCategory}
										>Add Category</button
									>
								</div>
								{#if (submitted && form.categories.length === 0) || isFieldInvalid('categories')}
									<div class="invalid-feedback d-block">
										{getFieldError('categories') || 'At least one category is required'}
									</div>
								{/if}
								{#if form.categories.length > 0}
									<div class="d-flex flex-wrap gap-2 mt-3">
										{#each form.categories as cat, index (cat + index)}
											<input type="hidden" name="categories" value={cat} />
											<span
												class="badge rounded-pill bg-secondary text-light d-inline-flex align-items-center gap-2 px-3 py-2"
											>
												{cat}
												<button
													type="button"
													class="btn-close btn-close-white btn-sm"
													aria-label="Remove category"
													on:click={() => removeCategory(cat)}
												></button>
											</span>
										{/each}
									</div>
								{/if}
							</div>

							<div>
								<div class="d-flex align-items-center justify-content-between mb-2">
									<span class="form-label text-light fw-semibold mb-0"
										>Select Exercises <span style="color: red;">*</span></span
									>
									<span class="text-secondary small">{form.exerciseIds.length} selected</span>
								</div>

								{#if normalizedWorkoutCategories.length > 0}
									<div
										class="exercise-filter-panel d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3 p-3 rounded-3"
									>
										<div class="text-light small fw-medium">
											{#if showAllExercises}
												Showing all exercises
											{:else}
												Showing {filteredExercises.length} exercises matching {filterFeedbackLabel}
											{/if}
										</div>
										{#if !showAllExercises && activeFilterLabel}
											<div class="text-secondary small">
												Active category filter: {activeFilterLabel}
											</div>
										{/if}
										<button
											type="button"
											class="btn btn-sm btn-outline-warning"
											on:click={showAllExercisesList}
											disabled={showAllExercises}
										>
											Show all exercises
										</button>
									</div>
								{/if}

								{#if exercisesLoading}
									<div class="text-center py-4">
										<div
											class="spinner-border text-primary"
											role="status"
											aria-label="Loading exercises"
										></div>
										<p class="mt-3 text-secondary mb-0">Loading exercises…</p>
									</div>
								{:else if allExercises.length === 0}
									<div class="alert alert-warning rounded-3 mb-0">
										No exercises available. <a href={resolve('/exercises/new')} class="alert-link"
											>Create one</a
										>.
									</div>
								{:else if filteredExercises.length === 0}
									<div class="alert alert-info rounded-3 mb-0">
										No exercises match {filterFeedbackLabel}.
										<button
											type="button"
											class="btn btn-link p-0 ms-1 align-baseline"
											on:click={showAllExercisesList}
										>
											Show all exercises
										</button>
									</div>
								{:else}
									<div
										class={`list-group list-group-flush rounded-3 border border-secondary overflow-hidden ${submitted && form.exerciseIds.length === 0 ? 'border-danger' : ''}`}
									>
										{#each filteredExercises as exercise (exercise._id)}
											<label
												class="list-group-item bg-dark text-light border-secondary d-flex gap-3 align-items-start py-3"
											>
												<input
													class="form-check-input mt-1"
													type="checkbox"
													name="exerciseIds"
													value={exercise._id}
													checked={selectedExercises.has(exercise._id)}
													on:change={() => toggleExercise(exercise._id)}
												/>
												<span class="flex-grow-1">
													<strong class="d-block mb-1">{exercise.name}</strong>
													<span
														class="d-flex flex-wrap gap-2 align-items-center small text-secondary"
													>
														{#each exercise.category ?? [] as cat, index (cat + index)}
															<span class="badge rounded-pill bg-secondary text-light">{cat}</span>
														{/each}
														<span>Level: {exercise.level}</span>
													</span>
												</span>
											</label>
										{/each}
									</div>
								{/if}
								{#if (submitted && form.exerciseIds.length === 0) || isFieldInvalid('exerciseIds')}
									<div class="invalid-feedback d-block">
										{getFieldError('exerciseIds') || 'At least one exercise must be selected'}
									</div>
								{/if}
							</div>

							<div class="d-flex flex-column flex-sm-row justify-content-end gap-2 pt-2">
								<a href={resolve('/workouts')} class="btn btn-outline-light">Cancel</a>
								<button type="submit" class="btn btn-primary btn-orange" disabled={submitting}>
									{#if submitting}
										<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
										Updating...
									{:else}
										Update Workout
									{/if}
								</button>
							</div>
						</form>
					{/if}
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.exercise-filter-panel {
		background: #23272f;
		border: 1px solid rgba(255, 140, 0, 0.7);
		box-shadow:
			0 0 0 1px rgba(255, 140, 0, 0.12),
			0 0.75rem 1.5rem rgba(0, 0, 0, 0.2);
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
