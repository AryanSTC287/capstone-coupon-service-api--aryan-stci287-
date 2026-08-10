import * as csvImportService from "../services/csvImportService.js";
import ImportJob from "../models/importJobModel.js";
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
      statusCode: 201,
      message: "CSV imported successfully",
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
    const page =
      parseInt(req.query.page, 10) || 1;

    const limit =
      parseInt(req.query.limit, 10) || 10;

    const skip = (page - 1) * limit;

    const [imports, totalCount] =
      await Promise.all([
        ImportJob.find({})
          .populate(
            "uploadedBy",
            "name email role"
          )
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),

        ImportJob.countDocuments(),
      ]);

    appSuccess(res, {
      message: "Import history fetched successfully",
      data: {
        imports,
        pagination: {
          totalCount,
          page,
          limit,
          totalPages: Math.ceil(
            totalCount / limit
          ),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getImportJobByIdController = async (
  req,
  res,
  next
) => {
  try {
    const importJob =
      await ImportJob.findById(req.params.id).populate(
        "uploadedBy",
        "name email role"
      );

    if (!importJob) {
      throw new Error("Import job not found");
    }

    appSuccess(res, {
      message: "Import details fetched successfully",
      data: importJob,
    });
  } catch (error) {
    next(error);
  }
};