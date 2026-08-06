import "../config/dns.js";

import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../config/config.js";
import User from "../models/userModel.js";

import {
  USER_ROLE,
  USER_STATUS,
} from "../config/constants.js";

const ADMIN = {
  name: process.env.ADMIN_NAME,
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  role: USER_ROLE.ADMIN,
  status: USER_STATUS.ACTIVE,
};

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({
      email: ADMIN.email,
    });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists");
      process.exit(0);
    }

    const admin = await User.create(ADMIN);

    console.log("\n✅ Admin created successfully\n");

    console.table([
      {
        Name: admin.name,
        Email: admin.email,
        Role: admin.role,
        Status: admin.status,
      },
    ]);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Failed to seed admin");
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();