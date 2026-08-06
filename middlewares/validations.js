import AppError from "./appError.js";

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const validationError = new Error(error.message);
      validationError.name = "ValidationError";
      validationError.statusCode = 400;
      validationError.details = error.details;
      validationError.isJoi = error.isJoi || true;
      return next(validationError);
    }

    req.body = value;

    next();
  };
};

export const validateRequest = validate;