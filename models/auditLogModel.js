import mongoose from "mongoose";

const { Schema, model } = mongoose;

const auditLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      required: true,
      trim: true,
    },

    entity: {
      type: String,
      required: true,
      trim: true,
    },

    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    ipAddress: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
auditLogSchema.index({ user: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ entity: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = model("AuditLog", auditLogSchema);

export default AuditLog;