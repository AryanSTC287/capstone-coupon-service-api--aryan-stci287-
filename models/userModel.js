import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  USER_ROLE,
  USER_STATUS,
} from "../config/constants.js";

const { Schema, model } = mongoose;


const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: USER_ROLE.CUSTOMER,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(
    this.password,
    12
  );

  next();
});


// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (
  candidatePassword
) {
  return bcrypt.compare(
    candidatePassword,
    this.password
  );
};


const User = model("User", userSchema);

export default User;