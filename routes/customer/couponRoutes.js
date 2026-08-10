import express from "express";

import {
  getCouponsController,
  getCouponByIdController,
} from "../../controllers/couponController.js";

import {
  verifyToken,
  authorize,
} from "../../middlewares/auth.js";

const router = express.Router();

router.use(verifyToken);

router.get(
  "/",
  authorize("CUSTOMER"),
  getCouponsController
);

router.get(
  "/:id",
  authorize("CUSTOMER"),
  getCouponByIdController
);

export default router;