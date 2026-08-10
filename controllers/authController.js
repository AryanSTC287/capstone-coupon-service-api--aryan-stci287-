import {
  login,
  refreshAccessToken,
  logout,
  getCurrentUser,
  updateCurrentUser,
  updateCurrentUserPassword,
} from "../services/authService.js";

// POST /api/auth/login
export const loginController = async (
  req,
  res,
  next
) => {
  try {
    const result = await login(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/refresh-token
export const refreshTokenController = async (
  req,
  res,
  next
) => {
  try {
    const { refreshToken } = req.body;

    const result =
      await refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      message:
        "Access token refreshed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
export const logoutController = async (
  req,
  res,
  next
) => {
  try {
    const { refreshToken } = req.body;

    const result = await logout(refreshToken);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
export const getCurrentUserController = async (
  req,
  res,
  next
) => {
  try {
    const user = await getCurrentUser(
      req.user.id
    );

    res.status(200).json({
      success: true,
      message:
        "Current user fetched successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/auth/me
export const updateCurrentUserController = async (
  req,
  res,
  next
) => {
  try {
    const user = await updateCurrentUser(
      req.user.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message:
        "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
export const updateCurrentUserPasswordController = async (
  req,
  res,
  next
) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    const result =
      await updateCurrentUserPassword(
        req.user.id,
        currentPassword,
        newPassword
      );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};