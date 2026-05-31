import connectToDatabase from '$lib/db/mongodb';

function toPlainDocument(document) {
	return JSON.parse(JSON.stringify(document));
}

function getSortMode(url) {
	const sort = String(url.searchParams.get('sort') ?? 'date').toLowerCase();
	return sort === 'level' ? 'level' : 'date';
}

function getSortDirection(url, sortMode) {
	const direction = String(url.searchParams.get('dir') ?? '').toLowerCase();
	if (direction === 'asc' || direction === 'desc') {
		return direction;
	}

	return sortMode === 'level' ? 'asc' : 'desc';
}

function getFilterValue(url, key) {
	return String(url.searchParams.get(key) ?? '').trim();
}

function getFilterValues(url, key) {
	return [
		...new Set(
			url.searchParams
				.getAll(key)
				.map((value) => String(value).trim())
				.filter(Boolean)
		)
	];
}

function buildPipeline(sortMode, sortDirection, filters) {
	const sortMultiplier = sortDirection === 'asc' ? 1 : -1;

	const pipeline = [
		{
			$addFields: {
				sortCreatedAt: { $toDate: { $ifNull: ['$createdAt', '$_id'] } },
				sortLevelOrder: {
					$switch: {
						branches: [
							{ case: { $eq: ['$level', 'Beginner'] }, then: 0 },
							{ case: { $eq: ['$level', 'Intermediate'] }, then: 1 },
							{ case: { $eq: ['$level', 'Advanced'] }, then: 2 }
						],
						default: 99
					}
				},
				exerciseCount: { $size: { $ifNull: ['$exerciseIds', []] } }
			}
		}
	];

	const match = {};
	if (filters.categories.length > 0) {
		match.categories = { $in: filters.categories };
	}
	if (filters.exerciseCount === '1-3') {
		match.exerciseCount = { $gte: 1, $lte: 3 };
	} else if (filters.exerciseCount === '4-6') {
		match.exerciseCount = { $gte: 4, $lte: 6 };
	} else if (filters.exerciseCount === '7+') {
		match.exerciseCount = { $gte: 7 };
	}
	if (filters.duration === 'lt20') {
		match.duration = { $lt: 20 };
	} else if (filters.duration === '20-40') {
		match.duration = { $gte: 20, $lte: 40 };
	} else if (filters.duration === 'gt40') {
		match.duration = { $gt: 40 };
	}

	if (Object.keys(match).length > 0) {
		pipeline.push({ $match: match });
	}

	pipeline.push(
		{
			$sort:
				sortMode === 'level'
					? { sortLevelOrder: sortMultiplier, sortCreatedAt: sortMultiplier, _id: sortMultiplier }
					: { sortCreatedAt: sortMultiplier, _id: sortMultiplier }
		},
		{
			$lookup: {
				from: 'exercises',
				localField: 'exerciseIds',
				foreignField: '_id',
				as: 'exercises'
			}
		},
		{ $addFields: { exercises: '$exercises' } }
	);

	return pipeline;
}

export async function load({ url }) {
	const sortMode = getSortMode(url);
	const sortDirection = getSortDirection(url, sortMode);
	const selectedCategories = getFilterValues(url, 'category');
	const selectedExerciseCount = getFilterValue(url, 'exerciseCount');
	const selectedDuration = getFilterValue(url, 'duration');
	try {
		const db = await connectToDatabase();
		const availableCategories = (await db.collection('workouts').distinct('categories'))
			.map((category) => String(category).trim())
			.filter(Boolean)
			.sort((a, b) => a.localeCompare(b));
		const workouts = await db
			.collection('workouts')
			.aggregate(
				buildPipeline(sortMode, sortDirection, {
					categories: selectedCategories,
					exerciseCount: selectedExerciseCount,
					duration: selectedDuration
				})
			)
			.toArray();

		return {
			workouts: workouts.map(toPlainDocument),
			availableCategories,
			sortMode,
			sortDirection,
			selectedCategories,
			selectedExerciseCount,
			selectedDuration
		};
	} catch (error) {
		console.error('GET /workouts load error:', error);
		return {
			workouts: [],
			availableCategories: [],
			sortMode,
			sortDirection,
			selectedCategories,
			selectedExerciseCount,
			selectedDuration,
			error: 'Failed to load workouts'
		};
	}
}

import { fail } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';

function isValidObjectId(id) {
	if (!id || typeof id !== 'string') return false;
	try {
		new ObjectId(id);
		return true;
	} catch {
		return false;
	}
}

export const actions = {
	toggleFavorite: async ({ request }) => {
		const form = await request.formData();
		const workoutId = String(form.get('workoutId') ?? '').trim();

		if (!isValidObjectId(workoutId)) return fail(400, { error: 'Invalid workout id' });

		try {
			const db = await connectToDatabase();
			const _id = new ObjectId(workoutId);
			const existing = await db.collection('workouts').findOne({ _id });
			if (!existing) return fail(404, { error: 'Workout not found' });

			const newValue = !existing.isFavorite;
			const update = { $set: { isFavorite: newValue } };
			if (newValue) update.$set.favoritedAt = new Date();
			else update.$unset = { favoritedAt: '' };

			await db.collection('workouts').updateOne({ _id }, update);
			return { success: true, isFavorite: newValue };
		} catch (err) {
			console.error('POST /workouts toggleFavorite action error:', err);
			return fail(500, { error: 'Failed to toggle favorite' });
		}
	}
};
