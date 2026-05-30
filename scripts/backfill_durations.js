import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
	console.error('MONGODB_URI not set. Aborting.');
	process.exit(1);
}

async function main() {
	const client = new MongoClient(uri, { maxPoolSize: 10 });
	try {
		await client.connect();

		let dbName = 'BecomeMostImproved';
		try {
			const parsed = new URL(uri);
			const pathname = parsed.pathname || '';
			if (pathname && pathname !== '/') dbName = pathname.replace(/^\//, '');
		} catch (e) {
			// ignore
		}

		const db = client.db(dbName);
		const workouts = await db.collection('workouts').find({}).toArray();
		console.log(`Found ${workouts.length} workouts`);

		let updated = 0;
		for (const w of workouts) {
			const exerciseIds = (w.exerciseIds || []).map((id) => (typeof id === 'string' ? new ObjectId(id) : id));
			if (exerciseIds.length === 0) continue;
			const exercises = await db.collection('exercises').find({ _id: { $in: exerciseIds } }).toArray();
			const sum = exercises.reduce((s, ex) => s + (Number(ex.duration) || 0), 0);
			// If you want pauses, set pausePerExercise here (minutes)
			const pausePerExercise = 0;
			const finalDuration = sum + pausePerExercise * exerciseIds.length;

			if (w.duration !== finalDuration) {
				await db.collection('workouts').updateOne({ _id: w._id }, { $set: { duration: finalDuration, updatedAt: new Date() } });
				updated++;
				console.log(`Updated workout ${w._id} (${w.name}) from ${w.duration} -> ${finalDuration}`);
			}
		}

		console.log(`Backfill complete. Updated ${updated} workouts.`);
	} catch (err) {
		console.error('Backfill error', err);
	} finally {
		await client.close();
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});