import { MongoClient } from "mongodb";

// The driver connects lazily on first use, so importing this never blocks a build.
const g = globalThis;
export function getDb() {
  if (!g._wedplanDb) {
    const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
    g._wedplanDb = client.db(process.env.MONGODB_DB || "wedplan");
  }
  return g._wedplanDb;
}
