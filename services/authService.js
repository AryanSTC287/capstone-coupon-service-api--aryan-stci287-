import User from "../models/userModel.js";
import RefreshToken from "../models/refreshTokenModel.js";

import AppError from "../middlewares/appError.js";

import {
  USER_STATUS,
} from "../config/constants.js";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

// Admin Login
export const login = async ({ email, password }) => {
  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  if (!user) {
    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw new AppError(
      "Your account is inactive.",
      403
    );
  }

  const isPasswordValid =
    await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  const accessToken = generateAccessToken({
    id: user._id,
    role: user.role,
  });

  const refreshToken =
    generateRefreshToken({
      id: user._id,
    });

  await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expiresAt: new Date(
      Date.now() +
        30 * 24 * 60 * 60 * 1000
    ),
  });

  user.lastLoginAt = new Date();

  await user.save();

  user.password = undefined;

  return {
    user,
    accessToken,
    refreshToken,
  };
};

// Refresh Access Token
export const refreshAccessToken = async (
  refreshToken
) => {
  if (!refreshToken) {
    throw new AppError(
      "Refresh token is required",
      401
    );
  }

  const decoded =
    verifyRefreshToken(refreshToken);

  const storedToken =
    await RefreshToken.findOne({
      token: refreshToken,
    });

  if (!storedToken) {
    throw new AppError(
      "Invalid refresh token",
      401
    );
  }

  if (storedToken.expiresAt < new Date()) {
    await RefreshToken.findByIdAndDelete(
      storedToken._id
    );

    throw new AppError(
      "Refresh token has expired",
      401
    );
  }

  const user = await User.findById(
    decoded.id
  );

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw new AppError(
      "User account is inactive",
      403
    );
  }

  const accessToken =
    generateAccessToken({
      id: user._id,
      role: user.role,
    });

  return {
    accessToken,
  };
};

// Logout
export const logout = async (
  refreshToken
) => {
  if (!refreshToken) {
    throw new AppError(
      "Refresh token is required",
      400
    );
  }

  const deletedToken =
    await RefreshToken.findOneAndDelete({
      token: refreshToken,
    });

  if (!deletedToken) {
    throw new AppError(
      "Invalid refresh token",
      401
    );
  }

  return {
    message: "Logout successful",
  };
};

// Get Current Logged In User
export const getCurrentUser = async (
  userId
) => {
  const user = await User.findById(
    userId
  ).select("-password");

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw new AppError(
      "User account is inactive",
      403
    );
  }

  return user;
};

// Update Current Logged In User
export const updateCurrentUser = async (
  userId,
  profileData
) => {
  const updates = {};

  if (profileData.name !== undefined) {
    const name = profileData.name.trim();

    if (!name) {
      throw new AppError(
        "Name is required",
        400
      );
    }

    updates.name = name;
  }

  if (profileData.email !== undefined) {
    const email =
      profileData.email
        .trim()
        .toLowerCase();

    if (!email) {
      throw new AppError(
        "Email is required",
        400
      );
    }

    const existingUser =
      await User.findOne({
        email,
        _id: { $ne: userId },
      });

    if (existingUser) {
      throw new AppError(
        "Email is already registered",
        409
      );
    }

    updates.email = email;
  }

  const user =
    await User.findByIdAndUpdate(
      userId,
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw new AppError(
      "User account is inactive",
      403
    );
  }

  return user;
};
// Update Current Logged In User Password
export const updateCurrentUserPassword = async (
  userId,
  currentPassword,
  newPassword
) => {
  if (!currentPassword || !newPassword) {
    throw new AppError(
      "Current password and new password are required",
      400
    );
  }

  const user = await User.findById(userId).select(
    "+password"
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw new AppError(
      "User account is inactive",
      403
    );
  }

  const isPasswordValid =
    await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    throw new AppError(
      "Current password is incorrect",
      401
    );
  }

  const isSamePassword =
    await user.comparePassword(newPassword);

  if (isSamePassword) {
    throw new AppError(
      "New password must be different from current password",
      400
    );
  }

  user.password = newPassword;

  await user.save();

  return {
    message: "Password updated successfully",
  };
};