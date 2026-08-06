import * as csvExportService from "../services/csvExportService.js";

export const exportCouponsController = async (
  req,
  res,
  next
) => {
  try {

    const csv =
      await csvExportService.exportCoupons();

    res.header(
      "Content-Type",
      "text/csv"
    );

    res.attachment("coupons.csv");

    return res.send(csv);

  } catch (error) {

    next(error);

  }
};