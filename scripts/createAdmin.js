import dotenv from "dotenv";
import mongoose from "mongoose";

import User from "../models/userModel.js";
import { USER_ROLE, USER_STATUS } from "../config/constants.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const email = "admin@example.com";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists");
      await mongoose.disconnect();
      return;
    }

    const admin = await User.create({
      name: "System Admin",
      email,
      password: "Admin@123",
      role: USER_ROLE.ADMIN,
      status: USER_STATUS.ACTIVE,
    });

    console.log("Admin created successfully");
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Failed to create admin:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdmin();