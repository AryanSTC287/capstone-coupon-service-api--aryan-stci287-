import express from "express";

import {
  loginController,
  refreshTokenController,
  logoutController,
  getCurrentUserController,
} from "../controllers/authController.js";

import { verifyToken } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validations.js";

import {
  loginSchema,
  refreshTokenSchema,
} from "../utils/validationSchemas/authSchema.js";

const router = express.Router();

// POST /api/auth/login
router.post(
  "/login",
  validateRequest(loginSchema),
  loginController
);

// POST /api/auth/refresh-token
router.post(
  "/refresh-token",
  validateRequest(refreshTokenSchema),
  refreshTokenController
);

// POST /api/auth/logout
router.post(
  "/logout",
  validateRequest(refreshTokenSchema), // Remove if using cookies only
  logoutController
);

// GET /api/auth/me
router.get(
  "/me",
  verifyToken,
  getCurrentUserController
);

export default router;