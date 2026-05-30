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

function getAvailableCategoriesFromDocs(docs) {
	return [...new Set(docs.flatMap((doc) => [doc.category, doc.categories].flat()))]
		.map((category) => String(category).trim())
		.filter(Boolean)
		.sort((a, b) => a.localeCompare(b));
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
				}
			}
		}
	];

	const match = {};
	// full-text-ish search q
	if (filters.q) {
		const q = String(filters.q).trim();
		if (q) {
			const regex = { $regex: q, $options: 'i' };
			// Only search by `name` here; other filters use dedicated controls
			match.name = regex;
		}
	}
	if (filters.categories.length > 0) {
		match.$or = [{ category: { $in: filters.categories } }, { categories: { $in: filters.categories } }];
	}
	if (filters.level) {
		match.level = filters.level;
	}
	if (filters.duration === 'lt10') {
		match.duration = { $lt: 10 };
	} else if (filters.duration === '10-20') {
		match.duration = { $gte: 10, $lte: 20 };
	} else if (filters.duration === 'gt20') {
		match.duration = { $gt: 20 };
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
		const selectedLevel = getFilterValue(url, 'level');
		const selectedDuration = getFilterValue(url, 'duration');
		const q = getFilterValue(url, 'q');
		const exercises = await db
			.collection('exercises')
			.aggregate(
				buildPipeline(sortMode, sortDirection, {
					categories: selectedCategories,
					level: selectedLevel,
					duration: selectedDuration,
					q
				})
			)
			.toArray();
		return json(exercises);
	} catch (err) {
		console.error('GET /api/exercises error:', err);
		return json({ error: 'Failed to fetch exercises' }, { status: 500 });
	}
}
