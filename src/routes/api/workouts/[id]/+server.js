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

function validateWorkoutUpdate(body) {
  if (!body || typeof body !== 'object') return ['Request body must be a JSON object']

  const allowed = ['name', 'duration', 'categories', 'level', 'exerciseIds']
  const keys = Object.keys(body)
  if (keys.length === 0) return ['Request body must contain at least one updatable field']

  const errors = []
  for (const k of keys) {
    if (!allowed.includes(k)) {
      errors.push(`Unknown field: ${k}`)
      continue
    }
    const v = body[k]
    if (k === 'name' || k === 'level') {
      if (typeof v !== 'string') errors.push(`${k} must be a string`)
    }
    if (k === 'duration') {
      if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) errors.push('duration must be a non-negative number')
    }
    if (k === 'categories') {
      if (!Array.isArray(v) || !v.every(i => typeof i === 'string')) errors.push('categories must be an array of strings')
    }
    if (k === 'exerciseIds') {
      if (!Array.isArray(v)) {
        errors.push('exerciseIds must be an array of ObjectId strings')
      } else {
        for (const id of v) {
          if (typeof id !== 'string' || !isValidObjectId(id)) {
            errors.push('Each exerciseId must be a valid ObjectId string')
            break
          }
        }
      }
    }
  }

  return errors
}

export async function GET({ params }) {
  const { id } = params
  if (!isValidObjectId(id)) return json({ error: 'Invalid id' }, { status: 400 })

  try {
    const db = await connectToDatabase()
    const oid = new ObjectId(id)

    const pipeline = [
      { $match: { _id: oid } },
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

    const [doc] = await db.collection('workouts').aggregate(pipeline).toArray()
    if (!doc) return json({ error: 'Workout not found' }, { status: 404 })
    return json(doc)
  } catch (err) {
    console.error('GET /api/workouts/[id] error:', err)
    return json({ error: 'Failed to fetch workout' }, { status: 500 })
  }
}

export async function PUT({ params, request }) {
  const { id } = params
  if (!isValidObjectId(id)) return json({ error: 'Invalid id' }, { status: 400 })

  try {
    const body = await request.json()
    const errors = validateWorkoutUpdate(body)
    if (errors.length) return json({ errors }, { status: 400 })

    const db = await connectToDatabase()
    const oid = new ObjectId(id)

    const updateFields = { ...body, updatedAt: new Date() }

    if (body.exerciseIds) {
      updateFields.exerciseIds = body.exerciseIds.map((eid) => new ObjectId(eid))
    }

    const result = await db.collection('workouts').findOneAndUpdate(
      { _id: oid },
      { $set: updateFields },
      { returnDocument: 'after' }
    )

    if (!result.value) return json({ error: 'Workout not found' }, { status: 404 })

    // Populate exercises in the returned document
    const populatedPipeline = [
      { $match: { _id: result.value._id } },
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

    const [updatedDoc] = await db.collection('workouts').aggregate(populatedPipeline).toArray()
    return json(updatedDoc)
  } catch (err) {
    console.error('PUT /api/workouts/[id] error:', err)
    if (err.name === 'MongoNetworkError' || err.message?.includes('connect')) {
      return json({ error: 'Database connection error' }, { status: 503 })
    }
    return json({ error: 'Failed to update workout' }, { status: 500 })
  }
}

export async function DELETE({ params }) {
  const { id } = params
  if (!isValidObjectId(id)) return json({ error: 'Invalid id' }, { status: 400 })

  try {
    const db = await connectToDatabase()
    const oid = new ObjectId(id)
    const result = await db.collection('workouts').deleteOne({ _id: oid })
    if (result.deletedCount === 0) return json({ error: 'Workout not found' }, { status: 404 })
    return json({ deleted: true })
  } catch (err) {
    console.error('DELETE /api/workouts/[id] error:', err)
    return json({ error: 'Failed to delete workout' }, { status: 500 })
  }
}
