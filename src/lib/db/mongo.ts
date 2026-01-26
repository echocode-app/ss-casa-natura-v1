import mongoose from 'mongoose';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDB() {
  // Check if existing connection is healthy
  if (cached.conn) {
    try {
      // Verify connection is still alive
      if (cached.conn.connection.readyState === 1) {
        return cached.conn;
      }
      // Connection lost, reset cache
      cached.conn = null;
      cached.promise = null;
    } catch {
      // Reset on any error
      cached.conn = null;
      cached.promise = null;
    }
  }

  if (!cached.promise) {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error('❌Please define the MONGO_URI environment variable inside .env.local');
    }

    cached.promise = mongoose
      .connect(MONGO_URI, {
        // Keep requests from hanging too long when DNS / Atlas is unreachable.
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000,
        socketTimeoutMS: 20000,
        maxPoolSize: 10,
      })
      .then((mongoose) => mongoose)
      .catch((err) => {
        // Reset cache on connection errors
        cached.promise = null;
        cached.conn = null;
        throw new Error(`MongoDB connection error: ${err.message}`);
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    // Ensure cache is cleared on connection failure
    cached.promise = null;
    cached.conn = null;
    throw err;
  }
}

export default connectToDB;
