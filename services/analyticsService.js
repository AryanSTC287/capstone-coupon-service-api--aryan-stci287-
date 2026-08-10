import Coupon from "../models/couponModel.js";
import Redemption from "../models/redemptionModel.js";
import User from "../models/userModel.js";
import {
  REDEMPTION_STATUS,
} from "../config/constants.js";

export const getDashboardAnalytics = async () => {
  const [

    totalCoupons,

    activeCoupons,

    totalRedemptions,

    totalDiscountGiven,

    totalCustomers,

    newCustomers,

    returningCustomers,

    topCustomer,

  ] = await Promise.all([

    Coupon.countDocuments({
      isDeleted: false,
    }),

    Coupon.countDocuments({
      status: "ACTIVE",
      isDeleted: false,
    }),

    Redemption.countDocuments({
      status: REDEMPTION_STATUS.SUCCESS,
    }),

    Coupon.aggregate([
      {
        $group: {
          _id: null,
          total: {
            $sum: "$totalDiscountGiven",
          },
        },
      },
    ]),

    User.countDocuments({
      role: "CUSTOMER",
      status: "ACTIVE",
    }),

    User.countDocuments({
      role: "CUSTOMER",
      status: "ACTIVE",
      createdAt: {
        $gte: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ),
      },
    }),

    Redemption.aggregate([
      {
        $match: {
          status: REDEMPTION_STATUS.SUCCESS,
        },
      },

      {
        $group: {
          _id: "$customer",
          redemptionCount: {
            $sum: 1,
          },
        },
      },

      {
        $match: {
          redemptionCount: {
            $gt: 1,
          },
        },
      },

      {
        $count: "count",
      },
    ]),

    Redemption.aggregate([
      {
        $match: {
          status: REDEMPTION_STATUS.SUCCESS,
        },
      },

      {
        $group: {
          _id: "$customer",
          redemptionCount: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          redemptionCount: -1,
        },
      },

      {
        $limit: 1,
      },

      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "customer",
        },
      },

      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 0,
          name: "$customer.name",
          email: "$customer.email",
          redemptionCount: 1,
        },
      },
    ]),
  ]);

  return {
    totalCoupons,

    activeCoupons,

    totalRedemptions,

    totalCustomers,

    totalDiscountGiven:
      totalDiscountGiven.length > 0
        ? totalDiscountGiven[0].total
        : 0,

    userInsights: {
      newCustomers,

      returningCustomers:
        returningCustomers.length > 0
          ? returningCustomers[0].count
          : 0,

      topCustomer:
        topCustomer.length > 0
          ? {
              name:
                topCustomer[0].name ||
                "Unknown",

              email:
                topCustomer[0].email ||
                "-",

              redemptionCount:
                topCustomer[0].redemptionCount,
            }
          : null,
    },
  };
};

export const couponAnalytics = async () => {
  return Coupon.find(
    {
      isDeleted: false,
    },
    {
      code: 1,
      usedCount: 1,
      usageLimit: 1,
      totalDiscountGiven: 1,
      totalRedemptions: 1,
    }
  );
};