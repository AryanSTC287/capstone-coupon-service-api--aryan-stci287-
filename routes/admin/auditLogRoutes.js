import express from "express";

import {
  getAuditLogsController,
  getAuditLogByIdController,
} from "../../controllers/auditLogController.js";

import {
  verifyToken,
  authorize,
} from "../../middlewares/auth.js";

const router = express.Router();

// Protect All Routes
router.use(verifyToken);
router.use(authorize("ADMIN"));

// Get All Audit Logs
router.get(
  "/",
  getAuditLogsController
);

// Get Audit Log By Id
router.get(
  "/:id",
  getAuditLogByIdController
);

export default router;