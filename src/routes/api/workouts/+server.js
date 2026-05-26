import { json } from '@sveltejs/kit';
import connectToDatabase from '$lib/db/mongodb';

export async function GET() {
	try {
		const db = await connectToDatabase();

		// Use aggregation with $lookup to populate exercise details
		const pipeline = [
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
		];

		const workouts = await db.collection('workouts').aggregate(pipeline).toArray();
		return json(workouts);
	} catch (err) {
		console.error('GET /api/workouts error:', err);
		return json({ error: 'Failed to fetch workouts' }, { status: 500 });
	}
}
