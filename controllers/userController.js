import * as userService from "../services/userService.js";
import appSuccess from "../middlewares/appSuccess.js";

export const createUserController = async (
  req,
  res,
  next
) => {
  try {
    const user = await userService.createUser(
      req.body
    );

    appSuccess(res, {
      statusCode: 201,
      message: "User created successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsersController = async (
  req,
  res,
  next
) => {
  try {
    const result = await userService.getUsers(
      req.query
    );

    appSuccess(res, {
      message: "Users fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserByIdController = async (
  req,
  res,
  next
) => {
  try {
    const user = await userService.getUserById(
      req.params.id
    );

    appSuccess(res, {
      message: "User fetched successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserController = async (
  req,
  res,
  next
) => {
  try {
    const user = await userService.updateUser(
      req.params.id,
      req.body
    );

    appSuccess(res, {
      message: "User updated successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserController = async (
  req,
  res,
  next
) => {
  try {
    const user = await userService.deleteUser(
      req.params.id
    );

    appSuccess(res, {
      message: "User deleted successfully",
      data: {
        user,
      },
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
    const result =
      await userService.deactivateUser(
        req.params.id
      );

    appSuccess(res, {
      message: result.message,
      data: {
        message: result.message,
      },
    });
  } catch (error) {
    next(error);
  }
};