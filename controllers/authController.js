import {
  login,
  refreshAccessToken,
  logout,
  getCurrentUser,
} from "../services/authService.js";


// POST /api/v1/auth/login
 
export const loginController = async (req, res, next) => {
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


// POST /api/v1/auth/refresh-token
 
export const refreshTokenController = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const result = await refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/logout
 */
export const logoutController = async (req, res, next) => {
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


 // GET /api/v1/auth/me
export const getCurrentUserController = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};