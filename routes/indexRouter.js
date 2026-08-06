import express from "express";

import authRoutes from "./authRoutes.js";

// Admin Routes
import auditLogRoutes from "./admin/auditLogRoutes.js";
import userRoutes from "./admin/userRoutes.js";
import couponRoutes from "./admin/couponRoutes.js";
import importRoutes from "./admin/importRoutes.js";
import analyticsRoutes from "./admin/analyticsRoutes.js";
import productRoutes from "./admin/productRoutes.js";
import adminRedemptionRoutes from "./admin/redemptionRoutes.js";

// Customer Routes
import customerRedemptionRoutes from "./customer/redemptionRoutes.js";
import publicProductRoutes from "./public/productRoutes.js";

const router = express.Router();


// Auth
router.use("/auth", authRoutes);


// Admin
router.use("/admin/users", userRoutes);

router.use("/admin/coupons", couponRoutes);

router.use("/admin/import", importRoutes);

router.use("/admin/analytics", analyticsRoutes);

router.use("/admin/products", productRoutes);

router.use("/admin/redemptions", adminRedemptionRoutes);

router.use("/admin/audit-logs", auditLogRoutes);

// Public
router.use("/public/products", publicProductRoutes);

// Customer
router.use("/customer", customerRedemptionRoutes);

export default router;