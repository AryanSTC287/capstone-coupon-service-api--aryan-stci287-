import Coupon from "../models/couponModel.js";
import AppError from "../middlewares/appError.js";
import { COUPON_STATUS } from "../config/constants.js";
import { createAuditLog } from "./auditLogService.js";

// Create Coupon
export const createCoupon = async (
  payload,
  userId,
  ipAddress = ""
) => {
  const existingCoupon = await Coupon.findOne({
    code: payload.code.trim().toUpperCase(),
    isDeleted: false,
  });

  if (existingCoupon) {
    throw new AppError("Coupon already exists", 409);
  }

  const coupon = await Coupon.create({
    ...payload,
    code: payload.code.trim().toUpperCase(),
    createdBy: userId,
  });

  await createAuditLog({
    user: userId,
    action: "CREATE_COUPON",
    entity: "COUPON",
    entityId: coupon._id,
    description: `Created coupon ${coupon.code}`,
    ipAddress,
  });

  return coupon;
};

// Get All Coupons
export const getCoupons = async () => {
  return Coupon.find({
    isDeleted: false,
  })
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });
};

// Get Coupon By Id
export const getCouponById = async (id) => {
  const coupon = await Coupon.findOne({
    _id: id,
    isDeleted: false,
  }).populate("createdBy", "name email");

  if (!coupon) {
    throw new AppError("Coupon not found", 404);
  }

  return coupon;
};

// Update Coupon
export const updateCoupon = async (
  id,
  payload,
  userId,
  ipAddress = ""
) => {
  const coupon = await Coupon.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!coupon) {
    throw new AppError("Coupon not found", 404);
  }

  if (
    payload.code &&
    payload.code.trim().toUpperCase() !== coupon.code
  ) {
    const existingCoupon = await Coupon.findOne({
      code: payload.code.trim().toUpperCase(),
      isDeleted: false,
      _id: { $ne: id },
    });

    if (existingCoupon) {
      throw new AppError(
        "Coupon code already exists",
        409
      );
    }

    coupon.code = payload.code.trim().toUpperCase();
  }

  coupon.description =
    payload.description ?? coupon.description;

  coupon.discountType =
    payload.discountType ?? coupon.discountType;

  coupon.discountValue =
    payload.discountValue ?? coupon.discountValue;

  coupon.maxDiscount =
    payload.maxDiscount ?? coupon.maxDiscount;

  coupon.usageLimit =
    payload.usageLimit ?? coupon.usageLimit;

  coupon.perCustomerLimit =
    payload.perCustomerLimit ??
    coupon.perCustomerLimit;

  coupon.startDate =
    payload.startDate ?? coupon.startDate;

  coupon.expiryDate =
    payload.expiryDate ?? coupon.expiryDate;

  coupon.status =
    payload.status ?? coupon.status;

  await coupon.save();

  await createAuditLog({
    user: userId,
    action: "UPDATE_COUPON",
    entity: "COUPON",
    entityId: coupon._id,
    description: `Updated coupon ${coupon.code}`,
    ipAddress,
  });

  return coupon;
};

// Delete Coupon
export const deleteCoupon = async (
  id,
  userId,
  ipAddress = ""
) => {
  const coupon = await Coupon.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!coupon) {
    throw new AppError("Coupon not found", 404);
  }

  coupon.isDeleted = true;
  coupon.deletedAt = new Date();
  coupon.status = COUPON_STATUS.INACTIVE;

  await coupon.save();

  await createAuditLog({
    user: userId,
    action: "DELETE_COUPON",
    entity: "COUPON",
    entityId: coupon._id,
    description: `Deleted coupon ${coupon.code}`,
    ipAddress,
  });

  return {
    message: "Coupon deleted successfully",
  };
};