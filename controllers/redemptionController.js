import * as redemptionService from "../services/redemptionService.js";
import appSuccess from "../middlewares/appSuccess.js";

// Redeem Coupon
export const redeemCouponController = async (
  req,
  res,
  next
) => {
  try {
    const result = await redemptionService.redeemCoupon({
      ...req.body,
      customerId: req.user.id,
    });

    appSuccess(res, {
      statusCode: 201,
      message: "Coupon redeemed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get My Redemptions
export const getMyRedemptionsController = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await redemptionService.getCustomerRedemptions(
        req.user.id
      );

    appSuccess(res, {
      message: "Redemptions fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Redemptions
export const getAllRedemptionsController = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await redemptionService.getRedemptions();

    appSuccess(res, {
      message: "All redemptions fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Revert Redemption
export const revertRedemptionController = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await redemptionService.revertRedemption({
        id: req.params.id,
        adminId: req.user.id,
      });

    appSuccess(res, {
      message: "Redemption reverted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};