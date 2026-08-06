import mongoose from "mongoose";
import {
  DISCOUNT_TYPE,
  COUPON_STATUS,
} from "../config/constants.js";


const { Schema, model } = mongoose;


const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      uppercase: true,
      trim: true,
    },


    description: {
      type: String,
      trim: true,
      default: "",
    },


    discountType: {
      type: String,
      enum: Object.values(DISCOUNT_TYPE),
      required: [
        true,
        "Discount type is required",
      ],
    },


    discountValue: {
      type: Number,
      required: [
        true,
        "Discount value is required",
      ],
      min: 1,
    },


    maxDiscount: {
      type: Number,
      default: null,
      min: 0,
    },


    usageLimit: {
      type: Number,
      required: [
        true,
        "Usage limit is required",
      ],
      min: 1,
    },


    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },


    perCustomerLimit: {
      type: Number,
      default: 1,
      min: 1,
    },


    startDate: {
      type: Date,
      required: [
        true,
        "Start date is required",
      ],
    },


    expiryDate: {
      type: Date,
      required: [
        true,
        "Expiry date is required",
      ],
    },


    status: {
      type: String,
      enum: Object.values(COUPON_STATUS),
      default: COUPON_STATUS.ACTIVE,
    },


    totalDiscountGiven: {
      type: Number,
      default: 0,
      min: 0,
    },


    totalRedemptions: {
      type: Number,
      default: 0,
      min: 0,
    },


    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [
        true,
        "Created by is required",
      ],
    },


    isDeleted: {
      type: Boolean,
      default: false,
    },


    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


// Indexes
couponSchema.index(
  { code: 1 },
  { unique: true }
);

couponSchema.index({
  status: 1,
});

couponSchema.index({
  expiryDate: 1,
});

couponSchema.index({
  createdBy: 1,
});


const Coupon = model(
  "Coupon",
  couponSchema
);


export default Coupon;