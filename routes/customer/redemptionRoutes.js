import express from "express";

import {
  redeemCouponController,
  getMyRedemptionsController,
} from "../../controllers/redemptionController.js";

import {
  verifyToken,
  authorize,
} from "../../middlewares/auth.js";

import { validate } from "../../middlewares/validations.js";

import {
  redeemCouponSchema,
} from "../../utils/validationSchemas/redemptionSchema.js";


const router = express.Router();


// Redeem Coupon
router.post(
  "/redemptions/redeem",
  verifyToken,
  authorize("CUSTOMER"),
  validate(redeemCouponSchema),
  redeemCouponController
);


// Get My Redemptions
router.get(
  "/redemptions",
  verifyToken,
  authorize("CUSTOMER"),
  getMyRedemptionsController
);


export default router;