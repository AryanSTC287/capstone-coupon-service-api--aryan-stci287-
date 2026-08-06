import jwt from "jsonwebtoken";
import AppError from "../middlewares/appError.js";
import { userRefreshTokenPath } from "../config/constants.js";

/**
 * Generate Access Token
 */
export const generateAccessToken = (payload) => {
  try {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION,
    });
  } catch (error) {
    throw new AppError(
      "Error during access token generation",
      500
    );
  }
};

/**
 * Generate Refresh Token
 */
export const generateRefreshToken = (payload) => {
  try {
    const signPayload =
      typeof payload === "string" ||
      typeof payload === "number"
        ? { id: payload }
        : payload;

    return jwt.sign(signPayload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION,
    });
  } catch (error) {
    throw new AppError(
      "Error during refresh token generation",
      500
    );
  }
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

/**
 * Convert Expiration Time
 * (If existing code uses it)
 */
export const convertExpirationToMs = (expiration) => {
  const source = expiration || "1d";
  const units = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  const value = parseInt(source, 10);
  const unit = source.slice(-1);

  return value * (units[unit] || 1);
};

/**
 * Set Access Token Cookie
 */
export const setAccessTokenCookies = (res, token) => {
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: convertExpirationToMs(
      process.env.JWT_ACCESS_EXPIRATION || "1d"
    ),
  });
};

/**
 * Set Refresh Token Cookie
 */
export const setRefreshTokenCookies = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: convertExpirationToMs(
      process.env.JWT_REFRESH_EXPIRATION || "7d"
    ),
    path: userRefreshTokenPath,
  });
};