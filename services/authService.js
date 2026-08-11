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

const formatUser = (user) => {
  const userObject = user.toObject
    ? user.toObject()
    : user;

  const {
    password,
    ...userData
  } = userObject;

  return {
    ...userData,
    firstName: userObject.firstName || "",
    lastName: userObject.lastName || "",
  };
};

// Login
export const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError(
      "Email and password are required",
      400
    );
  }

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

  const accessToken =
    generateAccessToken({
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

  return {
    user: formatUser(user),
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

  return formatUser(user);
};

// Update Current Logged In User
export const updateCurrentUser = async (
  userId,
  profileData
) => {
  const user = await User.findById(userId);

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

  if (
    profileData.firstName !== undefined
  ) {
    const firstName =
      profileData.firstName.trim();

    if (!firstName) {
      throw new AppError(
        "First name is required",
        400
      );
    }

    user.firstName = firstName;
  }

  if (
    profileData.lastName !== undefined
  ) {
    const lastName =
      profileData.lastName.trim();

    if (!lastName) {
      throw new AppError(
        "Last name is required",
        400
      );
    }

    user.lastName = lastName;
  }

  if (
    profileData.email !== undefined
  ) {
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
        _id: {
          $ne: userId,
        },
      });

    if (existingUser) {
      throw new AppError(
        "Email is already registered",
        409
      );
    }

    user.email = email;
  }

  if (
    profileData.phone !== undefined
  ) {
    const phone =
      profileData.phone.trim();

    if (!phone) {
      throw new AppError(
        "Phone number is required",
        400
      );
    }

    user.phone = phone;
  }

  const hasChanges =
    profileData.firstName !== undefined ||
    profileData.lastName !== undefined ||
    profileData.email !== undefined ||
    profileData.phone !== undefined;

  if (!hasChanges) {
    throw new AppError(
      "No profile changes provided",
      400
    );
  }

  await user.save();

  return formatUser(user);
};

// Update Current Logged In User Password
export const updateCurrentUserPassword =
  async (
    userId,
    currentPassword,
    newPassword
  ) => {
    if (
      !currentPassword ||
      !newPassword
    ) {
      throw new AppError(
        "Current password and new password are required",
        400
      );
    }

    const user =
      await User.findById(userId).select(
        "+password"
      );

    if (!user) {
      throw new AppError(
        "User not found",
        404
      );
    }

    if (
      user.status !== USER_STATUS.ACTIVE
    ) {
      throw new AppError(
        "User account is inactive",
        403
      );
    }

    const isPasswordValid =
      await user.comparePassword(
        currentPassword
      );

    if (!isPasswordValid) {
      throw new AppError(
        "Current password is incorrect",
        401
      );
    }

    const isSamePassword =
      await user.comparePassword(
        newPassword
      );

    if (isSamePassword) {
      throw new AppError(
        "New password must be different from current password",
        400
      );
    }

    user.password = newPassword;

    await user.save();

    return {
      message:
        "Password updated successfully",
    };
  };