import Joi from "joi";
import {
  DISCOUNT_TYPE,
  COUPON_STATUS,
} from "../../config/constants.js";


export const createCouponSchema = Joi.object({

  code: Joi.string()
    .trim()
    .uppercase()
    .required(),

  description: Joi.string()
    .allow("")
    .optional(),

  discountType: Joi.string()
    .valid(...Object.values(DISCOUNT_TYPE))
    .required(),

  discountValue: Joi.number()
    .min(1)
    .required(),

  maxDiscount: Joi.number()
    .min(0)
    .allow(null)
    .optional(),

  usageLimit: Joi.number()
    .min(1)
    .required(),

  perCustomerLimit: Joi.number()
    .min(1)
    .optional(),

  startDate: Joi.date()
    .required(),

  expiryDate: Joi.date()
    .greater(Joi.ref("startDate"))
    .required(),

  status: Joi.string()
    .valid(...Object.values(COUPON_STATUS))
    .optional(),

});


export const updateCouponSchema = Joi.object({

  description: Joi.string()
    .allow("")
    .optional(),

  discountValue: Joi.number()
    .min(1)
    .optional(),

  maxDiscount: Joi.number()
    .min(0)
    .allow(null)
    .optional(),

  usageLimit: Joi.number()
    .min(1)
    .optional(),

  perCustomerLimit: Joi.number()
    .min(1)
    .optional(),

  startDate: Joi.date()
    .optional(),

  expiryDate: Joi.date()
    .optional(),

  status: Joi.string()
    .valid(...Object.values(COUPON_STATUS))
    .optional(),

})
.min(1);