import { json } from '@sveltejs/kit'
import connectToDatabase from '$lib/db/mongodb'

function validateExercise(body) {
  const errors = []
  if (!body || typeof body !== 'object') {
    errors.push('Request body must be a JSON object')
    return errors
  }

  const { name, category, level, description, sets, reps, duration } = body

  if (!name || typeof name !== 'string') errors.push('`name` is required and must be a string')
  if (!Array.isArray(category) || category.length === 0 || !category.every(c => typeof c === 'string')) {
    errors.push('`category` is required and must be a non-empty array of strings')
  }
  if (!level || typeof level !== 'string') errors.push('`level` is required and must be a string')
  if (!description || typeof description !== 'string') errors.push('`description` is required and must be a string')

  if (sets === undefined || typeof sets !== 'number' || !Number.isFinite(sets) || sets < 0) {
    errors.push('`sets` is required and must be a non-negative number')
  }
  if (reps === undefined || typeof reps !== 'number' || !Number.isFinite(reps) || reps < 0) {
    errors.push('`reps` is required and must be a non-negative number')
  }
  if (duration === undefined || typeof duration !== 'number' || !Number.isFinite(duration) || duration < 0) {
    errors.push('`duration` is required and must be a non-negative number')
  }

  return errors
}

export async function GET() {
  try {
    const db = await connectToDatabase()
    const exercises = await db.collection('exercises').find({}).toArray()
    return json(exercises)
  } catch (err) {
    console.error('GET /api/exercises error:', err)
    return json({ error: 'Failed to fetch exercises' }, { status: 500 })
  }
}

export async function POST({ request }) {
  try {
    const body = await request.json()

    const errors = validateExercise(body)
    if (errors.length) {
      return json({ errors }, { status: 400 })
    }

    const db = await connectToDatabase()
    const now = new Date()
    const doc = {
      name: body.name,
      category: body.category,
      level: body.level,
      description: body.description,
      sets: body.sets,
      reps: body.reps,
      duration: body.duration,
      createdAt: now,
      updatedAt: now
    }

    const result = await db.collection('exercises').insertOne(doc)

    if (!result.acknowledged) {
      return json({ error: 'Failed to create exercise' }, { status: 500 })
    }

    const created = await db.collection('exercises').findOne({ _id: result.insertedId })
    return json(created, { status: 201 })
  } catch (err) {
    console.error('POST /api/exercises error:', err)
    if (err.name === 'MongoNetworkError' || err.message?.includes('connect')) {
      return json({ error: 'Database connection error' }, { status: 503 })
    }
    return json({ error: 'Failed to create exercise' }, { status: 500 })
  }
}
