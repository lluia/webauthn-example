import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const options = { useUnifiedTopology: true, useNewUrlParser: true };

if (!uri) {
  throw new Error("Please add `MONGODB_URI` to .env.local");
}

/**
 * @see // This approach is taken from https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
 */
if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // In production mode, don't use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDb(dbName: string) {
  const client = await clientPromise;
  return client.db(dbName);
}

const mongoDbService = {
  getDb,
};

export default mongoDbService;
