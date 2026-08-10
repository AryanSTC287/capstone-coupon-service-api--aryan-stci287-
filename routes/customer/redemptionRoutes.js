import express from "express";

import {
  redeemCouponController,
  getMyRedemptionsController,
} from "../../controllers/redemptionController.js";

import {
  verifyToken,
  authorize,
} from "../../middlewares/auth.js";

import {
  validate,
} from "../../middlewares/validations.js";

import {
  redeemCouponSchema,
} from "../../utils/validationSchemas/redemptionSchema.js";

const router = express.Router();

router.use(verifyToken);

router.post(
  "/redemptions/redeem",
  authorize("CUSTOMER"),
  validate(redeemCouponSchema),
  redeemCouponController
);

router.get(
  "/redemptions",
  authorize("CUSTOMER"),
  getMyRedemptionsController
);

export default router;