import mongoose from "mongoose";

const { Schema, model } = mongoose;

const importJobSchema = new Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },

    totalRows: {
      type: Number,
      default: 0,
    },

    processedRows: {
      type: Number,
      default: 0,
    },

    successRows: {
      type: Number,
      default: 0,
    },

    failedRows: {
      type: Number,
      default: 0,
    },

     ValidationErrors: [
      {
        row: Number,
        reason: String,
      },
    ],

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

importJobSchema.index({ uploadedBy: 1 });
importJobSchema.index({ status: 1 });
importJobSchema.index({ createdAt: -1 });

export default model("ImportJob", importJobSchema);