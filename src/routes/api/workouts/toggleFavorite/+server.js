import { json } from '@sveltejs/kit';
import connectToDatabase from '$lib/db/mongodb';
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

export async function POST({ request }) {
	try {
		const body = await request.json().catch(() => ({}));
		const workoutId = String(body.workoutId ?? '').trim();

		if (!isValidObjectId(workoutId)) {
			return json({ error: 'Invalid workout id' }, { status: 400 });
		}

		const db = await connectToDatabase();
		const _id = new ObjectId(workoutId);
		const existing = await db.collection('workouts').findOne({ _id });
		if (!existing) return json({ error: 'Workout not found' }, { status: 404 });

		const newValue = !existing.isFavorite;

		const update = { $set: { isFavorite: newValue } };
		if (newValue) update.$set.favoritedAt = new Date();
		else update.$unset = { favoritedAt: '' };

		await db.collection('workouts').updateOne({ _id }, update);

		return json({ success: true, isFavorite: newValue });
	} catch (err) {
		console.error('POST /api/workouts/toggleFavorite error:', err);
		return json({ error: 'Failed to toggle favorite' }, { status: 500 });
	}
}
