import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

// test route to see if I can make a connection to the db
// This section will help you create a new record.
router.post("/add_fake_user", async (req, res) => {
  let newDocument = {
    name: req.body.username,
    position: req.body.song,
  };
  let collection = await db.collection("fake-users");
  let result = await collection.insertOne(newDocument);
  res.send(result).status(204);
});

export default router;
