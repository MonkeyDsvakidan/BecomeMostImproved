import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const maxPoolSize = parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10', 10)

if (!uri) {
  throw new Error('MONGODB_URI environment variable is required')
}

// Use cached instances to enable connection pooling and reuse across module reloads
let cachedClient = globalThis.__mongoClient || null
let cachedDb = globalThis.__mongoDb || null

export async function connectToDatabase() {
  if (cachedDb) return cachedDb

  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(uri, {
        maxPoolSize,
        connectTimeoutMS: 10000,
      })
      globalThis.__mongoClient = cachedClient
    }

    // connect() is safe to call multiple times; it will reuse an existing pool when possible
    await cachedClient.connect()

    // Determine DB name: prefer explicit env var, otherwise try to parse from URI
    let dbName = process.env.MONGODB_DB
    if (!dbName) {
      try {
        const parsed = new URL(uri)
        const pathname = parsed.pathname || ''
        if (pathname && pathname !== '/') dbName = pathname.replace(/^\//, '')
      } catch (e) {
        // ignore URL parse errors and fall through to check dbName
      }
    }

    if (!dbName) {
      throw new Error('Database name not provided. Set MONGODB_DB or include the DB in MONGODB_URI')
    }

    cachedDb = cachedClient.db(dbName)
    globalThis.__mongoDb = cachedDb

    return cachedDb
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err)
    // attempt to close client if partially initialized
    try {
      if (cachedClient) await cachedClient.close()
    } catch (closeErr) {
      console.error('Error closing MongoDB client after failure:', closeErr)
    }
    cachedClient = null
    cachedDb = null
    delete globalThis.__mongoClient
    delete globalThis.__mongoDb
    throw err
  }
}

export default connectToDatabase
