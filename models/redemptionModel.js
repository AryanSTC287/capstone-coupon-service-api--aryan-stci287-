import mongoose from "mongoose";

import {
  REDEMPTION_STATUS,
} from "../config/constants.js";

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
      required: [true, "Order ID is required"],
      trim: true,
    },

    orderAmount: {
      type: Number,
      required: [true, "Order amount is required"],
      min: 0,
    },

    idempotencyKey: {
      type: String,
      required: [true, "Idempotency key is required"],
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

redemptionSchema.index(
  {
    coupon: 1,
    orderId: 1,
  },
  {
    unique: true,
  }
);

redemptionSchema.index({
  coupon: 1,
});

redemptionSchema.index({
  customer: 1,
});

redemptionSchema.index({
  orderId: 1,
});

redemptionSchema.index({
  createdAt: -1,
});

const Redemption = model(
  "Redemption",
  redemptionSchema
);

export default Redemption;