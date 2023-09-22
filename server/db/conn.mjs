import { MongoClient } from "mongodb";

// from .env file
const connectionString = process.env.ATLAS_URI || "";

console.log("Connection String: " + connectionString);
const client = new MongoClient(connectionString, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let conn;
try {
  conn = await client.connect();
} catch (e) {
  console.error(e);
}

let db = conn.db("spotify-user-data");

export default db;
