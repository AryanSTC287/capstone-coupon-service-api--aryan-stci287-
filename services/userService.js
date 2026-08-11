import User from "../models/userModel.js";
import AppError from "../middlewares/appError.js";

export const createUser = async (payload) => {
  if (!payload) {
    throw new AppError("User data is required", 400);
  }

  const firstName = payload.firstName?.trim();
  const lastName = payload.lastName?.trim();
  const email = payload.email?.trim().toLowerCase();
  const phone = payload.phone?.trim();

  if (!firstName) {
    throw new AppError("First name is required", 400);
  }

  if (!lastName) {
    throw new AppError("Last name is required", 400);
  }

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  if (!phone) {
    throw new AppError("Phone number is required", 400);
  }

  if (!payload.password) {
    throw new AppError("Password is required", 400);
  }

  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password: payload.password,
    role: payload.role || "CUSTOMER",
    status: payload.status || "ACTIVE",
  });

  return user;
};

export const getUsers = async (filters = {}) => {
  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 10;

  const skip = (page - 1) * limit;

  const [users, totalCount] = await Promise.all([
    User.find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    User.countDocuments(),
  ]);

  return {
    users,
    pagination: {
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};

export const getUserById = async (id) => {
  if (!id) {
    throw new AppError("User id is required", 400);
  }

  const user = await User.findById(id).select("-password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const updateUser = async (id, payload) => {
  if (!id) {
    throw new AppError("User id is required", 400);
  }

  if (!payload) {
    throw new AppError("User data is required", 400);
  }

  const existingUser = await User.findById(id);

  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  if (payload.firstName !== undefined) {
    const firstName = payload.firstName.trim();

    if (!firstName) {
      throw new AppError("First name is required", 400);
    }

    existingUser.firstName = firstName;
  }

  if (payload.lastName !== undefined) {
    const lastName = payload.lastName.trim();

    if (!lastName) {
      throw new AppError("Last name is required", 400);
    }

    existingUser.lastName = lastName;
  }

  if (payload.email !== undefined) {
    const email = payload.email.trim().toLowerCase();

    if (!email) {
      throw new AppError("Email is required", 400);
    }

    const emailExists = await User.findOne({
      email,
      _id: { $ne: id },
    });

    if (emailExists) {
      throw new AppError("User already exists", 409);
    }

    existingUser.email = email;
  }

  if (payload.phone !== undefined) {
    const phone = payload.phone.trim();

    if (!phone) {
      throw new AppError("Phone number is required", 400);
    }

    existingUser.phone = phone;
  }

  if (payload.role !== undefined) {
    existingUser.role = payload.role;
  }

  if (payload.status !== undefined) {
    existingUser.status = payload.status;
  }

  if (payload.password) {
    existingUser.password = payload.password;
  }

  await existingUser.save();

  existingUser.password = undefined;

  return existingUser;
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