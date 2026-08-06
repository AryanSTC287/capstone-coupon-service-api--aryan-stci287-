import express from "express";

import {
  dashboardAnalyticsController,
  couponAnalyticsController,
} from "../../controllers/analyticsController.js";

import {
  verifyToken,
  authorize,
} from "../../middlewares/auth.js";

const router = express.Router();

router.get(
  "/dashboard",
  verifyToken,
  authorize("ADMIN"),
  dashboardAnalyticsController
);

router.get(
  "/coupons",
  verifyToken,
  authorize("ADMIN"),
  couponAnalyticsController
);

export default router;