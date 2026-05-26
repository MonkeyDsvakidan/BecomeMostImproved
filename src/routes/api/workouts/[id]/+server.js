import { json } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
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

export async function GET({ params }) {
	const { id } = params;
	if (!isValidObjectId(id)) return json({ error: 'Invalid id' }, { status: 400 });

	try {
		const db = await connectToDatabase();
		const oid = new ObjectId(id);

		const pipeline = [
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
		];

		const [doc] = await db.collection('workouts').aggregate(pipeline).toArray();
		if (!doc) return json({ error: 'Workout not found' }, { status: 404 });
		return json(doc);
	} catch (err) {
		console.error('GET /api/workouts/[id] error:', err);
		return json({ error: 'Failed to fetch workout' }, { status: 500 });
	}
}

export async function DELETE({ params }) {
	const { id } = params;
	if (!isValidObjectId(id)) return json({ error: 'Invalid id' }, { status: 400 });

	try {
		const db = await connectToDatabase();
		const oid = new ObjectId(id);
		const result = await db.collection('workouts').deleteOne({ _id: oid });
		if (result.deletedCount === 0) return json({ error: 'Workout not found' }, { status: 404 });
		return json({ deleted: true });
	} catch (err) {
		console.error('DELETE /api/workouts/[id] error:', err);
		return json({ error: 'Failed to delete workout' }, { status: 500 });
	}
}
