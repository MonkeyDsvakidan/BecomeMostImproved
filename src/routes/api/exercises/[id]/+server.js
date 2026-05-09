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

function validateUpdate(body) {
  if (!body || typeof body !== 'object') return ['Request body must be a JSON object']

  const allowed = ['name', 'category', 'level', 'description', 'sets', 'reps', 'duration']
  const keys = Object.keys(body)
  if (keys.length === 0) return ['Request body must contain at least one updatable field']

  const errors = []
  for (const k of keys) {
    if (!allowed.includes(k)) {
      errors.push(`Unknown field: ${k}`)
      continue
    }
    const v = body[k]
    if (k === 'name' || k === 'level' || k === 'description') {
      if (typeof v !== 'string') errors.push(`
\`${k}\` must be a string`)
    }
    if (k === 'category') {
      if (!Array.isArray(v) || !v.every(i => typeof i === 'string')) errors.push('`category` must be an array of strings')
    }
    if (k === 'sets' || k === 'reps' || k === 'duration') {
      if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) errors.push(`\`${k}\` must be a non-negative number`)
    }
  }

  return errors
}

export async function GET({ params }) {
  const { id } = params
  if (!isValidObjectId(id)) return json({ error: 'Invalid id' }, { status: 400 })

  try {
    const db = await connectToDatabase()
    const doc = await db.collection('exercises').findOne({ _id: new ObjectId(id) })
    if (!doc) return json({ error: 'Exercise not found' }, { status: 404 })
    return json(doc)
  } catch (err) {
    console.error('GET /api/exercises/[id] error:', err)
    return json({ error: 'Failed to fetch exercise' }, { status: 500 })
  }
}

export async function PUT({ params, request }) {
  const { id } = params
  if (!isValidObjectId(id)) return json({ error: 'Invalid id' }, { status: 400 })

  try {
    const body = await request.json()
    const errors = validateUpdate(body)
    if (errors.length) return json({ errors }, { status: 400 })

    const db = await connectToDatabase()
    const oid = new ObjectId(id)
    const update = { ...body, updatedAt: new Date() }

    const result = await db.collection('exercises').findOneAndUpdate(
      { _id: oid },
      { $set: update },
      { returnDocument: 'after' }
    )

    if (!result.value) return json({ error: 'Exercise not found' }, { status: 404 })
    return json(result.value)
  } catch (err) {
    console.error('PUT /api/exercises/[id] error:', err)
    if (err.name === 'MongoNetworkError' || err.message?.includes('connect')) {
      return json({ error: 'Database connection error' }, { status: 503 })
    }
    return json({ error: 'Failed to update exercise' }, { status: 500 })
  }
}

export async function DELETE({ params }) {
  const { id } = params
  if (!isValidObjectId(id)) return json({ error: 'Invalid id' }, { status: 400 })

  try {
    const db = await connectToDatabase()
    const oid = new ObjectId(id)
    const result = await db.collection('exercises').deleteOne({ _id: oid })
    if (result.deletedCount === 0) return json({ error: 'Exercise not found' }, { status: 404 })
    return json({ deleted: true })
  } catch (err) {
    console.error('DELETE /api/exercises/[id] error:', err)
    return json({ error: 'Failed to delete exercise' }, { status: 500 })
  }
}
