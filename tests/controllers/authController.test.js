import { jest } from "@jest/globals";

const mockLogin = jest.fn();
const mockRefreshAccessToken = jest.fn();
const mockLogout = jest.fn();
const mockGetCurrentUser = jest.fn();
const mockUpdateCurrentUser = jest.fn();
const mockUpdateCurrentUserPassword = jest.fn();

jest.unstable_mockModule(
  "../../services/authService.js",
  () => ({
    login: mockLogin,
    refreshAccessToken: mockRefreshAccessToken,
    logout: mockLogout,
    getCurrentUser: mockGetCurrentUser,
    updateCurrentUser: mockUpdateCurrentUser,
    updateCurrentUserPassword:
      mockUpdateCurrentUserPassword,
  })
);

const {
  loginController,
  refreshTokenController,
  logoutController,
  getCurrentUserController,
  updateCurrentUserController,
  updateCurrentUserPasswordController,
} = await import(
  "../../controllers/authController.js"
);

describe("authController", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
      params: {},
      user: {
        id: "user123",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  describe("loginController", () => {
    test("should login successfully", async () => {
      const result = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: {
          id: "user123",
          name: "Aryan",
          email: "aryan@example.com",
          role: "ADMIN",
        },
      };

      req.body = {
        email: "aryan@example.com",
        password: "password123",
      };

      mockLogin.mockResolvedValue(result);

      await loginController(req, res, next);

      expect(mockLogin).toHaveBeenCalledWith(
        req.body
      );

      expect(res.status).toHaveBeenCalledWith(
        200
      );

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Login successful",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    test("should pass error to next", async () => {
      const error = new Error(
        "Invalid credentials"
      );

      req.body = {
        email: "aryan@example.com",
        password: "wrong-password",
      };

      mockLogin.mockRejectedValue(error);

      await loginController(req, res, next);

      expect(next).toHaveBeenCalledWith(error);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("refreshTokenController", () => {
    test("should refresh access token successfully", async () => {
      const result = {
        accessToken: "new-access-token",
      };

      req.body = {
        refreshToken: "refresh-token",
      };

      mockRefreshAccessToken.mockResolvedValue(
        result
      );

      await refreshTokenController(
        req,
        res,
        next
      );

      expect(
        mockRefreshAccessToken
      ).toHaveBeenCalledWith(
        "refresh-token"
      );

      expect(res.status).toHaveBeenCalledWith(
        200
      );

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message:
          "Access token refreshed successfully",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    test("should pass error to next", async () => {
      const error = new Error(
        "Invalid refresh token"
      );

      req.body = {
        refreshToken: "invalid-token",
      };

      mockRefreshAccessToken.mockRejectedValue(
        error
      );

      await refreshTokenController(
        req,
        res,
        next
      );

      expect(next).toHaveBeenCalledWith(error);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("logoutController", () => {
    test("should logout successfully", async () => {
      const result = {
        message: "Logout successful",
      };

      req.body = {
        refreshToken: "refresh-token",
      };

      mockLogout.mockResolvedValue(result);

      await logoutController(
        req,
        res,
        next
      );

      expect(mockLogout).toHaveBeenCalledWith(
        "refresh-token"
      );

      expect(res.status).toHaveBeenCalledWith(
        200
      );

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: result.message,
      });

      expect(next).not.toHaveBeenCalled();
    });

    test("should pass error to next", async () => {
      const error = new Error(
        "Logout failed"
      );

      req.body = {
        refreshToken: "refresh-token",
      };

      mockLogout.mockRejectedValue(error);

      await logoutController(
        req,
        res,
        next
      );

      expect(next).toHaveBeenCalledWith(error);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("getCurrentUserController", () => {
    test("should return current user successfully", async () => {
      const user = {
        id: "user123",
        name: "Aryan",
        email: "aryan@example.com",
        role: "ADMIN",
      };

      req.user.id = "user123";

      mockGetCurrentUser.mockResolvedValue(
        user
      );

      await getCurrentUserController(
        req,
        res,
        next
      );

      expect(
        mockGetCurrentUser
      ).toHaveBeenCalledWith("user123");

      expect(res.status).toHaveBeenCalledWith(
        200
      );

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message:
          "Current user fetched successfully",
        data: user,
      });

      expect(next).not.toHaveBeenCalled();
    });

    test("should pass error to next", async () => {
      const error = new Error(
        "User not found"
      );

      req.user.id = "user123";

      mockGetCurrentUser.mockRejectedValue(
        error
      );

      await getCurrentUserController(
        req,
        res,
        next
      );

      expect(next).toHaveBeenCalledWith(error);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("updateCurrentUserController", () => {
    test("should update current user successfully", async () => {
      const user = {
        id: "user123",
        name: "Aryan Chauhan",
        email: "aryan@example.com",
      };

      req.user.id = "user123";

      req.body = {
        name: "Aryan Chauhan",
        email: "aryan@example.com",
      };

      mockUpdateCurrentUser.mockResolvedValue(
        user
      );

      await updateCurrentUserController(
        req,
        res,
        next
      );

      expect(
        mockUpdateCurrentUser
      ).toHaveBeenCalledWith(
        "user123",
        req.body
      );

      expect(res.status).toHaveBeenCalledWith(
        200
      );

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message:
          "Profile updated successfully",
        data: user,
      });

      expect(next).not.toHaveBeenCalled();
    });

    test("should pass error to next", async () => {
      const error = new Error(
        "Profile update failed"
      );

      req.user.id = "user123";

      req.body = {
        name: "Updated Name",
      };

      mockUpdateCurrentUser.mockRejectedValue(
        error
      );

      await updateCurrentUserController(
        req,
        res,
        next
      );

      expect(next).toHaveBeenCalledWith(error);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe(
    "updateCurrentUserPasswordController",
    () => {
      test("should update password successfully", async () => {
        const result = {
          message:
            "Password updated successfully",
        };

        req.user.id = "user123";

        req.body = {
          currentPassword: "oldPassword123",
          newPassword: "newPassword123",
        };

        mockUpdateCurrentUserPassword.mockResolvedValue(
          result
        );

        await updateCurrentUserPasswordController(
          req,
          res,
          next
        );

        expect(
          mockUpdateCurrentUserPassword
        ).toHaveBeenCalledWith(
          "user123",
          "oldPassword123",
          "newPassword123"
        );

        expect(
          res.status
        ).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: result.message,
        });

        expect(next).not.toHaveBeenCalled();
      });

      test("should pass error to next", async () => {
        const error = new Error(
          "Current password is incorrect"
        );

        req.user.id = "user123";

        req.body = {
          currentPassword: "wrongPassword",
          newPassword: "newPassword123",
        };

        mockUpdateCurrentUserPassword.mockRejectedValue(
          error
        );

        await updateCurrentUserPasswordController(
          req,
          res,
          next
        );

        expect(
          next
        ).toHaveBeenCalledWith(error);

        expect(
          res.status
        ).not.toHaveBeenCalled();

        expect(
          res.json
        ).not.toHaveBeenCalled();
      });
    }
  );
});