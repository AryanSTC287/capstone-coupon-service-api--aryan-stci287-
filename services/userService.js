import User from "../models/userModel.js";
import AppError from "../middlewares/appError.js";

/**
 * Create User
 */
export const createUser = async (payload) => {
  if (!payload) {
    throw new AppError("User data is required", 400);
  }

  const email = payload.email?.trim().toLowerCase();

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  const name = `${payload.firstName || ""} ${
    payload.lastName || ""
  }`.trim();

  if (!name) {
    throw new AppError("Name is required", 400);
  }

  if (!payload.password) {
    throw new AppError("Password is required", 400);
  }

  const user = await User.create({
    name,
    email,
    phone: payload.phone?.trim() || "",
    password: payload.password,
    role: payload.role || "CUSTOMER",
    status: payload.status || "ACTIVE",
  });

  return user;
};

/**
 * Get All Users
 */
export const getUsers = async (filters = {}) => {
  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 10;

  const skip = (page - 1) * limit;

  const query = User.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const [users, totalCount] = await Promise.all([
    query,
    User.countDocuments(),
  ]);

  return {
    users,
    pagination: {
      totalCount,
      page,
      limit,
    },
  };
};

/**
 * Get User By Id
 */
export const getUserById = async (id) => {
  if (!id) {
    throw new AppError("User id is required", 400);
  }

  const user = await User.findById(id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

/**
 * Update User
 */
export const updateUser = async (id, payload) => {
  if (!id) {
    throw new AppError("User id is required", 400);
  }

  if (!payload) {
    throw new AppError("User data is required", 400);
  }

  const updateData = {};

  if (payload.firstName !== undefined || payload.lastName !== undefined) {
    const existingUser = await User.findById(id);

    if (!existingUser) {
      throw new AppError("User not found", 404);
    }

    const name = `${payload.firstName || ""} ${
      payload.lastName || ""
    }`.trim();

    if (!name) {
      throw new AppError("Name is required", 400);
    }

    updateData.name = name;
  }

  if (payload.email !== undefined) {
    updateData.email = payload.email.trim().toLowerCase();
  }

  if (payload.phone !== undefined) {
    updateData.phone = payload.phone.trim();
  }

  if (payload.role !== undefined) {
    updateData.role = payload.role;
  }

  if (payload.status !== undefined) {
    updateData.status = payload.status;
  }

  if (payload.password) {
    updateData.password = payload.password;
  }

  if (
    updateData.email !== undefined
  ) {
    const existingUser = await User.findOne({
      email: updateData.email,
      _id: { $ne: id },
    });

    if (existingUser) {
      throw new AppError("User already exists", 409);
    }
  }

  const user = await User.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

/**
 * Delete User
 */
export const deleteUser = async (id) => {
  if (!id) {
    throw new AppError("User id is required", 400);
  }

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

/**
 * Deactivate User
 */
export const deactivateUser = async (id) => {
  if (!id) {
    throw new AppError("User id is required", 400);
  }

  const user = await User.findById(id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.status = "INACTIVE";

  await user.save();

  return {
    message: "User deactivated successfully",
  };
};