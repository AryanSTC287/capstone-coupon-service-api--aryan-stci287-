import mongoose from "mongoose";

import Coupon from "../models/couponModel.js";
import Redemption from "../models/redemptionModel.js";
import User from "../models/userModel.js";

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

  if (
    !couponCode ||
    !couponCode.trim()
  ) {
    throw new AppError(
      "Coupon code is required",
      400
    );
  }

  if (
    !orderId ||
    !orderId.trim()
  ) {
    throw new AppError(
      "Order ID is required",
      400
    );
  }

  if (
    !idempotencyKey ||
    !idempotencyKey.trim()
  ) {
    throw new AppError(
      "Idempotency key is required",
      400
    );
  }

  if (!customerId) {
    throw new AppError(
      "Customer ID is required",
      400
    );
  }

  const normalizedOrderAmount =
    Number(orderAmount);

  if (
    Number.isNaN(normalizedOrderAmount) ||
    normalizedOrderAmount < 0
  ) {
    throw new AppError(
      "Order amount cannot be negative",
      400
    );
  }

  if (normalizedOrderAmount <= 0) {
    throw new AppError(
      "Order amount must be greater than 0",
      400
    );
  }

  const normalizedCouponCode =
    couponCode.trim().toUpperCase();

  const normalizedOrderId =
    orderId.trim();

  const normalizedIdempotencyKey =
    idempotencyKey.trim();

  const session =
    await mongoose.startSession();

  try {
    let redemption;

    await session.withTransaction(
      async () => {
        /*
         * Gate 3A:
         * Idempotency
         */
        const existingRedemption =
          await Redemption.findOne({
            idempotencyKey:
              normalizedIdempotencyKey,
          }).session(session);

        if (existingRedemption) {
          redemption =
            existingRedemption;

          return;
        }

        /*
         * Find Coupon
         */
        const coupon =
          await Coupon.findOne({
            code: normalizedCouponCode,
            isDeleted: false,
          }).session(session);

        if (!coupon) {
          throw new AppError(
            "Coupon not found",
            404
          );
        }

        /*
         * Coupon Status
         */
        if (
          coupon.status !==
          COUPON_STATUS.ACTIVE
        ) {
          throw new AppError(
            "Coupon is inactive",
            400
          );
        }

        const currentDate =
          new Date();

        /*
         * Start Date
         */
        if (
          currentDate <
          coupon.startDate
        ) {
          throw new AppError(
            "Coupon is not active yet",
            400
          );
        }

        /*
         * Expiry
         */
        if (
          currentDate >
          coupon.expiryDate
        ) {
          throw new AppError(
            "Coupon has expired",
            400
          );
        }

        /*
         * Lock Customer Document
         */
        const customer =
          await User.findOneAndUpdate(
            {
              _id: customerId,
              status: "ACTIVE",
            },
            {
              $set: {
                updatedAt:
                  new Date(),
              },
            },
            {
              new: true,
              session,
            }
          );

        if (!customer) {
          throw new AppError(
            "Customer not found or inactive",
            404
          );
        }

        /*
         * Gate 2:
         * Per Customer Limit
         */
        const customerRedemptions =
          await Redemption.countDocuments({
            coupon: coupon._id,
            customer: customerId,
            status:
              REDEMPTION_STATUS.SUCCESS,
          }).session(session);

        if (
          customerRedemptions >=
          coupon.perCustomerLimit
        ) {
          throw new AppError(
            "Customer redemption limit exceeded",
            400
          );
        }

        /*
         * Gate 3B:
         * Global Order ID Idempotency
         *
         * Order ID belongs to the order,
         * not to the coupon.
         *
         * The same order cannot use
         * another coupon after it has
         * already been redeemed.
         */
        const existingOrderRedemption =
          await Redemption.findOne({
            orderId:
              normalizedOrderId,
          }).session(session);

        if (existingOrderRedemption) {
          throw new AppError(
            "This order has already been redeemed",
            409
          );
        }

        /*
         * Calculate Discount
         */
        let discountAmount =
          Number(
            coupon.discountValue
          );

        if (
          coupon.discountType ===
          DISCOUNT_TYPE.PERCENTAGE
        ) {
          discountAmount =
            (normalizedOrderAmount *
              Number(
                coupon.discountValue
              )) /
            100;

          if (
            coupon.maxDiscount !==
              null &&
            coupon.maxDiscount !==
              undefined &&
            discountAmount >
              Number(
                coupon.maxDiscount
              )
          ) {
            discountAmount =
              Number(
                coupon.maxDiscount
              );
          }
        }

        discountAmount =
          Math.max(
            0,
            Number(discountAmount)
          );

        /*
         * Gate 1:
         * Global Usage Limit
         *
         * Atomic update guarantees
         * usedCount never exceeds
         * usageLimit.
         */
        const updatedCoupon =
          await Coupon.findOneAndUpdate(
            {
              _id: coupon._id,
              isDeleted: false,
              status:
                COUPON_STATUS.ACTIVE,

              $expr: {
                $lt: [
                  "$usedCount",
                  "$usageLimit",
                ],
              },
            },
            {
              $inc: {
                usedCount: 1,
                totalRedemptions: 1,
                totalDiscountGiven:
                  discountAmount,
              },
            },
            {
              new: true,
              session,
            }
          );

        if (!updatedCoupon) {
          throw new AppError(
            "Coupon usage limit exceeded",
            400
          );
        }

        /*
         * Create Redemption
         */
        const createdRedemptions =
          await Redemption.create(
            [
              {
                coupon:
                  coupon._id,

                customer:
                  customerId,

                orderId:
                  normalizedOrderId,

                orderAmount:
                  normalizedOrderAmount,

                idempotencyKey:
                  normalizedIdempotencyKey,

                discountAmount,

                status:
                  REDEMPTION_STATUS.SUCCESS,
              },
            ],
            {
              session,
            }
          );

        redemption =
          createdRedemptions[0];
      }
    );

    /*
     * Populate Response
     */
    await redemption.populate(
      "coupon"
    );

    await redemption.populate(
      "customer",
      "name email"
    );

    return redemption;
  } catch (error) {
    /*
     * MongoDB Duplicate Key Protection
     */
    if (error?.code === 11000) {
      const duplicateFields =
        error?.keyPattern || {};

      /*
       * Idempotency Key Duplicate
       */
      if (
        duplicateFields.idempotencyKey
      ) {
        const existingRedemption =
          await Redemption.findOne({
            idempotencyKey:
              normalizedIdempotencyKey,
          })
            .populate("coupon")
            .populate(
              "customer",
              "name email"
            );

        if (existingRedemption) {
          return existingRedemption;
        }

        throw new AppError(
          "Duplicate redemption request",
          409
        );
      }

      /*
       * Order ID Duplicate
       */
      if (
        duplicateFields.orderId
      ) {
        throw new AppError(
          "This order has already been redeemed",
          409
        );
      }

      throw new AppError(
        "Duplicate redemption request",
        409
      );
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

/**
 * Get Customer Redemptions
 */
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

/**
 * Get All Redemptions
 */
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

/**
 * Revert Redemption
 */
export const revertRedemption =
  async ({
    id,
    adminId,
  }) => {
    const session =
      await mongoose.startSession();

    try {
      let redemption;

      await session.withTransaction(
        async () => {
          redemption =
            await Redemption.findById(
              id
            ).session(session);

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

          const coupon =
            await Coupon.findById(
              redemption.coupon
            ).session(session);

          if (!coupon) {
            throw new AppError(
              "Coupon not found",
              404
            );
          }

          /*
           * Mark Redemption Reverted
           */
          redemption.status =
            REDEMPTION_STATUS.REVERTED;

          redemption.revertedBy =
            adminId;

          redemption.revertedAt =
            new Date();

          await redemption.save({
            session,
          });

          /*
           * Decrease Coupon Counters
           */
          const updatedCoupon =
            await Coupon.findOneAndUpdate(
              {
                _id: coupon._id,

                $expr: {
                  $and: [
                    {
                      $gt: [
                        "$usedCount",
                        0,
                      ],
                    },
                    {
                      $gt: [
                        "$totalRedemptions",
                        0,
                      ],
                    },
                    {
                      $gte: [
                        "$totalDiscountGiven",
                        redemption.discountAmount,
                      ],
                    },
                  ],
                },
              },
              {
                $inc: {
                  usedCount: -1,
                  totalRedemptions: -1,
                  totalDiscountGiven:
                    -redemption.discountAmount,
                },
              },
              {
                new: true,
                session,
              }
            );

          if (!updatedCoupon) {
            throw new AppError(
              "Unable to update coupon counters",
              400
            );
          }
        }
      );

      await redemption.populate(
        "coupon"
      );

      await redemption.populate(
        "customer",
        "name email"
      );

      return redemption;
    } finally {
      await session.endSession();
    }
  };