import User from "../models/userModel.js";
import AppError from "../middlewares/appError.js";

/**
 * Create User (Admin)
 */
export const createUser = async (payload) => {
  const existingUser = await User.findOne({
    email: payload.email.toLowerCase(),
  });

  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  const user = await User.create({
    ...payload,
    email: payload.email.toLowerCase(),
  });

  return user;
};

// Get All Users
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

// Get User By Id
export const getUserById = async (id) => {
  const user = await User.findById(id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

// Update User
export const updateUser = async (id, payload) => {
  const user = await User.findByIdAndUpdate(id, payload, {
    new: true,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

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

// Deactivate User
export const deactivateUser = async (id) => {
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