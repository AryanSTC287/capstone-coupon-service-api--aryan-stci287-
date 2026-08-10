import User from "../models/userModel.js";
import AppError from "../middlewares/appError.js";

const buildName = (payload) => {
  if (payload.name !== undefined) {
    return payload.name?.trim();
  }

  const firstName = payload.firstName?.trim() || "";
  const lastName = payload.lastName?.trim() || "";

  return `${firstName} ${lastName}`.trim();
};

export const createUser = async (payload) => {
  if (!payload) {
    throw new AppError("User data is required", 400);
  }

  const name = buildName(payload);

  if (!name) {
    throw new AppError("Name is required", 400);
  }

  const email = payload.email?.trim().toLowerCase();

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  if (!payload.phone?.trim()) {
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
    name,
    email,
    phone: payload.phone.trim(),
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
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};

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

  const updateData = {};

  if (
    payload.name !== undefined ||
    payload.firstName !== undefined ||
    payload.lastName !== undefined
  ) {
    const name = buildName(payload);

    if (!name) {
      throw new AppError("Name is required", 400);
    }

    updateData.name = name;
  }

  if (payload.email !== undefined) {
    const email = payload.email?.trim().toLowerCase();

    if (!email) {
      throw new AppError("Email is required", 400);
    }

    updateData.email = email;
  }

  if (payload.phone !== undefined) {
    const phone = payload.phone?.trim();

    if (!phone) {
      throw new AppError("Phone number is required", 400);
    }

    updateData.phone = phone;
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

  if (updateData.email !== undefined) {
    const emailExists = await User.findOne({
      email: updateData.email,
      _id: { $ne: id },
    });

    if (emailExists) {
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