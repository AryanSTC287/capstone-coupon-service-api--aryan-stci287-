import * as couponService from "../services/couponService.js";
import appSuccess from "../middlewares/appSuccess.js";

// Create Coupon
export const createCouponController = async (
  req,
  res,
  next
) => {
  try {
    const coupon = await couponService.createCoupon(
      req.body,
      req.user.id,
      req.ip
    );

    appSuccess(res, {
      statusCode: 201,
      message: "Coupon created successfully",
      data: coupon,
    });

  } catch (error) {
    next(error);
  }
};

// Get All Coupons
export const getCouponsController = async (
  req,
  res,
  next
) => {
  try {
    const coupons =
      await couponService.getCoupons();

    appSuccess(res, {
      message: "Coupons fetched successfully",
      data: coupons,
    });

  } catch (error) {
    next(error);
  }
};

// Get Coupon By Id
export const getCouponByIdController = async (
  req,
  res,
  next
) => {
  try {
    const coupon =
      await couponService.getCouponById(
        req.params.id
      );

    appSuccess(res, {
      message: "Coupon fetched successfully",
      data: coupon,
    });

  } catch (error) {
    next(error);
  }
};

// Update Coupon
export const updateCouponController = async (
  req,
  res,
  next
) => {
  try {
    const coupon =
      await couponService.updateCoupon(
        req.params.id,
        req.body,
        req.user.id,
        req.ip
      );

    appSuccess(res, {
      message: "Coupon updated successfully",
      data: coupon,
    });

  } catch (error) {
    next(error);
  }
};

// Delete Coupon
export const deleteCouponController = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await couponService.deleteCoupon(
        req.params.id,
        req.user.id,
        req.ip
      );

    appSuccess(res, {
      message: "Coupon deleted successfully",
      data: result,
    });

  } catch (error) {
    next(error);
  }
};