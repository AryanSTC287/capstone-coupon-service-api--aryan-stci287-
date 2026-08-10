import express from "express";
import multer from "multer";

import {
  importCouponsController,
  getImportJobsController,
} from "../../controllers/importController.js";

import {
  verifyToken,
  authorize,
} from "../../middlewares/auth.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post(
  "/coupons",
  verifyToken,
  authorize("ADMIN"),
  upload.single("file"),
  importCouponsController
);

router.get(
  "/jobs",
  verifyToken,
  authorize("ADMIN"),
  getImportJobsController
);

export default router;