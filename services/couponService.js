import Coupon from "../models/couponModel.js";
import AppError from "../middlewares/appError.js";

import {
  COUPON_STATUS,
  DISCOUNT_TYPE,
} from "../config/constants.js";

import { createAuditLog } from "./auditLogService.js";

// Validate Coupon Data
const validateCouponData = (payload) => {
  const {
    discountType,
    discountValue,
    maxDiscount,
    usageLimit,
    perCustomerLimit,
    startDate,
    expiryDate,
  } = payload;

  // Global usage limit
  if (
    usageLimit === undefined ||
    usageLimit === null ||
    usageLimit === ""
  ) {
    throw new AppError(
      "Usage limit is required",
      400
    );
  }

  if (
    !Number.isInteger(Number(usageLimit)) ||
    Number(usageLimit) < 1
  ) {
    throw new AppError(
      "Usage limit must be at least 1",
      400
    );
  }

  // Per customer limit
  if (
    perCustomerLimit === undefined ||
    perCustomerLimit === null ||
    perCustomerLimit === ""
  ) {
    throw new AppError(
      "Per customer limit is required",
      400
    );
  }

  if (
    !Number.isInteger(
      Number(perCustomerLimit)
    ) ||
    Number(perCustomerLimit) < 1
  ) {
    throw new AppError(
      "Per customer limit must be at least 1",
      400
    );
  }

  if (
    Number(perCustomerLimit) >
    Number(usageLimit)
  ) {
    throw new AppError(
      "Per customer limit cannot exceed usage limit",
      400
    );
  }

  // Discount type
  if (!discountType) {
    throw new AppError(
      "Discount type is required",
      400
    );
  }

  if (
    !Object.values(DISCOUNT_TYPE).includes(
      discountType
    )
  ) {
    throw new AppError(
      "Invalid discount type",
      400
    );
  }

  // Discount value
  if (
    discountValue === undefined ||
    discountValue === null ||
    discountValue === ""
  ) {
    throw new AppError(
      "Discount value is required",
      400
    );
  }

  if (Number(discountValue) <= 0) {
    throw new AppError(
      "Discount value must be greater than 0",
      400
    );
  }

  // Percentage discount cannot exceed 100%
  if (
    discountType ===
      DISCOUNT_TYPE.PERCENTAGE &&
    Number(discountValue) > 100
  ) {
    throw new AppError(
      "Percentage discount cannot exceed 100",
      400
    );
  }

  // Max discount validation
  if (
    maxDiscount !== undefined &&
    maxDiscount !== null &&
    maxDiscount !== ""
  ) {
    if (Number(maxDiscount) < 0) {
      throw new AppError(
        "Maximum discount cannot be negative",
        400
      );
    }
  }

  // Date validation
  if (!startDate) {
    throw new AppError(
      "Start date is required",
      400
    );
  }

  if (!expiryDate) {
    throw new AppError(
      "Expiry date is required",
      400
    );
  }

  const start = new Date(startDate);
  const expiry = new Date(expiryDate);

  if (Number.isNaN(start.getTime())) {
    throw new AppError(
      "Invalid start date",
      400
    );
  }

  if (Number.isNaN(expiry.getTime())) {
    throw new AppError(
      "Invalid expiry date",
      400
    );
  }

  if (start >= expiry) {
    throw new AppError(
      "Expiry date must be after start date",
      400
    );
  }
};

// Create Coupon
export const createCoupon = async (
  payload,
  userId,
  ipAddress = ""
) => {
  if (
    !payload.code ||
    !payload.code.trim()
  ) {
    throw new AppError(
      "Coupon code is required",
      400
    );
  }

  validateCouponData(payload);

  const normalizedCode =
    payload.code
      .trim()
      .toUpperCase();

  const existingCoupon =
    await Coupon.findOne({
      code: normalizedCode,
      isDeleted: false,
    });

  if (existingCoupon) {
    throw new AppError(
      "Coupon already exists",
      409
    );
  }

  const coupon = await Coupon.create({
    ...payload,

    code: normalizedCode,

    usageLimit: Number(
      payload.usageLimit
    ),

    perCustomerLimit: Number(
      payload.perCustomerLimit
    ),

    discountValue: Number(
      payload.discountValue
    ),

    maxDiscount:
      payload.maxDiscount ===
        undefined ||
      payload.maxDiscount === null ||
      payload.maxDiscount === ""
        ? null
        : Number(payload.maxDiscount),

    createdBy: userId,
  });

  await createAuditLog({
    user: userId,

    action: "CREATE_COUPON",

    entity: "COUPON",

    entityId: coupon._id,

    description:
      `Created coupon ${coupon.code}`,

    ipAddress,
  });

  return coupon;
};

// Get All Coupons
export const getCoupons = async () => {
  return Coupon.find({
    isDeleted: false,
  })
    .populate(
      "createdBy",
      "name email"
    )
    .sort({
      createdAt: -1,
    });
};

