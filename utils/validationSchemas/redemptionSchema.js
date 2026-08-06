import Joi from "joi";


export const redeemCouponSchema = Joi.object({

  couponCode: Joi.string()
    .trim()
    .uppercase()
    .required(),

  orderId: Joi.string()
    .trim()
    .required(),

  idempotencyKey: Joi.string()
    .trim()
    .required(),

  orderAmount: Joi.number()
    .min(0)
    .required(),

});


export const revertRedemptionSchema = Joi.object({

  reason: Joi.string()
    .allow("")
    .optional(),

});