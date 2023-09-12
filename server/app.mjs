import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import "./loadEnvironment.mjs";
import test_routes from "./routes/test_routes.mjs";
import spotify_routes from "./routes/spotify.mjs";

const PORT = process.env.PORT || 5050;
const app = express();

// Allow requests from your frontend, e.g., http://localhost:3000
const allowedOrigins = ["http://localhost:3000"];
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

// start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
