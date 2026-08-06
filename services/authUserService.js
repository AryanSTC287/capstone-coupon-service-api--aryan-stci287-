import User from "../models/userModel.js";
import RefreshToken from "../models/refreshTokenModel.js";
import AppError from "../middlewares/appError.js";
import {
  comparePassword,
  generateSessionId,
  calculateRefreshExpiresAt,
} from "../utils/helpers.js";
import {
  generateAccessToken,
  generateRefreshToken,
  setAccessTokenCookies,
  setRefreshTokenCookies,
} from "../utils/jwt.js";
import { userRefreshTokenPath } from "../config/constants.js";

const findUserByIdentifier = async (identifier) => {
  const query = /^[0-9]+$/.test(identifier)
    ? User.findOne({ phone: identifier })
    : User.findOne({ email: identifier.toLowerCase() });

  if (query && typeof query.select === "function") {
    return await query.select("+password");
  }

  return await query;
};

export const loginUserService = async (identifier, password, res) => {
  const user = await findUserByIdentifier(identifier);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isValid = await comparePassword(password, user.password);

  if (!isValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const sessionId = generateSessionId();
  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });
  const expiresAt = calculateRefreshExpiresAt(
    process.env.JWT_REFRESH_EXPIRATION || "7d"
  );

  await RefreshToken.create({
    userId: user._id,
    sessionId,
    token: refreshToken,
    expiresAt,
  });

  setAccessTokenCookies(res, accessToken);
  setRefreshTokenCookies(res, refreshToken);

  return {
    user: {
      ...user,
      password: undefined,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshUserAccessTokenService = async (
  refreshToken,
  user,
  res
) => {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  const storedToken = await RefreshToken.findOne({
    token: refreshToken,
    userId: user.id,
  });

  if (!storedToken) {
    throw new AppError("Invalid refresh token", 401);
  }

  const foundUser = await User.findById(user.id);

  if (!foundUser) {
    throw new AppError("User not found", 404);
  }

  const accessToken = generateAccessToken({
    id: foundUser._id,
    role: foundUser.role,
  });

  setAccessTokenCookies(res, accessToken);

  return {
    accessToken,
  };
};

export const logoutUserService = async (user, res) => {
  if (!user || !user.id || !user.sessionId) {
    throw new AppError("Refresh token is required", 400);
  }

  const result = await RefreshToken.deleteOne({
    userId: user.id,
    sessionId: user.sessionId,
  });

  if (!result || !result.acknowledged) {
    throw new AppError("Invalid refresh token", 401);
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken", {
    path: userRefreshTokenPath,
  });

  return {
    deleted: true,
  };
};
