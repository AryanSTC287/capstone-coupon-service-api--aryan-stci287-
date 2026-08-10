import Joi from "joi";
import {
  USER_ROLE,
  USER_STATUS,
} from "../../config/constants.js";

export const createUserSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .required(),

  lastName: Joi.string()
    .trim()
    .min(2)
    .required(),

  email: Joi.string()
    .email()
    .lowercase()
    .required(),

  phone: Joi.string()
    .trim()
    .required(),

  password: Joi.string()
    .min(6)
    .required(),

  role: Joi.string()
    .valid(...Object.values(USER_ROLE))
    .default(USER_ROLE.CUSTOMER),

  status: Joi.string()
    .valid(...Object.values(USER_STATUS))
    .default(USER_STATUS.ACTIVE),
});

export const updateUserSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .optional(),

  lastName: Joi.string()
    .trim()
    .min(2)
    .optional(),

  email: Joi.string()
    .email()
    .lowercase()
    .optional(),

  phone: Joi.string()
    .trim()
    .optional(),

  password: Joi.string()
    .min(6)
    .optional(),

  role: Joi.string()
    .valid(...Object.values(USER_ROLE))
    .optional(),

  status: Joi.string()
    .valid(...Object.values(USER_STATUS))
    .optional(),
}).min(1);