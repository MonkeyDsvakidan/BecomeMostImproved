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
		const doc = await db.collection('exercises').findOne({ _id: new ObjectId(id) });
		if (!doc) return json({ error: 'Exercise not found' }, { status: 404 });
		return json(doc);
	} catch (err) {
		console.error('GET /api/exercises/[id] error:', err);
		return json({ error: 'Failed to fetch exercise' }, { status: 500 });
	}
}

export async function DELETE({ params }) {
	const { id } = params;
	if (!isValidObjectId(id)) return json({ error: 'Invalid id' }, { status: 400 });

	try {
		const db = await connectToDatabase();
		const oid = new ObjectId(id);
		const result = await db.collection('exercises').deleteOne({ _id: oid });
		if (result.deletedCount === 0) return json({ error: 'Exercise not found' }, { status: 404 });
		return json({ deleted: true });
	} catch (err) {
		console.error('DELETE /api/exercises/[id] error:', err);
		return json({ error: 'Failed to delete exercise' }, { status: 500 });
	}
}
