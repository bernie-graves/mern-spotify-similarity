import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import "./loadEnvironment.mjs";
import test_routes from "./routes/test_routes.mjs";
import spotify_routes from "./routes/spotify.mjs";
import similarity_routes from "./routes/similarity-calculator.mjs";

const PORT = process.env.PORT || 5050;
const app = express();

const corsOptions = {
  origin: [
    "http://192.168.1.91:3000",
    "https://soundmates-for-spotify-frontend.onrender.com",
  ],
  credentials: true,
  exposedHeaders: ["set-cookie"],
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// Enable CORS for all routes
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins, change '*' to your frontend URL for production
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  ); // Allow these HTTP methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allow these headers
  res.setHeader("Access-Control-Allow-Credentials", "true"); // Allow credentials (cookies, etc.) to be sent

  // Handle preflight requests (OPTIONS method)
  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // Respond with 200 OK for preflight requests
  }

  // Continue processing the request
  next();
});

// use the routes
app.use("/test", test_routes);
app.use("/api/spotify/", spotify_routes);
app.use("/api/similarity", similarity_routes);

// start the Express server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port: ${PORT}`);
});

export default app;
