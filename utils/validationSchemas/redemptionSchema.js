import Joi from "joi";

// Customer Redeem Coupon
export const redeemCouponSchema =
  Joi.object({
    couponCode: Joi.string()
      .trim()
      .uppercase()
      .required()
      .messages({
        "string.empty":
          "Coupon code is required",
        "any.required":
          "Coupon code is required",
      }),

    orderId: Joi.string()
      .trim()
      .min(1)
      .required()
      .messages({
        "string.empty":
          "Order ID is required",
        "any.required":
          "Order ID is required",
        "string.min":
          "Order ID is required",
      }),

    orderAmount: Joi.number()
      .min(0)
      .required()
      .messages({
        "number.base":
          "Order amount must be a number",
        "number.min":
          "Order amount cannot be negative",
        "any.required":
          "Order amount is required",
      }),
  });

// Admin Revert Redemption
export const revertRedemptionSchema =
  Joi.object({
    reason: Joi.string()
      .allow("")
      .optional(),
  });