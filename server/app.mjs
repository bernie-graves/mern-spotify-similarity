import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import "./loadEnvironment.mjs";
import test_routes from "./routes/test_routes.mjs";
import spotify_routes from "./routes/spotify.mjs";
import similarity_routes from "./routes/similarity-calculator.mjs";

const PORT = process.env.PORT || 5050;
const app = express();

// Allow requests from your frontend, e.g., http://localhost:3000
const allowedOrigins = [
  "http://localhost:3000",
  "http://192.168.1.91:3000",
  "https://soundmates-for-spotify-frontend.vercel.app/",
];
// Use the cors middleware with the allowedOrigins option
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(cookieParser());
app.use(express.json());

// use the routes
app.use("/test", test_routes);
app.use("/api/spotify/", spotify_routes);
app.use("/api/similarity", similarity_routes);

// start the Express server
if (typeof process.env.VERCEL_URL === "undefined") {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port: ${PORT}`);
  });
}

module.exports = app;
