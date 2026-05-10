import connectToDatabase from '$lib/db/mongodb'

function toPlainDocument(document) {
  return JSON.parse(JSON.stringify(document))
}

export async function load() {
  try {
    const db = await connectToDatabase()
    const exercises = await db.collection('exercises').find({}).sort({ createdAt: -1 }).toArray()

    return {
      exercises: exercises.map(toPlainDocument)
    }
  } catch (error) {
    console.error('GET /exercises load error:', error)
    return {
      exercises: [],
      error: 'Failed to load exercises'
    }
  }
}