import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://localhost:27017/recruitment_db";

type CachedState = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const cached = (globalThis as unknown as { mongoose?: CachedState }).mongoose;

const state: CachedState =
  cached ?? { conn: null, promise: null };

// Cache the connection in dev to avoid model recompilation and excessive sockets.
(globalThis as unknown as { mongoose?: CachedState }).mongoose = state;

export async function connectToMongo() {
  // If we already connected successfully, reuse.
  if (state.conn) return state.conn;
  if (!state.promise) {
    state.promise = mongoose.connect(MONGODB_URI!);
  }

  state.conn = await state.promise;
  return state.conn;
}

