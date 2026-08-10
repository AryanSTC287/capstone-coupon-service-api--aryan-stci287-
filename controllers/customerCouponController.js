import * as couponService from "../services/couponService.js";
import appSuccess from "../middlewares/appSuccess.js";

export const getCustomerCouponsController = async (
  req,
  res,
  next
) => {
  try {
    const coupons =
      await couponService.getAvailableCoupons();

    appSuccess(res, {
      message:
        "Available coupons fetched successfully",
      data: {
        coupons,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerCouponByIdController = async (
  req,
  res,
  next
) => {
  try {
    const coupon =
      await couponService.getAvailableCouponById(
        req.params.id
      );

    appSuccess(res, {
      message: "Coupon fetched successfully",
      data: {
        coupon,
      },
    });
  } catch (error) {
    next(error);
  }
};