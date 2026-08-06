import "./config/dns.js";
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/config.js";
import { initializeCrons } from "./services/cronService.js";

const PORT = process.env.PORT || 1234;

const startServer = async () => {
  try {
    await connectDB();

    // Initialize Cron Jobs
    initializeCrons();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

startServer();