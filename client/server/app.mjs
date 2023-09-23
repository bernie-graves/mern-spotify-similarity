import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import "./loadEnvironment.mjs";
import test_routes from "./routes/test_routes.mjs";
import spotify_routes from "./routes/spotify.mjs";
import similarity_routes from "./routes/similarity-calculator.mjs";

import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 5050;
const app = express();

const corsOptions = {
  origin: [
    "http://192.168.1.91:3000",
    "https://soundmates-for-spotify-frontend.onrender.com",
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// use the routes
app.use("/test", test_routes);
app.use("/api/spotify/", spotify_routes);
app.use("/api/similarity", similarity_routes);

app.use(express.static(path.join(__dirname, "../build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build/index.html"));
});

// start the Express server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port: ${PORT}`);
});

export default app;
