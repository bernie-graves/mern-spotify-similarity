import { MongoClient } from "mongodb";

// from .env file
const connectionString = process.env.ATLAS_URI || "";

console.log("Connection String: " + connectionString);
const client = new MongoClient(connectionString);

let conn;
try {
  conn = await client.connect();
} catch (e) {
  console.error(e);
}

let db = conn.db("spotify-user-data");

export default db;
