import mongoose from "mongoose";
import { REDEMPTION_STATUS } from "../config/constants.js";

const { Schema, model } = mongoose;

const redemptionSchema = new Schema(
  {
    coupon: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },

    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderId: {
      type: String,
      required: true,
      trim: true,
    },

    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: Object.values(REDEMPTION_STATUS),
      default: REDEMPTION_STATUS.SUCCESS,
    },

    revertedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    revertedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
redemptionSchema.index({ coupon: 1 });
redemptionSchema.index({ customer: 1 });
redemptionSchema.index({ orderId: 1 });
redemptionSchema.index({ createdAt: -1 });

const Redemption = model("Redemption", redemptionSchema);

export default Redemption;