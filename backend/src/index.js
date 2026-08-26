import express from "express";
import cors from "cors";
import "dotenv/config";
import fs from "fs";
import path from "path";


import job from "./lib/cron.js";


import { clerkMiddleware } from '@clerk/express';

import User from "./models/user.model.js";
import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL;

const publicDir = path.join(process.cwd(), "Public");

// Standard Middleware
app.use(express.json());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(clerkMiddleware());

// API Health Check Route
app.get("/health", (req, res) => {
    res.status(200).json({ ok: true });
});

// Serve frontend static files and handle client-side routing (Only defined ONCE)
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  // Use a named wildcard or regex route for Express 5 compatibility
  app.get(/(.*)/, (req, res, next) => {
    res.sendFile(path.join(publicDir, "index.html"), (err) => {
      if (err) next(err);
    });
  });
}

// Connect to MongoDB first, then listen
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("Server is up and running on PORT:", PORT);

      if (process.env.NODE_ENV === "production") job.start();
      
    });
  })
  .catch((err) => {
    console.error("Failed to start server due to DB connection error.");
  });