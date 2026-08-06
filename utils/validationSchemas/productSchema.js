import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(""),
  price: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0).default(0),
});

export const updateProductSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string().allow(""),
  price: Joi.number().positive(),
  stock: Joi.number().integer().min(0),
});

export const purchaseProductSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
});
