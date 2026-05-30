import { json } from '@sveltejs/kit';
import connectToDatabase from '$lib/db/mongodb';

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
	return [...new Set(url.searchParams.getAll(key).map((value) => String(value).trim()).filter(Boolean))];
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
		},
	];

	const match = {};
	// q search across name, description, categories
	if (filters.q) {
		const q = String(filters.q).trim();
		if (q) {
			const regex = { $regex: q, $options: 'i' };
			// Only search by `name` here; other filters use dedicated controls
			match.name = regex;
		}
	}
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
		{
			$addFields: {
				exercises: '$exercises'
			}
		}
	);

	return pipeline;
}

export async function GET({ url }) {
	try {
		const db = await connectToDatabase();
		const sortMode = getSortMode(url);
		const sortDirection = getSortDirection(url, sortMode);
		const selectedCategories = getFilterValues(url, 'category');
		const selectedExerciseCount = getFilterValue(url, 'exerciseCount');
		const selectedDuration = getFilterValue(url, 'duration');
		const q = getFilterValue(url, 'q');
		const workouts = await db
			.collection('workouts')
			.aggregate(
				buildPipeline(sortMode, sortDirection, {
					categories: selectedCategories,
					exerciseCount: selectedExerciseCount,
					duration: selectedDuration,
					q
				})
			)
			.toArray();
		return json(workouts);
	} catch (err) {
		console.error('GET /api/workouts error:', err);
		return json({ error: 'Failed to fetch workouts' }, { status: 500 });
	}
}
