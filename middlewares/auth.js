import User from "../models/userModel.js";
import AppError from "./appError.js";
import {
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

const verifyTokenMiddleware = async (
  req,
  res,
  next,
  tokenType = "access"
) => {
  try {
    let token = null;

    if (tokenType === "access") {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
      }

      req.refreshToken = null;
    } else {
      token = req.cookies?.refreshToken;
      req.refreshToken = token || null;
    }

    if (!token) {
      return next(
        new AppError(
          `Access token is required`,
          401
        )
      );
    }

    const decoded =
      tokenType === "refresh"
        ? verifyRefreshToken(token)
        : verifyAccessToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
};

export const verifyToken = (typeOrReq, res, next) => {
  if (typeof typeOrReq === "string") {
    const tokenType = typeOrReq;
    return async (req, res, next) => {
      return verifyTokenMiddleware(req, res, next, tokenType);
    };
  }

  return verifyTokenMiddleware(typeOrReq, res, next, "access");
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Unauthorized access", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError("Access denied", 403));
    }

    next();
  };
};