import { json } from '@sveltejs/kit';
import connectToDatabase from '$lib/db/mongodb';

export async function GET() {
	try {
		const db = await connectToDatabase();
		const exercises = await db.collection('exercises').find({}).toArray();
		return json(exercises);
	} catch (err) {
		console.error('GET /api/exercises error:', err);
		return json({ error: 'Failed to fetch exercises' }, { status: 500 });
	}
}
