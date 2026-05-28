<script>
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { showSuccessToast } from '$lib/stores/toast';

	let form = {
		name: '',
		categories: [],
		level: 'Beginner',
		description: '',
		sets: 3,
		reps: 10,
		duration: 30
	};

	let categoryInput = '';
	let errors = [];
	let loading = false;
	let submitted = false;

	const fieldErrorMatchers = {
		name: ['name is required'],
		categories: ['at least one category is required'],
		level: ['level is required'],
		sets: ['sets must be a non-negative number'],
		reps: ['reps must be a non-negative number'],
		duration: ['duration must be a non-negative number']
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

	function addCategory() {
		const trimmed = categoryInput.trim();
		if (trimmed && !form.categories.includes(trimmed)) {
			form.categories = [...form.categories, trimmed];
			categoryInput = '';
		}
	}

	function removeCategory(cat) {
		form.categories = form.categories.filter((c) => c !== cat);
	}

	function validateForm() {
		errors = [];
		if (!form.name.trim()) errors.push('Name is required');
		if (form.categories.length === 0) errors.push('At least one category is required');
		if (!form.level) errors.push('Level is required');
		if (form.sets < 0 || isNaN(form.sets)) errors.push('Sets must be a non-negative number');
		if (form.reps < 0 || isNaN(form.reps)) errors.push('Reps must be a non-negative number');
		if (form.duration < 0 || isNaN(form.duration))
			errors.push('Duration must be a non-negative number');
		return errors.length === 0;
	}

	function enhanceSubmit({ cancel }) {
		submitted = true;
		if (!validateForm()) {
			cancel();
			return;
		}

		loading = true;

		return async ({ result, update }) => {
			await update();
			loading = false;

			if (result.type === 'success' && result.data?.success) {
				showSuccessToast(result.data.message || 'Exercise created!');
				await goto(resolve('/exercises'));
				return;
			}

			if (result.type === 'failure') {
				const failureData = result.data ?? {};
				errors = failureData.errors ?? [failureData.error || 'Failed to create exercise'];
				return;
			}

			errors = ['Failed to create exercise'];
		};
	}
</script>

<section class="container py-4">
	<div class="row justify-content-center">
		<div class="col-12 col-xl-8">
			<div class="card bg-dark text-light border border-secondary shadow-lg rounded-3">
				<div class="card-body p-4 p-md-5">
					<div class="d-flex flex-column gap-2 mb-4">
						<h1 class="display-6 fw-bold mb-0">Create New Exercise</h1>
						<p class="text-secondary mb-0">
							Set up a drill with categories, difficulty, and timing.
						</p>
					</div>

					<form method="POST" use:enhance={enhanceSubmit} class="d-flex flex-column gap-4">

						<div>
							<label class="form-label text-light fw-semibold" for="name"
								>Exercise Name <span style="color: red;">*</span></label
							>
							<input
								id="name"
								name="name"
								class={`form-control bg-dark border-secondary text-input ${(submitted && !form.name.trim()) || isFieldInvalid('name') ? 'is-invalid' : ''}`}
								type="text"
								bind:value={form.name}
								title="Exercise Name (required)"
								placeholder="e.g., Push-ups"
								required
							/>
							{#if (submitted && !form.name.trim()) || isFieldInvalid('name')}
								<div class="invalid-feedback">{getFieldError('name') || 'Name is required'}</div>
							{/if}
						</div>

						<div>
							<label class="form-label text-light fw-semibold" for="categoryInput">Categories <span style="color: red;">*</span></label
							>
							<div class="input-group">
								<input
									id="categoryInput"
									type="text"
									class={`form-control bg-dark border-secondary text-input ${(submitted && form.categories.length === 0) || isFieldInvalid('categories') ? 'is-invalid' : ''}`}
									bind:value={categoryInput}
									placeholder="e.g., Chest, Cardio"
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

						<div class="row g-3">
							<div class="col-md-4">
								<label class="form-label text-light fw-semibold" for="level">Level <span style="color: red;">*</span></label>
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
							<div class="col-md-4">
								<label class="form-label text-light fw-semibold" for="sets">Sets <span style="color: red;">*</span></label>
								<input
									id="sets"
									name="sets"
									class={`form-control bg-dark border-secondary control-input ${(submitted && (form.sets < 0 || isNaN(form.sets))) || isFieldInvalid('sets') ? 'is-invalid' : ''}`}
									type="number"
									bind:value={form.sets}
									min="0"
									required
								/>
								{#if (submitted && (form.sets < 0 || isNaN(form.sets))) || isFieldInvalid('sets')}
									<div class="invalid-feedback">
										{getFieldError('sets') || 'Sets must be a non-negative number'}
									</div>
								{/if}
							</div>
							<div class="col-md-4">
								<label class="form-label text-light fw-semibold" for="reps">Reps <span style="color: red;">*</span></label>
								<input
									id="reps"
									name="reps"
									class={`form-control bg-dark border-secondary control-input ${(submitted && (form.reps < 0 || isNaN(form.reps))) || isFieldInvalid('reps') ? 'is-invalid' : ''}`}
									type="number"
									bind:value={form.reps}
									min="0"
									required
								/>
								{#if (submitted && (form.reps < 0 || isNaN(form.reps))) || isFieldInvalid('reps')}
									<div class="invalid-feedback">
										{getFieldError('reps') || 'Reps must be a non-negative number'}
									</div>
								{/if}
							</div>
						</div>

						<div>
							<label class="form-label text-light fw-semibold" for="description"
								>Description (optional)</label
							>
							<textarea
								id="description"
								name="description"
									class="form-control bg-dark border-secondary text-input"
								bind:value={form.description}
								placeholder="Describe how to perform this exercise..."
								style="height: 140px"
							></textarea>
						</div>

						<div class="row g-3">
							<div class="col-md-6">
								<label class="form-label text-light fw-semibold" for="duration"
									>Duration (minutes) <span style="color: red;">*</span></label
								>
								<input
									id="duration"
									name="duration"
									class={`form-control bg-dark border-secondary control-input ${(submitted && (form.duration < 0 || isNaN(form.duration))) || isFieldInvalid('duration') ? 'is-invalid' : ''}`}
									type="number"
									bind:value={form.duration}
									min="0"
									required
								/>
								{#if (submitted && (form.duration < 0 || isNaN(form.duration))) || isFieldInvalid('duration')}
									<div class="invalid-feedback">
										{getFieldError('duration') || 'Duration must be a non-negative number'}
									</div>
								{/if}
							</div>
						</div>

						<div class="d-flex flex-column flex-sm-row justify-content-end gap-2 pt-2">
							<a href={resolve('/exercises')} class="btn btn-outline-light">Cancel</a>
							<button type="submit" class="btn btn-primary btn-orange" disabled={loading}>
								{#if loading}
									<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
									Creating...
								{:else}
									Create Exercise
								{/if}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
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
