import { MongoClient } from "mongodb";

// from .env file
const connectionString = process.env.ATLAS_URI || "";

const client = new MongoClient(connectionString);

console.log("Connection String: " + connectionString);

let conn;
try {
  conn = await client.connect();
} catch (e) {
  console.error(e);
}

let db = conn.db("spotify-user-data");

export default db;