// Get Coupon By Id
export const getCouponById = async (
  id
) => {
  const coupon =
    await Coupon.findOne({
      _id: id,
      isDeleted: false,
    }).populate(
      "createdBy",
      "name email"
    );

  if (!coupon) {
    throw new AppError(
      "Coupon not found",
      404
    );
  }

  return coupon;
};

// Get Available Coupons For Customer
export const getAvailableCoupons =
  async () => {
    const now = new Date();

    return Coupon.find({
      isDeleted: false,

      status: COUPON_STATUS.ACTIVE,

      startDate: {
        $lte: now,
      },

      expiryDate: {
        $gt: now,
      },

      $expr: {
        $lt: [
          "$usedCount",
          "$usageLimit",
        ],
      },
    })
      .select(
        "code description discountType discountValue maxDiscount usageLimit usedCount perCustomerLimit startDate expiryDate status"
      )
      .sort({
        createdAt: -1,
      });
  };

// Get Available Coupon By Id For Customer
export const getAvailableCouponById =
  async (id) => {
    const now = new Date();

    const coupon =
      await Coupon.findOne({
        _id: id,

        isDeleted: false,

        status: COUPON_STATUS.ACTIVE,

        startDate: {
          $lte: now,
        },

        expiryDate: {
          $gt: now,
        },

        $expr: {
          $lt: [
            "$usedCount",
            "$usageLimit",
          ],
        },
      }).select(
        "code description discountType discountValue maxDiscount usageLimit usedCount perCustomerLimit startDate expiryDate status"
      );

    if (!coupon) {
      throw new AppError(
        "Coupon is not available",
        404
      );
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
  const coupon =
    await Coupon.findOne({
      _id: id,
      isDeleted: false,
    });

  if (!coupon) {
    throw new AppError(
      "Coupon not found",
      404
    );
  }

  const updatedData = {
    code:
      payload.code ??
      coupon.code,

    description:
      payload.description ??
      coupon.description,

    discountType:
      payload.discountType ??
      coupon.discountType,

    discountValue:
      payload.discountValue ??
      coupon.discountValue,

    maxDiscount:
      payload.maxDiscount !==
      undefined
        ? payload.maxDiscount
        : coupon.maxDiscount,

    usageLimit:
      payload.usageLimit !==
      undefined
        ? payload.usageLimit
        : coupon.usageLimit,

    perCustomerLimit:
      payload.perCustomerLimit !==
      undefined
        ? payload.perCustomerLimit
        : coupon.perCustomerLimit,

    startDate:
      payload.startDate ??
      coupon.startDate,

    expiryDate:
      payload.expiryDate ??
      coupon.expiryDate,

    status:
      payload.status ??
      coupon.status,
  };

  updatedData.code =
    updatedData.code
      .trim()
      .toUpperCase();

  /*
   * Prevent reducing the usage limit
   * below the number of completed redemptions.
   */
  if (
    Number(updatedData.usageLimit) <
    coupon.usedCount
  ) {
    throw new AppError(
      `Usage limit cannot be less than current usage count (${coupon.usedCount})`,
      400
    );
  }

  validateCouponData(
    updatedData
  );

  // Check duplicate coupon code
  if (
    updatedData.code !==
    coupon.code
  ) {
    const existingCoupon =
      await Coupon.findOne({
        code: updatedData.code,
        isDeleted: false,
        _id: {
          $ne: id,
        },
      });

    if (existingCoupon) {
      throw new AppError(
        "Coupon code already exists",
        409
      );
    }
  }

  coupon.code =
    updatedData.code;

  coupon.description =
    updatedData.description;

  coupon.discountType =
    updatedData.discountType;

  coupon.discountValue =
    Number(
      updatedData.discountValue
    );

  coupon.maxDiscount =
    updatedData.maxDiscount ===
      undefined ||
    updatedData.maxDiscount === null ||
    updatedData.maxDiscount === ""
      ? null
      : Number(
          updatedData.maxDiscount
        );

  coupon.usageLimit =
    Number(
      updatedData.usageLimit
    );

  coupon.perCustomerLimit =
    Number(
      updatedData.perCustomerLimit
    );

  coupon.startDate =
    updatedData.startDate;

  coupon.expiryDate =
    updatedData.expiryDate;

  coupon.status =
    updatedData.status;

  await coupon.save();

  await createAuditLog({
    user: userId,

    action: "UPDATE_COUPON",

    entity: "COUPON",

    entityId: coupon._id,

    description:
      `Updated coupon ${coupon.code}`,

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
  const coupon =
    await Coupon.findOne({
      _id: id,
      isDeleted: false,
    });

  if (!coupon) {
    throw new AppError(
      "Coupon not found",
      404
    );
  }

  coupon.isDeleted = true;

  coupon.deletedAt =
    new Date();

  coupon.status =
    COUPON_STATUS.INACTIVE;

  await coupon.save();

  await createAuditLog({
    user: userId,

    action: "DELETE_COUPON",

    entity: "COUPON",

    entityId: coupon._id,

    description:
      `Deleted coupon ${coupon.code}`,

    ipAddress,
  });

  return {
    message:
      "Coupon deleted successfully",
  };
};