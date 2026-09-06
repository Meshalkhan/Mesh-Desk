import mongoose from 'mongoose';

let cached = globalThis.__meshaiMongoose;
if (!cached) {
  cached = globalThis.__meshaiMongoose = { conn: null, promise: null };
}

const CONNECT_OPTS = {
  serverSelectionTimeoutMS: 15000,
  maxPoolSize: 10,
};

export async function connectDB(uri) {
  if (!uri) {
    throw new Error('DATABASE_URL is not set');
  }
  mongoose.set('strictQuery', true);

  if (cached.conn?.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, CONNECT_OPTS).then((m) => m.connection);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    cached.conn = null;
    throw err;
  }
}
