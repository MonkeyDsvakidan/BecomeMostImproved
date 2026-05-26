import { ObjectId } from 'mongodb';
import { fail } from '@sveltejs/kit';
import connectToDatabase from '$lib/db/mongodb';

function isValidObjectId(id) {
	if (!id || typeof id !== 'string') return false;
	try {
		new ObjectId(id);
		return true;
	} catch {
		return false;
	}
}

function toPlainDocument(document) {
	return JSON.parse(JSON.stringify(document));
}

function normalizeExercise(exercise) {
	if (!exercise) return null;
	return {
		...exercise,
		categories: exercise.category ?? exercise.categories ?? []
	};
}

export async function load({ params }) {
	const { id } = params;
	if (!isValidObjectId(id)) {
		return {
			exercise: null,
			error: 'Invalid exercise id'
		};
	}

	try {
		const db = await connectToDatabase();
		const doc = await db.collection('exercises').findOne({ _id: new ObjectId(id) });

		if (!doc) {
			return {
				exercise: null,
				error: 'Exercise not found'
			};
		}

		return {
			exercise: normalizeExercise(toPlainDocument(doc))
		};
	} catch (error) {
		console.error('GET /exercises/[id]/edit load error:', error);
		return {
			exercise: null,
			error: 'Failed to load exercise'
		};
	}
}

function parseNonNegativeNumber(value, fieldName) {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed < 0) {
		return { error: `${fieldName} must be a non-negative number` };
	}
	return { value: parsed };
}

export const actions = {
	default: async ({ params, request }) => {
		const { id } = params;

		if (!isValidObjectId(id)) {
			return fail(400, { error: 'Invalid exercise id' });
		}

		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const category = formData
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
		if (category.length === 0) errors.push('At least one category is required');
		if (!level) errors.push('Level is required');
		if (setsResult.error) errors.push(setsResult.error);
		if (repsResult.error) errors.push(repsResult.error);
		if (durationResult.error) errors.push(durationResult.error);

		if (errors.length > 0) {
			return fail(400, { errors });
		}

		try {
			const db = await connectToDatabase();
			const updateResult = await db.collection('exercises').updateOne(
				{ _id: new ObjectId(id) },
				{
					$set: {
						name,
						category,
						level,
						description,
						sets: setsResult.value,
						reps: repsResult.value,
						duration: durationResult.value,
						updatedAt: new Date()
					}
				}
			);

			if (updateResult.matchedCount === 0) {
				return fail(404, { error: 'Exercise not found' });
			}

			const updatedExercise = await db.collection('exercises').findOne({ _id: new ObjectId(id) });

			if (!updatedExercise) {
				return fail(404, { error: 'Exercise not found' });
			}

			return {
				success: true,
				message: 'Exercise updated successfully!',
				exercise: updatedExercise
			};
		} catch (error) {
			console.error('POST /exercises/[id]/edit action error:', error);
			return fail(500, { error: 'Failed to update exercise' });
		}
	}
};
