import { jest } from "@jest/globals";

jest.unstable_mockModule("../../middlewares/appSuccess.js", () => ({
  default: jest.fn(),
}));

jest.unstable_mockModule("../../middlewares/appError.js", () => ({
  default: class AppError extends Error {
    constructor(message, statusCode = 500, options = {}) {
      super(message);

      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith("4")
        ? "fail"
        : "error";
      this.responseCode = options.responseCode || 1;
      this.errors = options.errors || [];
      this.isOperational = true;
    }
  },
}));

jest.unstable_mockModule("../../models/userModel.js", () => ({
  default: {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

jest.unstable_mockModule("../../services/authUserService.js", () => ({
  loginUserService: jest.fn(),
  logoutUserService: jest.fn(),
  refreshUserAccessTokenService: jest.fn(),
}));

const AppSuccess =
  (await import("../../middlewares/appSuccess.js")).default;

const User =
  (await import("../../models/userModel.js")).default;

const {
  loginUserService,
  logoutUserService,
  refreshUserAccessTokenService,
} =
  await import("../../services/authUserService.js");

const {
  loginUser,
  refreshUserAccessToken,
  logoutUser,
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} =
  await import("../../controllers/userController.js");

describe("UserController Tests", () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
      params: {},
      query: {},
      user: {
        id: "user123",
      },
      refreshToken: "refresh-token-123",
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn(),
    };
  });

  describe("loginUser", () => {
    it("should login user successfully", async () => {
      const mockResponse = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: {
          id: "user123",
          email: "test@example.com",
        },
      };

      req.body = {
        identifier: "test@example.com",
        password: "password123",
      };

      loginUserService.mockResolvedValue(mockResponse);

      await loginUser(req, res);

      expect(loginUserService).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
        res
      );

      expect(AppSuccess).toHaveBeenCalledWith(res, {
        message: "User login successfully",
        data: mockResponse,
      });
    });
  });

  describe("refreshUserAccessToken", () => {
    it("should refresh access token successfully", async () => {
      const mockResponse = {
        accessToken: "new-access-token",
      };

      refreshUserAccessTokenService.mockResolvedValue(
        mockResponse
      );

      await refreshUserAccessToken(req, res);

      expect(
        refreshUserAccessTokenService
      ).toHaveBeenCalledWith(
        "refresh-token-123",
        req.user,
        res
      );

      expect(AppSuccess).toHaveBeenCalledWith(res, {
        message: "Access token refreshed successfully",
        data: mockResponse,
      });
    });
  });

  describe("logoutUser", () => {
    it("should logout user successfully", async () => {
      const mockResponse = {
        deleted: true,
      };

      logoutUserService.mockResolvedValue(mockResponse);

      await logoutUser(req, res);

      expect(logoutUserService).toHaveBeenCalledWith(
        req.user,
        res
      );

      expect(AppSuccess).toHaveBeenCalledWith(res, {
        message: "User logged out successfully",
        data: mockResponse,
      });
    });
  });

  describe("getAllUsers", () => {
    it("should get all users with default pagination", async () => {
      const mockUsers = [
        {
          id: "1",
          name: "User 1",
          email: "user1@example.com",
        },
        {
          id: "2",
          name: "User 2",
          email: "user2@example.com",
        },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockUsers),
      };

      User.find.mockReturnValue(mockQuery);
      User.countDocuments.mockResolvedValue(25);

      req.query = {};

      await getAllUsers(req, res);

      expect(User.find).toHaveBeenCalledWith({});

      expect(mockQuery.sort).toHaveBeenCalledWith({
        createdAt: -1,
      });

      expect(mockQuery.skip).toHaveBeenCalledWith(0);

      expect(mockQuery.limit).toHaveBeenCalledWith(10);

      expect(AppSuccess).toHaveBeenCalledWith(res, {
        message: "Users fetched successfully",
        data: {
          users: mockUsers,
          pagination: {
            totalCount: 25,
            page: 1,
            limit: 10,
            totalPages: 3,
          },
        },
      });
    });

    it("should support custom pagination", async () => {
      const mockUsers = [
        {
          id: "11",
          name: "User 11",
          email: "user11@example.com",
        },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockUsers),
      };

      User.find.mockReturnValue(mockQuery);
      User.countDocuments.mockResolvedValue(21);

      req.query = {
        page: "2",
        limit: "10",
      };

      await getAllUsers(req, res);

      expect(mockQuery.skip).toHaveBeenCalledWith(10);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);

      expect(AppSuccess).toHaveBeenCalledWith(res, {
        message: "Users fetched successfully",
        data: {
          users: mockUsers,
          pagination: {
            totalCount: 21,
            page: 2,
            limit: 10,
            totalPages: 3,
          },
        },
      });
    });
  });

  describe("createUser", () => {
    it("should create user successfully", async () => {
      req.body = {
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        password: "password123",
        role: "CUSTOMER",
        status: "ACTIVE",
      };

      User.findOne.mockResolvedValue(null);

      const mockCreatedUser = {
        id: "user123",
        ...req.body,
      };

      User.create.mockResolvedValue(mockCreatedUser);

      await createUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({
        email: "john@example.com",
      });

      expect(User.create).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        password: "password123",
        role: "CUSTOMER",
        status: "ACTIVE",
      });

      expect(AppSuccess).toHaveBeenCalledWith(res, {
        statusCode: 201,
        message: "User created successfully",
        data: mockCreatedUser,
      });
    });

    it("should create CUSTOMER by default", async () => {
      req.body = {
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        password: "password123",
      };

      User.findOne.mockResolvedValue(null);

      const mockCreatedUser = {
        id: "user123",
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        password: "password123",
        role: "CUSTOMER",
        status: "ACTIVE",
      };

      User.create.mockResolvedValue(mockCreatedUser);

      await createUser(req, res);

      expect(User.create).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        password: "password123",
        role: "CUSTOMER",
        status: "ACTIVE",
      });
    });

    it("should throw error if user already exists", async () => {
      req.body = {
        name: "Existing User",
        email: "existing@example.com",
        phone: "1234567890",
        password: "password123",
      };

      User.findOne.mockResolvedValue({
        id: "existing-user",
      });

      await expect(
        createUser(req, res)
      ).rejects.toThrow("User already exists");
    });

    it("should throw error if name is missing", async () => {
      req.body = {
        email: "john@example.com",
        phone: "1234567890",
        password: "password123",
      };

      await expect(
        createUser(req, res)
      ).rejects.toThrow("Name is required");
    });

    it("should throw error if email is missing", async () => {
      req.body = {
        name: "John Doe",
        phone: "1234567890",
        password: "password123",
      };

      await expect(
        createUser(req, res)
      ).rejects.toThrow("Email is required");
    });

    it("should throw error if password is missing", async () => {
      req.body = {
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
      };

      await expect(
        createUser(req, res)
      ).rejects.toThrow("Password is required");
    });
  });

  describe("getUserById", () => {
    it("should get user by id successfully", async () => {
      req.params.id = "user123";

      const mockUser = {
        id: "user123",
        name: "John Doe",
        email: "john@example.com",
      };

      User.findById.mockResolvedValue(mockUser);

      await getUserById(req, res);

      expect(User.findById).toHaveBeenCalledWith(
        "user123"
      );

      expect(AppSuccess).toHaveBeenCalledWith(res, {
        message: "User fetched successfully",
        data: mockUser,
      });
    });

    it("should throw error if id is not provided", async () => {
      req.params = {};

      await expect(
        getUserById(req, res)
      ).rejects.toThrow("User id is required");
    });

    it("should throw error if user is not found", async () => {
      req.params.id = "nonexistent";

      User.findById.mockResolvedValue(null);

      await expect(
        getUserById(req, res)
      ).rejects.toThrow("User not found");
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      req.params.id = "user123";

      req.body = {
        name: "Updated Name",
        email: "updated@example.com",
        phone: "9999999999",
      };

      const existingUser = {
        id: "user123",
        name: "Old Name",
        email: "old@example.com",
      };

      const mockUpdatedUser = {
        id: "user123",
        ...req.body,
      };

      User.findById.mockResolvedValue(existingUser);
      User.findOne.mockResolvedValue(null);
      User.findByIdAndUpdate.mockResolvedValue(
        mockUpdatedUser
      );

      await updateUser(req, res);

      expect(User.findById).toHaveBeenCalledWith(
        "user123"
      );

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        "user123",
        {
          name: "Updated Name",
          email: "updated@example.com",
          phone: "9999999999",
        },
        {
          new: true,
          runValidators: true,
        }
      );

      expect(AppSuccess).toHaveBeenCalledWith(res, {
        message: "User updated successfully",
        data: mockUpdatedUser,
      });
    });

    it("should update firstName and lastName into name", async () => {
      req.params.id = "user123";

      req.body = {
        firstName: "John",
        lastName: "Doe",
      };

      User.findById.mockResolvedValue({
        id: "user123",
        name: "Old Name",
      });

      User.findByIdAndUpdate.mockResolvedValue({
        id: "user123",
        name: "John Doe",
      });

      await updateUser(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        "user123",
        {
          name: "John Doe",
        },
        {
          new: true,
          runValidators: true,
        }
      );
    });

    it("should throw error if user is not found", async () => {
      req.params.id = "nonexistent";

      req.body = {
        name: "Updated Name",
      };

      User.findById.mockResolvedValue(null);

      await expect(
        updateUser(req, res)
      ).rejects.toThrow("User not found");
    });

    it("should throw error if email already exists", async () => {
      req.params.id = "user123";

      req.body = {
        email: "existing@example.com",
      };

      User.findById.mockResolvedValue({
        id: "user123",
        name: "John Doe",
      });

      User.findOne.mockResolvedValue({
        id: "another-user",
        email: "existing@example.com",
      });

      await expect(
        updateUser(req, res)
      ).rejects.toThrow("User already exists");
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      req.params.id = "user123";

      const mockDeletedUser = {
        id: "user123",
        name: "John Doe",
      };

      User.findByIdAndDelete.mockResolvedValue(
        mockDeletedUser
      );

      await deleteUser(req, res);

      expect(
        User.findByIdAndDelete
      ).toHaveBeenCalledWith("user123");

      expect(AppSuccess).toHaveBeenCalledWith(res, {
        message: "User deleted successfully",
        data: {
          deleted: mockDeletedUser,
        },
      });
    });

    it("should throw error if id is not provided", async () => {
      req.params = {};

      await expect(
        deleteUser(req, res)
      ).rejects.toThrow("User id is required");
    });

    it("should throw error if user is not found", async () => {
      req.params.id = "nonexistent";

      User.findByIdAndDelete.mockResolvedValue(null);

      await expect(
        deleteUser(req, res)
      ).rejects.toThrow("User not found");
    });
  });
});