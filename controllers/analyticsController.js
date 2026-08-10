import * as analyticsService from "../services/analyticsService.js";
import appSuccess from "../middlewares/appSuccess.js";

export const dashboardAnalyticsController = async (
  req,
  res,
  next
) => {
  try {
    const analytics =
      await analyticsService.getDashboardAnalytics();

    appSuccess(res, {
      message:
        "Dashboard analytics fetched successfully",
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

export const couponAnalyticsController = async (
  req,
  res,
  next
) => {
  try {
    const analytics =
      await analyticsService.couponAnalytics();

    appSuccess(res, {
      message:
        "Coupon analytics fetched successfully",
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};