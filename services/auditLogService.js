import AuditLog from "../models/auditLogModel.js";
import AppError from "../middlewares/appError.js";

/**
 * Create Audit Log
 */
export const createAuditLog = async ({
  user,
  action,
  entity,
  entityId,
  description = "",
  ipAddress = "",
}) => {
  return AuditLog.create({
    user,
    action,
    entity,
    entityId,
    description,
    ipAddress,
  });
};

/**
 * Get All Audit Logs
 */
export const getAuditLogs = async () => {
  return AuditLog.find()
    .populate("user", "name email role")
    .sort({ createdAt: -1 });
};

/**
 * Get Audit Log By Id
 */
export const getAuditLogById = async (id) => {
  const auditLog = await AuditLog.findById(id)
    .populate("user", "name email role");

  if (!auditLog) {
    throw new AppError(
      "Audit log not found",
      404
    );
  }

  return auditLog;
};