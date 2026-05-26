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

function toPlainDocument(document) {
	return JSON.parse(JSON.stringify(document));
}

export async function load({ params }) {
	const { id } = params;
	if (!isValidObjectId(id)) {
		return {
			workout: null,
			error: 'Invalid workout id'
		};
	}

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
		if (!doc) {
			return {
				workout: null,
				error: 'Workout not found'
			};
		}

		return {
			workout: toPlainDocument(doc)
		};
	} catch (error) {
		console.error('GET /workouts/[id]/session load error:', error);
		return {
			workout: null,
			error: 'Failed to load workout'
		};
	}
}
