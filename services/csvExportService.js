import Coupon from "../models/couponModel.js";
import { Parser } from "json2csv";

export const exportCoupons = async () => {

  const coupons = await Coupon.find({
    isDeleted: false,
  }).populate("createdBy", "name email");

  const data = coupons.map((coupon) => ({
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    maxDiscount: coupon.maxDiscount,
    usageLimit: coupon.usageLimit,
    usedCount: coupon.usedCount,
    perCustomerLimit: coupon.perCustomerLimit,
    startDate: coupon.startDate,
    expiryDate: coupon.expiryDate,
    status: coupon.status,
    totalRedemptions: coupon.totalRedemptions,
    totalDiscountGiven: coupon.totalDiscountGiven,
    createdBy: coupon.createdBy?.email || "",
    createdAt: coupon.createdAt,
  }));

  const parser = new Parser();

  return parser.parse(data);
};