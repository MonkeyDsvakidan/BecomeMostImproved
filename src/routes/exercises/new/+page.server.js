import { fail } from '@sveltejs/kit';
import connectToDatabase from '$lib/db/mongodb';

function parseNonNegativeNumber(value, fieldName) {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed < 0) {
		return { error: `${fieldName} must be a non-negative number` };
	}
	return { value: parsed };
}

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const categories = formData
			.getAll('categories')
			.map((item) => String(item).trim())
			.filter(Boolean);
		const level = String(formData.get('level') ?? '').trim();
		const description = String(formData.get('description') ?? '').trim();

		const setsResult = parseNonNegativeNumber(formData.get('sets'), 'Sets');
		const repsResult = parseNonNegativeNumber(formData.get('reps'), 'Reps');
		const durationResult = parseNonNegativeNumber(formData.get('duration'), 'Duration');

		const errors = [];
		if (!name) errors.push('Name is required');
		if (categories.length === 0) errors.push('At least one category is required');
		if (!level) errors.push('Level is required');
		if (setsResult.error) errors.push(setsResult.error);
		if (repsResult.error) errors.push(repsResult.error);
		if (durationResult.error) errors.push(durationResult.error);

		if (errors.length > 0) {
			return fail(400, { errors });
		}

		try {
			const db = await connectToDatabase();
			const now = new Date();
			const doc = {
				name,
				category: categories,
				level,
				description,
				sets: setsResult.value,
				reps: repsResult.value,
				duration: durationResult.value,
				createdAt: now,
				updatedAt: now
			};

			const result = await db.collection('exercises').insertOne(doc);
			if (!result.acknowledged) {
				return fail(500, { error: 'Failed to create exercise' });
			}

			return {
				success: true,
				message: 'Exercise created!'
			};
		} catch (error) {
			console.error('POST /exercises/new action error:', error);
			return fail(500, { error: 'Failed to create exercise' });
		}
	}
};
