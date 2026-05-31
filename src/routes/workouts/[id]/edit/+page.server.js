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

export async function load({ params }) {
	const { id } = params;
	if (!isValidObjectId(id)) {
		return {
			workout: null,
			exercises: [],
			error: 'Invalid workout id'
		};
	}

	try {
		const db = await connectToDatabase();
		const oid = new ObjectId(id);
		const [workout, exercises] = await Promise.all([
			db
				.collection('workouts')
				.aggregate([
					{ $match: { _id: oid } },
					{
						$lookup: {
							from: 'exercises',
							localField: 'exerciseIds',
							foreignField: '_id',
							as: 'exercises'
						}
					},
					{ $addFields: { exercises: '$exercises' } }
				])
				.toArray(),
			db.collection('exercises').find({}).sort({ createdAt: -1 }).toArray()
		]);

		const loadedWorkout = workout[0] ? toPlainDocument(workout[0]) : null;

		if (!loadedWorkout) {
			return {
				workout: null,
				exercises: exercises.map(toPlainDocument),
				error: 'Workout not found'
			};
		}

		return {
			workout: loadedWorkout,
			exercises: exercises.map(toPlainDocument)
		};
	} catch (error) {
		console.error('GET /workouts/[id]/edit load error:', error);
		return {
			workout: null,
			exercises: [],
			error: 'Failed to load workout'
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
			return fail(400, { error: 'Invalid workout id' });
		}

		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const categories = formData
			.getAll('categories')
			.map((item) => String(item).trim())
			.filter(Boolean);
		const level = String(formData.get('level') ?? '').trim();
		const durationResult = parseNonNegativeNumber(formData.get('duration'), 'Duration');
		const autoDuration = String(formData.get('autoDuration') ?? 'true') === 'true';
		const pausePerExerciseResult = parseNonNegativeNumber(
			formData.get('pausePerExercise') ?? '0',
			'Pause per exercise'
		);
		const exerciseIds = formData
			.getAll('exerciseIds')
			.map((item) => String(item).trim())
			.filter(Boolean);

		const errors = [];
		if (!name) errors.push('Name is required');
		if (categories.length === 0) errors.push('At least one category is required');
		if (!level) errors.push('Level is required');
		if (durationResult.error) errors.push(durationResult.error);
		if (pausePerExerciseResult.error) errors.push(pausePerExerciseResult.error);
		if (exerciseIds.length === 0) errors.push('At least one exercise must be selected');

		if (errors.length > 0) {
			return fail(400, { errors });
		}

		try {
			const db = await connectToDatabase();
			const oid = new ObjectId(id);

			let finalDuration = durationResult.value;

			// If autoDuration is requested, compute server-side from exercises
			if (autoDuration) {
				const exerciseObjectIds = exerciseIds.map((exerciseId) => new ObjectId(exerciseId));
				const exercises = await db
					.collection('exercises')
					.find({ _id: { $in: exerciseObjectIds } })
					.toArray();

				const sum = exercises.reduce((s, ex) => s + (Number(ex.duration) || 0), 0);
				const pause = (pausePerExerciseResult.value || 0) * exerciseObjectIds.length;
				finalDuration = sum + pause;
			}

			const updateResult = await db.collection('workouts').updateOne(
				{ _id: oid },
				{
					$set: {
						name,
						duration: finalDuration,
						categories,
						level,
						exerciseIds: exerciseIds.map((exerciseId) => new ObjectId(exerciseId)),
						updatedAt: new Date()
					}
				}
			);

			if (updateResult.matchedCount === 0) {
				return fail(404, { error: 'Workout not found' });
			}

			const updatedWorkout = await db
				.collection('workouts')
				.aggregate([
					{ $match: { _id: oid } },
					{
						$lookup: {
							from: 'exercises',
							localField: 'exerciseIds',
							foreignField: '_id',
							as: 'exercises'
						}
					},
					{ $addFields: { exercises: '$exercises' } }
				])
				.toArray();

			if (!updatedWorkout[0]) {
				return fail(404, { error: 'Workout not found' });
			}

			return {
				success: true,
				message: 'Workout updated successfully!'
			};
		} catch (error) {
			console.error('POST /workouts/[id]/edit action error:', error);
			return fail(500, { error: 'Failed to update workout' });
		}
	}
};
