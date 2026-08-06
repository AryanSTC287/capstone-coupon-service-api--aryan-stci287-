import Coupon from "../models/couponModel.js";
import Redemption from "../models/redemptionModel.js";

export const getDashboardAnalytics = async () => {
  const [
    totalCoupons,
    activeCoupons,
    totalRedemptions,
    totalDiscountGiven,
    totalUsers,
  ] = await Promise.all([
    Coupon.countDocuments({ isDeleted: false }),

    Coupon.countDocuments({
      status: "ACTIVE",
      isDeleted: false,
    }),

    Redemption.countDocuments(),

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

    Redemption.distinct("customer"),
  ]);

  return {
    totalCoupons,
    activeCoupons,
    totalRedemptions,
    totalCustomers: totalUsers.length,
    totalDiscountGiven:
      totalDiscountGiven.length > 0
        ? totalDiscountGiven[0].total
        : 0,
  };
};

export const couponAnalytics = async () => {
  return Coupon.find(
    {},
    {
      code: 1,
      usedCount: 1,
      usageLimit: 1,
      totalDiscountGiven: 1,
      totalRedemptions: 1,
    }
  );
};