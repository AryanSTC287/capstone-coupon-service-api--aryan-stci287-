import express from "express";

import authRoutes from "./authRoutes.js";

import auditLogRoutes from "./admin/auditLogRoutes.js";
import userRoutes from "./admin/userRoutes.js";
import couponRoutes from "./admin/couponRoutes.js";
import importRoutes from "./admin/importRoutes.js";
import analyticsRoutes from "./admin/analyticsRoutes.js";
import productRoutes from "./admin/productRoutes.js";
import adminRedemptionRoutes from "./admin/redemptionRoutes.js";

import customerRedemptionRoutes from "./customer/redemptionRoutes.js";
import customerCouponRoutes from "./customer/couponRoutes.js";

import publicProductRoutes from "./public/productRoutes.js";

const router = express.Router();

router.use(
  "/auth",
  authRoutes
);

router.use(
  "/admin/users",
  userRoutes
);

router.use(
  "/admin/coupons",
  couponRoutes
);

router.use(
  "/admin/import",
  importRoutes
);

router.use(
  "/admin/analytics",
  analyticsRoutes
);

router.use(
  "/admin/products",
  productRoutes
);

router.use(
  "/admin/redemptions",
  adminRedemptionRoutes
);

router.use(
  "/admin/audit-logs",
  auditLogRoutes
);

router.use(
  "/public/products",
  publicProductRoutes
);

router.use(
  "/customer",
  customerRedemptionRoutes
);

router.use(
  "/customer/coupons",
  customerCouponRoutes
);

export default router;