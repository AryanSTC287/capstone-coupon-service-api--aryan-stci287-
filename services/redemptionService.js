import Coupon from "../models/couponModel.js";
import Redemption from "../models/redemptionModel.js";
import AppError from "../middlewares/appError.js";

import {
  REDEMPTION_STATUS,
  COUPON_STATUS,
  DISCOUNT_TYPE,
} from "../config/constants.js";


/**
 * Redeem Coupon
 */
export const redeemCoupon = async (payload) => {
  const {
    couponCode,
    customerId,
    orderId,
    idempotencyKey,
    orderAmount = 0,
  } = payload;


  // Check duplicate request
  const existingRedemption =
    await Redemption.findOne({
      idempotencyKey,
    });

  if (existingRedemption) {
    return existingRedemption;
  }


  // Find Coupon
  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    isDeleted: false,
  });


  if (!coupon) {
    throw new AppError(
      "Coupon not found",
      404
    );
  }


  // Coupon status check
  if (
    coupon.status !== COUPON_STATUS.ACTIVE
  ) {
    throw new AppError(
      "Coupon is inactive",
      400
    );
  }


  const currentDate = new Date();


  if (
    currentDate < coupon.startDate
  ) {
    throw new AppError(
      "Coupon is not active yet",
      400
    );
  }


  if (
    currentDate > coupon.expiryDate
  ) {
    throw new AppError(
      "Coupon has expired",
      400
    );
  }


  // Usage limit check
  if (
    coupon.usedCount >= coupon.usageLimit
  ) {
    throw new AppError(
      "Coupon usage limit exceeded",
      400
    );
  }


  // Customer limit check
  const customerRedemptions =
    await Redemption.countDocuments({
      coupon: coupon._id,
      customer: customerId,
      status: REDEMPTION_STATUS.SUCCESS,
    });


  if (
    customerRedemptions >=
    coupon.perCustomerLimit
  ) {
    throw new AppError(
      "Customer redemption limit exceeded",
      400
    );
  }


  // Calculate Discount
  let discountAmount =
    coupon.discountValue;


  if (
    coupon.discountType ===
    DISCOUNT_TYPE.PERCENTAGE
  ) {

    discountAmount =
      (orderAmount *
        coupon.discountValue) /
      100;


    if (
      coupon.maxDiscount &&
      discountAmount > coupon.maxDiscount
    ) {
      discountAmount =
        coupon.maxDiscount;
    }
  }



  // Update coupon counters
  coupon.usedCount += 1;

  coupon.totalRedemptions += 1;

  coupon.totalDiscountGiven +=
    discountAmount;


  await coupon.save();



  // Create redemption
  const redemption =
    await Redemption.create({

      coupon: coupon._id,

      customer: customerId,

      orderId,

      idempotencyKey,

      discountAmount,

      status:
        REDEMPTION_STATUS.SUCCESS,
    });


  return redemption;
};



// Get Customer Redemptions
export const getCustomerRedemptions =
  async (customerId) => {

    return Redemption.find({
      customer: customerId,
    })
      .populate("coupon")
      .sort({
        createdAt: -1,
      });
  };



// All Redemptions
export const getRedemptions =
  async () => {

    return Redemption.find()
      .populate("coupon")
      .populate(
        "customer",
        "name email"
      )
      .sort({
        createdAt: -1,
      });
  };



// Revert Redemption
export const revertRedemption =
  async ({
    id,
    adminId,
  }) => {


    const redemption =
      await Redemption.findById(id)
        .populate("coupon");


    if (!redemption) {
      throw new AppError(
        "Redemption not found",
        404
      );
    }



    if (
      redemption.status ===
      REDEMPTION_STATUS.REVERTED
    ) {

      throw new AppError(
        "Already reverted",
        400
      );
    }



    redemption.status =
      REDEMPTION_STATUS.REVERTED;


    redemption.revertedBy =
      adminId;


    redemption.revertedAt =
      new Date();



    await redemption.save();



    const coupon =
      redemption.coupon;


    coupon.usedCount -= 1;

    coupon.totalRedemptions -= 1;

    coupon.totalDiscountGiven -=
      redemption.discountAmount;



    await coupon.save();



    return redemption;
};