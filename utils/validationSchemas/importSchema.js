import Joi from "joi";

export const importCouponSchema = Joi.object({
  fileName: Joi.string().required(),
});