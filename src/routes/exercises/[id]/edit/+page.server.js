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

function toPlainDocument(document) {
  return JSON.parse(JSON.stringify(document))
}

function normalizeExercise(exercise) {
  if (!exercise) return null
  return {
    ...exercise,
    categories: exercise.category ?? exercise.categories ?? []
  }
}

export async function load({ params }) {
  const { id } = params
  if (!isValidObjectId(id)) {
    return {
      exercise: null,
      error: 'Invalid exercise id'
    }
  }

  try {
    const db = await connectToDatabase()
    const doc = await db.collection('exercises').findOne({ _id: new ObjectId(id) })

    if (!doc) {
      return {
        exercise: null,
        error: 'Exercise not found'
      }
    }

    return {
      exercise: normalizeExercise(toPlainDocument(doc))
    }
  } catch (error) {
    console.error('GET /exercises/[id]/edit load error:', error)
    return {
      exercise: null,
      error: 'Failed to load exercise'
    }
  }
}