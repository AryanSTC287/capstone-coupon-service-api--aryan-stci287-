import express from "express";

import {
  createUserController,
  getUsersController,
  getUserByIdController,
  updateUserController,
  deactivateUserController,
  deleteUserController,
} from "../../controllers/userController.js";

import { verifyToken, authorize } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validations.js";
import {
  createUserSchema,
  updateUserSchema,
} from "../../utils/validationSchemas/userSchema.js";

const router = express.Router();

router.use(verifyToken);
router.use(authorize("ADMIN"));

router.post(
  "/",
  validateRequest(createUserSchema),
  createUserController
);

router.get("/", getUsersController);

router.get("/:id", getUserByIdController);

router.put(
  "/:id",
  validateRequest(updateUserSchema),
  updateUserController
);

router.patch("/:id/deactivate", deactivateUserController);

router.delete("/:id", deleteUserController);

export default router;