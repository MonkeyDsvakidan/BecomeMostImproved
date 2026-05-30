import connectToDatabase from '$lib/db/mongodb';
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

function startOfWeek(date) {
	const value = new Date(date);
	const day = value.getDay();
	const diff = value.getDate() - day + (day === 0 ? -6 : 1);
	value.setDate(diff);
	value.setHours(0, 0, 0, 0);
	return value;
}

function formatRecentSession(session) {
	const actualDurationSeconds = session.actualDurationSeconds ?? 0;
	return {
		_id: session._id.toString(),
		workoutId: session.workoutId?.toString?.() ?? session.workoutId,
		workoutName: session.workoutName,
		completedAt: session.completedAt,
		exerciseCount: session.exerciseCount ?? 0,
		plannedDuration: session.plannedDuration ?? 0,
		actualDurationSeconds,
		actualDurationLabel: formatDuration(actualDurationSeconds),
		level: session.level ?? 'N/A',
		categories: session.categories ?? []
	};
}

function formatDuration(seconds) {
	const totalSeconds = Math.max(0, Math.round(seconds ?? 0));
	const minutes = Math.floor(totalSeconds / 60);
	const remainingSeconds = totalSeconds % 60;
	return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function emptyStats() {
	return {
		totalWorkouts: 0,
		totalExercises: 0,
		totalSessions: 0,
		workoutsCompletedThisWeek: 0,
		totalTrainingMinutes: 0,
		averageWorkoutDuration: 0,
		averageExercisesPerWorkout: '0.0',
		mostUsedWorkout: null,
		mostUsedWorkoutCount: 0,
		levelDistribution: {},
		topCategories: []
	};
}

function toPlainDocument(document) {
	return JSON.parse(JSON.stringify(document));
}

export async function load() {
	try {
		const db = await connectToDatabase();
		const [workouts, exercises, sessions] = await Promise.all([
			db
				.collection('workouts')
				.aggregate([
					{
						$lookup: {
							from: 'exercises',
							localField: 'exerciseIds',
							foreignField: '_id',
							as: 'exercises'
						}
					},
					{ $addFields: { exercises: '$exercises' } },
					{ $sort: { createdAt: -1 } }
				])
				.toArray(),
			db.collection('exercises').find({}).sort({ createdAt: -1 }).toArray(),
			db.collection('sessions').find({}).sort({ completedAt: -1 }).limit(10).toArray()
		]);

		const workoutById = new Map(workouts.map((workout) => [workout._id.toString(), workout]));

		const weekStart = startOfWeek(new Date());
		const workoutsCompletedThisWeek = sessions.filter((session) => {
			const completedAt = session.completedAt ? new Date(session.completedAt) : null;
			return completedAt && completedAt >= weekStart;
		}).length;

		const totalTrainingSeconds = sessions.reduce(
			(sum, session) => sum + (session.actualDurationSeconds ?? 0),
			0
		);

		const workoutCounts = new Map();
		for (const session of sessions) {
			const key = session.workoutId?.toString?.() ?? session.workoutName ?? 'unknown';
			workoutCounts.set(key, (workoutCounts.get(key) ?? 0) + 1);
		}

		let mostUsedWorkout = null;
		let mostUsedWorkoutCount = 0;
		for (const session of sessions) {
			const key = session.workoutId?.toString?.() ?? session.workoutName ?? 'unknown';
			const count = workoutCounts.get(key) ?? 0;
			if (count > mostUsedWorkoutCount) {
				mostUsedWorkout =
					workoutById.get(session.workoutId?.toString?.() ?? '')?.name ?? session.workoutName;
				mostUsedWorkoutCount = count;
			}
		}

		const levelDistribution = workouts.reduce((accumulator, workout) => {
			const level = workout.level || 'N/A';
			accumulator[level] = (accumulator[level] ?? 0) + 1;
			return accumulator;
		}, {});

		const categoryCounts = workouts.reduce((accumulator, workout) => {
			for (const category of workout.categories ?? []) {
				accumulator[category] = (accumulator[category] ?? 0) + 1;
			}
			return accumulator;
		}, {});

		const totalWorkoutExercises = workouts.reduce(
			(sum, workout) => sum + (workout.exercises?.length ?? 0),
			0
		);

		const plainWorkouts = workouts.map(toPlainDocument);
		const plainExercises = exercises.map(toPlainDocument);
		const plainSessions = sessions.map((session) => {
			const plainSession = toPlainDocument(session);
			const currentWorkout = workoutById.get(session.workoutId?.toString?.() ?? '');
			const workoutName = currentWorkout?.name ?? session.workoutName;
			const plannedDuration = currentWorkout?.duration ?? session.plannedDuration ?? 0;
			const level = currentWorkout?.level ?? session.level ?? 'N/A';
			const categories = currentWorkout?.categories ?? session.categories ?? [];

			return {
				...plainSession,
				workoutName,
				plannedDuration,
				level,
				categories
			};
		});

		const favoriteWorkouts = plainWorkouts
			.filter((w) => Boolean(w.isFavorite))
			.sort((a, b) => {
				// prefer recently favorited, fallback to name
				if (a.favoritedAt && b.favoritedAt) return new Date(b.favoritedAt) - new Date(a.favoritedAt);
				if (a.favoritedAt) return -1;
				if (b.favoritedAt) return 1;
				return a.name.localeCompare(b.name);
			})
			.slice(0, 6);

		return {
			workouts: plainWorkouts,
			exercises: plainExercises,
			favoriteWorkouts,
			recentActivity: plainSessions.slice(0, 5).map(formatRecentSession),
			stats: {
				totalWorkouts: plainWorkouts.length,
				totalExercises: plainExercises.length,
				totalSessions: plainSessions.length,
				workoutsCompletedThisWeek,
				totalTrainingMinutes: Math.round(totalTrainingSeconds / 60),
				averageWorkoutDuration:
					plainWorkouts.length > 0
						? Math.round(
								plainWorkouts.reduce((sum, workout) => sum + (workout.duration ?? 0), 0) /
									plainWorkouts.length
							)
						: 0,
				averageExercisesPerWorkout:
					plainWorkouts.length > 0
						? (totalWorkoutExercises / plainWorkouts.length).toFixed(1)
						: '0.0',
				mostUsedWorkout,
				mostUsedWorkoutCount,
				levelDistribution,
				topCategories: Object.entries(categoryCounts)
					.sort((a, b) => b[1] - a[1])
					.slice(0, 3)
					.map(([name, count]) => ({ name, count }))
			}
		};
	} catch (error) {
		console.error('GET / load error:', error);
		return {
			workouts: [],
			exercises: [],
			favoriteWorkouts: [],
			recentActivity: [],
			stats: emptyStats()
		};
	}
}

export const actions = {
	deleteSession: async ({ request }) => {
		const formData = await request.formData();
		const sessionId = String(formData.get('sessionId') ?? '').trim();

		if (!sessionId || !isValidObjectId(sessionId)) {
			return fail(400, { error: 'Invalid session id' });
		}

		try {
			const db = await connectToDatabase();
			const result = await db.collection('sessions').deleteOne({ _id: new ObjectId(sessionId) });

			if (result.deletedCount === 0) {
				return fail(404, { error: 'Session not found' });
			}

			return { success: true };
		} catch (error) {
			console.error('POST / deleteSession action error:', error);
			return fail(500, { error: 'Failed to remove session from history' });
		}
	},
	toggleFavorite: async ({ request }) => {
		const form = await request.formData();
		const workoutId = String(form.get('workoutId') ?? '').trim();

		if (!isValidObjectId(workoutId)) return fail(400, { error: 'Invalid workout id' });

		try {
			const db = await connectToDatabase();
			const _id = new ObjectId(workoutId);
			const existing = await db.collection('workouts').findOne({ _id });
			if (!existing) return fail(404, { error: 'Workout not found' });

			const newValue = !Boolean(existing.isFavorite);
			const update = { $set: { isFavorite: newValue } };
			if (newValue) update.$set.favoritedAt = new Date();
			else update.$unset = { favoritedAt: '' };

			await db.collection('workouts').updateOne({ _id }, update);
			return { success: true, isFavorite: newValue };
		} catch (err) {
			console.error('POST / toggleFavorite action error:', err);
			return fail(500, { error: 'Failed to toggle favorite' });
		}
	}
};

