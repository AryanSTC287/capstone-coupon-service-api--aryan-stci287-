import * as auditLogService from "../services/auditLogService.js";
import appSuccess from "../middlewares/appSuccess.js";

// Get All Audit Logs
export const getAuditLogsController = async (
  req,
  res,
  next
) => {
  try {
    const result = await auditLogService.getAuditLogs();

    appSuccess(res, {
      message: "Audit logs fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get Audit Log By Id
export const getAuditLogByIdController = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await auditLogService.getAuditLogById(
        req.params.id
      );

    appSuccess(res, {
      message: "Audit log fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};