import express from "express";

import {
  createCouponController,
  getCouponsController,
  getCouponByIdController,
  updateCouponController,
  deleteCouponController,
} from "../../controllers/couponController.js";

import {
  importCouponsController,
} from "../../controllers/csvImportController.js";

import {
  exportCouponsController,
} from "../../controllers/csvExportController.js";

import {
  verifyToken,
  authorize,
} from "../../middlewares/auth.js";

import { validate } from "../../middlewares/validations.js";

import {
  createCouponSchema,
  updateCouponSchema,
} from "../../utils/validationSchemas/couponSchema.js";

import upload from "../../middlewares/upload.js";

const router = express.Router();


// Authentication
router.use(verifyToken);


// Create Coupon
router.post(
  "/",
  authorize("ADMIN"),
  validate(createCouponSchema),
  createCouponController
);


// Get All Coupons
router.get(
  "/",
  authorize("ADMIN"),
  getCouponsController
);


// CSV Import
router.post(
  "/import",
  authorize("ADMIN"),
  upload.single("file"),
  importCouponsController
);


// CSV Export
router.get(
  "/export",
  authorize("ADMIN"),
  exportCouponsController
);


// Get Coupon By Id
router.get(
  "/:id",
  authorize("ADMIN"),
  getCouponByIdController
);


// Update Coupon
router.put(
  "/:id",
  authorize("ADMIN"),
  validate(updateCouponSchema),
  updateCouponController
);


// Delete Coupon
router.delete(
  "/:id",
  authorize("ADMIN"),
  deleteCouponController
);

export default router;