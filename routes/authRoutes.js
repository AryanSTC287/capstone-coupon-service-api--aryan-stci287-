import express from "express";

import {
  loginController,
  refreshTokenController,
  logoutController,
  getCurrentUserController,
  updateCurrentUserController,
  updateCurrentUserPasswordController,
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
  validateRequest(refreshTokenSchema),
  logoutController
);

// GET /api/auth/me
router.get(
  "/me",
  verifyToken,
  getCurrentUserController
);

// PATCH /api/auth/me
router.patch(
  "/me",
  verifyToken,
  updateCurrentUserController
);
router.patch(
  "/me/password",
  verifyToken,
  updateCurrentUserPasswordController
);

export default router;