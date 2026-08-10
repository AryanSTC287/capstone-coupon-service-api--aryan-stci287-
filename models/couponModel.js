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
      required: [
        true,
        "Coupon code is required",
      ],
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


    /*
     * Global coupon usage limit.
     *
     * Example:
     * usageLimit = 100
     *
     * Maximum successful redemptions
     * for this coupon = 100.
     */
    usageLimit: {
      type: Number,
      required: [
        true,
        "Usage limit is required",
      ],
      min: 1,
    },


    /*
     * Number of times one customer
     * can redeem this coupon.
     */
    perCustomerLimit: {
      type: Number,
      required: [
        true,
        "Per customer limit is required",
      ],
      min: 1,
    },


    /*
     * Number of successful redemptions.
     *
     * This must never be greater
     * than usageLimit.
     */
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
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


// Unique coupon code
couponSchema.index(
  {
    code: 1,
  },
  {
    unique: true,
  }
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


/*
 * Model-level validation.
 *
 * Per-customer limit cannot be greater
 * than the global usage limit.
 */
couponSchema.pre(
  "validate",
  function (next) {

    if (
      this.perCustomerLimit >
      this.usageLimit
    ) {
      return next(
        new Error(
          "Per customer limit cannot exceed usage limit"
        )
      );
    }


    if (
      this.usedCount >
      this.usageLimit
    ) {
      return next(
        new Error(
          "Used count cannot exceed usage limit"
        )
      );
    }


    if (
      this.startDate &&
      this.expiryDate &&
      this.startDate >=
        this.expiryDate
    ) {
      return next(
        new Error(
          "Expiry date must be after start date"
        )
      );
    }


    next();
  }
);


const Coupon = model(
  "Coupon",
  couponSchema
);


export default Coupon;