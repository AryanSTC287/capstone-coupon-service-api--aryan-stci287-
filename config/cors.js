import cors from "cors";
import { allowedOrigins } from "./constants.js";

const env = process.env.NODE_ENV || "development";

export const corsOptions = {
  origin(origin, callback) {
    // Allow Postman, Thunder Client, server-to-server requests
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins[env].includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Idempotency-Key",
  ],
};

export default cors(corsOptions);