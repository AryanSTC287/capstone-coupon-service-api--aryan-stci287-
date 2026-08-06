import * as userService from "../services/userService.js";
import * as authUserService from "../services/authUserService.js";
import appSuccess from "../middlewares/appSuccess.js";

const handleControllerError = (error, next) => {
  if (next) {
    return next(error);
  }
  throw error;
};

export const loginUser = async (req, res, next) => {
  try {
    const result = await authUserService.loginUserService(
      req.body.identifier,
      req.body.password,
      res
    );

    appSuccess(res, {
      message: "User login successfully",
      data: result,
    });
  } catch (error) {
    handleControllerError(error, next);
  }
};

export const refreshUserAccessToken = async (req, res, next) => {
  try {
    const result = await authUserService.refreshUserAccessTokenService(
      req.refreshToken,
      req.user,
      res
    );

    appSuccess(res, {
      message: "Access token refreshed successfully",
      data: result,
    });
  } catch (error) {
    handleControllerError(error, next);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const result = await authUserService.logoutUserService(req.user, res);

    appSuccess(res, {
      message: "User logged out successfully",
      data: result,
    });
  } catch (error) {
    handleControllerError(error, next);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsers();

    appSuccess(res, {
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    handleControllerError(error, next);
  }
};

export const createUserController = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);

    appSuccess(res, {
      statusCode: 201,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    handleControllerError(error, next);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await userService.deleteUser(req.params.id);

    appSuccess(res, {
      message: "User deleted successfully",
      data: { deleted: deletedUser },
    });
  } catch (error) {
    handleControllerError(error, next);
  }
};

export const getUsersController = async (req, res, next) => {
  try {
    const users = await userService.getUsers();

    appSuccess(res, {
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserByIdController = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);

    appSuccess(res, {
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserController = async (req, res, next) => {
  try {
    const user = await userService.updateUser(
      req.params.id,
      req.body
    );

    appSuccess(res, {
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateUserController = async (
  req,
  res,
  next
) => {
  try {
    const result = await userService.deactivateUser(
      req.params.id
    );

    appSuccess(res, {
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export { createUserController as createUser, getUserByIdController as getUserById, updateUserController as updateUser };