import Joi from "joi";
import {
  USER_ROLE,
  USER_STATUS,
} from "../../config/constants.js";


export const createUserSchema = Joi.object({

  name: Joi.string()
    .trim()
    .min(2)
    .required(),

  email: Joi.string()
    .email()
    .lowercase()
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

  name: Joi.string()
    .trim()
    .min(2)
    .optional(),

  email: Joi.string()
    .email()
    .lowercase()
    .optional(),

  role: Joi.string()
    .valid(...Object.values(USER_ROLE))
    .optional(),

  status: Joi.string()
    .valid(...Object.values(USER_STATUS))
    .optional(),

})
.min(1);