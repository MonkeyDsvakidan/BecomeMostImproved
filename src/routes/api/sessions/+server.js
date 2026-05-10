import { json } from '@sveltejs/kit'
import { ObjectId } from 'mongodb'
import connectToDatabase from '$lib/db/mongodb'

function isValidObjectId(id) {
  if (!id || typeof id !== 'string') return false
  try {
    new ObjectId(id)
    return true
  } catch (error) {
    return false
  }
}

function validateSession(body) {
  const errors = []

  if (!body || typeof body !== 'object') {
    errors.push('Request body must be a JSON object')
    return errors
  }

  const { workoutId, workoutName, startedAt, completedAt, exerciseCount, plannedDuration, actualDurationSeconds, level, categories } = body

  if (!isValidObjectId(workoutId)) errors.push('`workoutId` is required and must be a valid ObjectId string')
  if (!workoutName || typeof workoutName !== 'string') errors.push('`workoutName` is required and must be a string')
  if (!startedAt || Number.isNaN(Date.parse(startedAt))) errors.push('`startedAt` is required and must be a valid ISO date string')
  if (!completedAt || Number.isNaN(Date.parse(completedAt))) errors.push('`completedAt` is required and must be a valid ISO date string')
  if (exerciseCount !== undefined && (!Number.isFinite(exerciseCount) || exerciseCount < 0)) errors.push('`exerciseCount` must be a non-negative number')
  if (plannedDuration !== undefined && (!Number.isFinite(plannedDuration) || plannedDuration < 0)) errors.push('`plannedDuration` must be a non-negative number')
  if (actualDurationSeconds !== undefined && (!Number.isFinite(actualDurationSeconds) || actualDurationSeconds < 0)) errors.push('`actualDurationSeconds` must be a non-negative number')
  if (level !== undefined && typeof level !== 'string') errors.push('`level` must be a string')
  if (categories !== undefined && (!Array.isArray(categories) || !categories.every((category) => typeof category === 'string'))) {
    errors.push('`categories` must be an array of strings')
  }

  return errors
}

export async function GET() {
  try {
    const db = await connectToDatabase()
    const sessions = await db.collection('sessions').find({}).sort({ completedAt: -1 }).limit(25).toArray()
    return json(sessions)
  } catch (error) {
    console.error('GET /api/sessions error:', error)
    return json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

export async function POST({ request }) {
  try {
    const body = await request.json()
    const errors = validateSession(body)
    if (errors.length) return json({ errors }, { status: 400 })

    const db = await connectToDatabase()
    const now = new Date()
    const startedAt = new Date(body.startedAt)
    const completedAt = new Date(body.completedAt)
    const actualDurationSeconds = Number.isFinite(Date.parse(body.startedAt))
      ? Math.max(0, Math.round((completedAt.getTime() - startedAt.getTime()) / 1000))
      : (body.actualDurationSeconds ?? 0)

    const doc = {
      workoutId: new ObjectId(body.workoutId),
      workoutName: body.workoutName,
      startedAt,
      completedAt,
      exerciseCount: body.exerciseCount ?? 0,
      plannedDuration: body.plannedDuration ?? 0,
      actualDurationSeconds,
      level: body.level ?? 'N/A',
      categories: body.categories ?? [],
      createdAt: now,
      updatedAt: now
    }

    const result = await db.collection('sessions').insertOne(doc)
    if (!result.acknowledged) return json({ error: 'Failed to create session' }, { status: 500 })

    const created = await db.collection('sessions').findOne({ _id: result.insertedId })
    return json(created, { status: 201 })
  } catch (error) {
    console.error('POST /api/sessions error:', error)
    if (error.name === 'MongoNetworkError' || error.message?.includes('connect')) {
      return json({ error: 'Database connection error' }, { status: 503 })
    }
    return json({ error: 'Failed to create session' }, { status: 500 })
  }
}