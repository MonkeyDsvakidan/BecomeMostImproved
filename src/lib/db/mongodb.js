import { MONGODB_URI } from '$env/static/private';
import { MongoClient } from 'mongodb';

const maxPoolSize = 10;

if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is required');
}

// Use cached instances to enable connection pooling and reuse across module reloads
let cachedClient = globalThis.__mongoClient || null;
let cachedDb = globalThis.__mongoDb || null;

export async function connectToDatabase() {
    if (cachedDb) return cachedDb;

    try {
        if (!cachedClient) {
            cachedClient = new MongoClient(MONGODB_URI, {
                maxPoolSize,
                connectTimeoutMS: 10000,
            });
            globalThis.__mongoClient = cachedClient;
        }

        // connect() is safe to call multiple times
        await cachedClient.connect();

        // Parse database name from URI
        let dbName = 'BecomeMostImproved'; // Fallback
        try {
            const parsed = new URL(MONGODB_URI);
            const pathname = parsed.pathname || '';
            if (pathname && pathname !== '/') {
                dbName = pathname.replace(/^\//, '');
            }
        } catch (e) {
            console.warn('Could not parse DB name from URI, using default:', dbName);
        }

        cachedDb = cachedClient.db(dbName);
        globalThis.__mongoDb = cachedDb;

        return cachedDb;
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        try {
            if (cachedClient) await cachedClient.close();
        } catch (closeErr) {
            console.error('Error closing MongoDB client after failure:', closeErr);
        }
        cachedClient = null;
        cachedDb = null;
        delete globalThis.__mongoClient;
        delete globalThis.__mongoDb;
        throw err;
    }
}

export default connectToDatabase;