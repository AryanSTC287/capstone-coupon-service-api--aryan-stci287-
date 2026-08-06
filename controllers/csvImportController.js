import * as csvImportService from "../services/csvImportService.js";
import appSuccess from "../middlewares/appSuccess.js";

export const importCouponsController = async (
  req,
  res,
  next
) => {
  try {
    if (!req.file) {
      throw new Error("CSV file is required");
    }

    const result =
      await csvImportService.importCoupons(
        req.file,
        req.user.id
      );

    appSuccess(res, {
      message: "CSV imported successfully",
      data: result,
    });

  } catch (error) {
    next(error);
  }
};