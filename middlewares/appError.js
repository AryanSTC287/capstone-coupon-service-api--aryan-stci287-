class AppError extends Error {
  constructor(message, statusCode = 500, options = {}) {
    super(message);

    const { responseCode = 1, errors = [] } = options;

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.responseCode = responseCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;