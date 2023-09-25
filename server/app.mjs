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
    "https://soundmates-for-spotify.com",
  ],
  credentials: true,
  exposedHeaders: ["set-cookie"],
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// use the routes
app.use("/test", test_routes);
app.use("/api/spotify/", spotify_routes);
app.use("/api/similarity", similarity_routes);

// start the Express server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port: ${PORT}`);
});

export default app;
