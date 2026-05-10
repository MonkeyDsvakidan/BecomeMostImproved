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

export async function load({ params }) {
  const { id } = params
  if (!isValidObjectId(id)) {
    return {
      workout: null,
      exercises: [],
      error: 'Invalid workout id'
    }
  }

  try {
    const db = await connectToDatabase()
    const oid = new ObjectId(id)
    const [workout, exercises] = await Promise.all([
      db.collection('workouts').aggregate([
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
      ]).toArray(),
      db.collection('exercises').find({}).sort({ createdAt: -1 }).toArray()
    ])

    const loadedWorkout = workout[0] ? toPlainDocument(workout[0]) : null

    if (!loadedWorkout) {
      return {
        workout: null,
        exercises: exercises.map(toPlainDocument),
        error: 'Workout not found'
      }
    }

    return {
      workout: loadedWorkout,
      exercises: exercises.map(toPlainDocument)
    }
  } catch (error) {
    console.error('GET /workouts/[id]/edit load error:', error)
    return {
      workout: null,
      exercises: [],
      error: 'Failed to load workout'
    }
  }
}