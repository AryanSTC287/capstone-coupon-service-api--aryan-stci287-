import cron from "node-cron";
import Coupon from "../models/couponModel.js";
import { COUPON_STATUS } from "../config/constants.js";

export const initializeCrons = () => {
  console.log("✅ Cron Jobs Initialized");

  // Auto Expire Coupons
  cron.schedule("* * * * *", async () => {
    try {
      const result = await Coupon.updateMany(
        {
          status: COUPON_STATUS.ACTIVE,
          isDeleted: false,
          expiryDate: {
            $lt: new Date(),
          },
        },
        {
          $set: {
            status: COUPON_STATUS.EXPIRED,
          },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(
          `✅ ${result.modifiedCount} coupon(s) expired automatically`
        );
      }
    } catch (error) {
      console.error(
        "❌ Coupon Expiry Cron Error:",
        error.message
      );
    }
  });

 // Hourly Cron
  cron.schedule("0 * * * *", async () => {
    console.log("🕐 Hourly Cron Executed");
  });

  // Daily Cron
  cron.schedule("0 0 * * *", async () => {
    console.log("📅 Daily Cron Executed");
  });
};