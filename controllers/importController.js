import * as importService from "../services/importService.js";
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

    const result = await importService.importCoupons(
      req.file,
      req.user.id
    );

    appSuccess(res, {
      message: "Coupons imported successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getImportJobsController = async (
  req,
  res,
  next
) => {
  try {
    const jobs =
      await importService.getImportJobs();

    appSuccess(res, {
      message: "Import jobs fetched successfully",
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};