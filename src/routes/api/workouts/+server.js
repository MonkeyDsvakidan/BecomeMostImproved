import { json } from '@sveltejs/kit'
import { ObjectId } from 'mongodb'
import connectToDatabase from '$lib/db/mongodb'

function isValidObjectId(id) {
  if (!id || typeof id !== 'string') return false
  try {
    new ObjectId(id)
    return true
  } catch (e) {
    return false
  }
}

function validateWorkout(body) {
  const errors = []
  if (!body || typeof body !== 'object') {
    errors.push('Request body must be a JSON object')
    return errors
  }

  const { name, duration, categories, level, exerciseIds } = body

  if (!name || typeof name !== 'string') errors.push('`name` is required and must be a string')
  if (duration === undefined || typeof duration !== 'number' || !Number.isFinite(duration) || duration < 0) {
    errors.push('`duration` is required and must be a non-negative number')
  }
  if (!Array.isArray(categories) || categories.length === 0 || !categories.every(c => typeof c === 'string')) {
    errors.push('`categories` is required and must be a non-empty array of strings')
  }
  if (!level || typeof level !== 'string') errors.push('`level` is required and must be a string')

  if (!Array.isArray(exerciseIds)) {
    errors.push('`exerciseIds` is required and must be an array of ObjectId strings')
  } else {
    for (const id of exerciseIds) {
      if (typeof id !== 'string' || !isValidObjectId(id)) {
        errors.push('Each `exerciseId` must be a valid ObjectId string')
        break
      }
    }
  }

  return errors
}

export async function GET() {
  try {
    const db = await connectToDatabase()

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
    ]

    const workouts = await db.collection('workouts').aggregate(pipeline).toArray()
    return json(workouts)
  } catch (err) {
    console.error('GET /api/workouts error:', err)
    return json({ error: 'Failed to fetch workouts' }, { status: 500 })
  }
}

export async function POST({ request }) {
  try {
    const body = await request.json()
    const errors = validateWorkout(body)
    if (errors.length) return json({ errors }, { status: 400 })

    const db = await connectToDatabase()

    // Convert exerciseIds to ObjectId instances
    const exerciseObjectIds = body.exerciseIds.map((id) => new ObjectId(id))

    const now = new Date()
    const doc = {
      name: body.name,
      duration: body.duration,
      categories: body.categories,
      level: body.level,
      exerciseIds: exerciseObjectIds,
      createdAt: now,
      updatedAt: now
    }

    const result = await db.collection('workouts').insertOne(doc)
    if (!result.acknowledged) return json({ error: 'Failed to create workout' }, { status: 500 })

    // Return the created workout with populated exercise details
    const insertedId = result.insertedId
    const pipeline = [
      { $match: { _id: insertedId } },
      {
        $lookup: {
          from: 'exercises',
          localField: 'exerciseIds',
          foreignField: '_id',
          as: 'exercises'
        }
      },
      { $addFields: { exercises: '$exercises' } }
    ]

    const [created] = await db.collection('workouts').aggregate(pipeline).toArray()
    return json(created, { status: 201 })
  } catch (err) {
    console.error('POST /api/workouts error:', err)
    if (err.name === 'MongoNetworkError' || err.message?.includes('connect')) {
      return json({ error: 'Database connection error' }, { status: 503 })
    }
    return json({ error: 'Failed to create workout' }, { status: 500 })
  }
}
