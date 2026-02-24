import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { DB } from "../config/database.js";
import routes from "../routes/index.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/api", routes);

// Vercel-friendly server start
const startServer = async () => {
  try {
    // Connect to database
    await DB.connect();

    // Local development
    if (!process.env.VERCEL) {
      const port = process.env.PORT || 3000;
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    }
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

startServer();

// Export app for Vercel serverless
export default app;
