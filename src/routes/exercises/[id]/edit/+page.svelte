<script>
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { showSuccessToast } from '$lib/stores/toast';

	export let data;

	let form = {
		name: data?.exercise?.name ?? '',
		categories: data?.exercise?.categories ?? [],
		level: data?.exercise?.level ?? 'Beginner',
		description: data?.exercise?.description ?? '',
		sets: data?.exercise?.sets ?? 3,
		reps: data?.exercise?.reps ?? 10,
		duration: data?.exercise?.duration ?? 30
	};

	let categoryInput = '';
	let errors = data?.error ? [data.error] : [];
	let loading = false;
	let submitting = false;
	let submitted = false;

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
		if (!form.description.trim()) errors.push('Description is required');
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

		submitting = true;

		return async ({ result, update }) => {
			await update();
			submitting = false;

			if (result.type === 'success' && result.data?.success) {
				showSuccessToast(result.data.message || 'Exercise updated successfully!');
				await goto(resolve('/exercises'));
				return;
			}

			if (result.type === 'failure') {
				const failureData = result.data ?? {};
				errors = failureData.errors ?? [failureData.error || 'Failed to update exercise'];
				return;
			}

			errors = ['Failed to update exercise'];
		};
	}
</script>

<section class="container py-4">
	<div class="row justify-content-center">
		<div class="col-12 col-xl-8">
			<div class="card bg-dark text-light border border-secondary shadow-lg rounded-3">
				<div class="card-body p-4 p-md-5">
					<div class="d-flex flex-column gap-2 mb-4">
						<h1 class="display-6 fw-bold mb-0">Edit Exercise</h1>
						<p class="text-secondary mb-0">
							Update the drill details without changing the workout flow.
						</p>
					</div>

					{#if loading}
						<div class="text-center py-5">
							<div
								class="spinner-border text-primary"
								role="status"
								aria-label="Loading exercise"
							></div>
							<p class="mt-3 text-secondary mb-0">Loading exercise…</p>
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

							<div class="form-floating">
								<input
									id="name"
									name="name"
									class={`form-control bg-dark text-light border-secondary ${submitted && !form.name.trim() ? 'is-invalid' : ''}`}
									type="text"
									bind:value={form.name}
									placeholder="e.g., Push-ups"
									required
								/>
								<label for="name">Exercise Name</label>
							</div>

							<div>
								<label class="form-label text-light fw-semibold" for="categoryInput"
									>Categories</label
								>
								<div class="input-group">
									<input
										id="categoryInput"
										type="text"
										class="form-control bg-dark text-light border-secondary"
										bind:value={categoryInput}
										placeholder="e.g., Chest, Cardio"
										on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
									/>
									<button type="button" class="btn btn-outline-warning" on:click={addCategory}
										>Add</button
									>
								</div>
								{#if submitted && form.categories.length === 0}<div class="text-danger small mt-2">
										At least one category is required.
									</div>{/if}
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
									<label class="form-label text-light fw-semibold" for="level">Level</label>
									<select
										id="level"
										name="level"
										class="form-select bg-dark text-light border-secondary"
										bind:value={form.level}
										required
									>
										<option value="Beginner">Beginner</option>
										<option value="Intermediate">Intermediate</option>
										<option value="Advanced">Advanced</option>
									</select>
								</div>
								<div class="col-md-4">
									<label class="form-label text-light fw-semibold" for="sets">Sets</label>
									<input
										id="sets"
										name="sets"
										class={`form-control bg-dark text-light border-secondary ${submitted && (form.sets < 0 || isNaN(form.sets)) ? 'is-invalid' : ''}`}
										type="number"
										bind:value={form.sets}
										min="0"
										required
									/>
								</div>
								<div class="col-md-4">
									<label class="form-label text-light fw-semibold" for="reps">Reps</label>
									<input
										id="reps"
										name="reps"
										class={`form-control bg-dark text-light border-secondary ${submitted && (form.reps < 0 || isNaN(form.reps)) ? 'is-invalid' : ''}`}
										type="number"
										bind:value={form.reps}
										min="0"
										required
									/>
								</div>
							</div>

							<div class="form-floating">
								<textarea
									id="description"
									name="description"
									class={`form-control bg-dark text-light border-secondary ${submitted && !form.description.trim() ? 'is-invalid' : ''}`}
									bind:value={form.description}
									placeholder="Describe how to perform this exercise..."
									style="height: 140px"
									required
								></textarea>
								<label for="description">Description</label>
							</div>

							<div>
								<label class="form-label text-light fw-semibold" for="duration"
									>Duration (minutes)</label
								>
								<input
									id="duration"
									name="duration"
									class={`form-control bg-dark text-light border-secondary ${submitted && (form.duration < 0 || isNaN(form.duration)) ? 'is-invalid' : ''}`}
									type="number"
									bind:value={form.duration}
									min="0"
									required
								/>
							</div>

							<div class="d-flex flex-column flex-sm-row justify-content-end gap-2 pt-2">
								<a href={resolve('/exercises')} class="btn btn-outline-light">Cancel</a>
								<button type="submit" class="btn btn-primary btn-orange" disabled={submitting}>
									{#if submitting}
										<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
										Updating...
									{:else}
										Update Exercise
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
