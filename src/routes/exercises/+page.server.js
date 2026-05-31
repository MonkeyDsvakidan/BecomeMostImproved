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

async function getAvailableCategories(collection) {
	const [singular, plural] = await Promise.all([
		collection.distinct('category'),
		collection.distinct('categories')
	]);

	return [
		...new Set(
			[...singular, ...plural].flatMap((value) => (Array.isArray(value) ? value : [value]))
		)
	]
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
	if (filters.categories.length > 0) {
		match.$or = [
			{ category: { $in: filters.categories } },
			{ categories: { $in: filters.categories } }
		];
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

	pipeline.push({
		$sort:
			sortMode === 'level'
				? { sortLevelOrder: sortMultiplier, sortCreatedAt: sortMultiplier, _id: sortMultiplier }
				: { sortCreatedAt: sortMultiplier, _id: sortMultiplier }
	});

	return pipeline;
}

export async function load({ url }) {
	const sortMode = getSortMode(url);
	const sortDirection = getSortDirection(url, sortMode);
	const selectedCategories = getFilterValues(url, 'category');
	const selectedLevel = getFilterValue(url, 'level');
	const selectedDuration = getFilterValue(url, 'duration');
	try {
		const db = await connectToDatabase();
		const availableCategories = await getAvailableCategories(db.collection('exercises'));
		const exercises = await db
			.collection('exercises')
			.aggregate(
				buildPipeline(sortMode, sortDirection, {
					categories: selectedCategories,
					level: selectedLevel,
					duration: selectedDuration
				})
			)
			.toArray();

		return {
			exercises: exercises.map(toPlainDocument),
			availableCategories,
			sortMode,
			sortDirection,
			selectedCategories,
			selectedLevel,
			selectedDuration
		};
	} catch (error) {
		console.error('GET /exercises load error:', error);
		return {
			exercises: [],
			availableCategories: [],
			sortMode,
			sortDirection,
			selectedCategories,
			selectedLevel,
			selectedDuration,
			error: 'Failed to load exercises'
		};
	}
}
