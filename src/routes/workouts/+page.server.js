import connectToDatabase from '$lib/db/mongodb'

function toPlainDocument(document) {
  return JSON.parse(JSON.stringify(document))
}

export async function load() {
  try {
    const db = await connectToDatabase()
    const workouts = await db.collection('workouts').aggregate([
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
    ]).toArray()

    return {
      workouts: workouts.map(toPlainDocument)
    }
  } catch (error) {
    console.error('GET /workouts load error:', error)
    return {
      workouts: [],
      error: 'Failed to load workouts'
    }
  }
}