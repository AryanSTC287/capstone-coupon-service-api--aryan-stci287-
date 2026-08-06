import mongoose from "mongoose";

const { Schema, model } = mongoose;

export const PRODUCT_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  OUT_OF_STOCK: "OUT_OF_STOCK",
};

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.statics.PRODUCT_STATUS = PRODUCT_STATUS;

export default model("Product", productSchema);
