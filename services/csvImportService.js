import csv from "csv-parser";
import { Readable } from "stream";

import Coupon from "../models/couponModel.js";

export const importCoupons = async (
  file,
  userId
) => {
  const rows = [];

  const stream = Readable.from(file.buffer);

  return new Promise((resolve, reject) => {
    stream
      .pipe(csv())
      .on("data", (row) => {
    console.log(row);
    rows.push(row);
})
      .on("end", async () => {
        let imported = 0;
        let failed = 0;
        const errors = [];

        for (const row of rows) {
          try {
            const exists = await Coupon.findOne({
              code: row.code.trim().toUpperCase(),
              isDeleted: false,
            });

            if (exists) {
              failed++;

              errors.push({
                code: row.code,
                reason: "Coupon already exists",
              });

              continue;
            }

            await Coupon.create({
              code: row.code.trim().toUpperCase(),
              description: row.description,
              discountType: row.discountType.trim().toUpperCase(),
              discountValue: Number(row.discountValue),
              maxDiscount: row.maxDiscount
                ? Number(row.maxDiscount)
                : null,
              usageLimit: Number(row.usageLimit),
              perCustomerLimit: Number(
                row.perCustomerLimit
              ),
              startDate: new Date(row.startDate),
              expiryDate: new Date(row.expiryDate),
              createdBy: userId,
            });

            imported++;
          } catch (err) {
            failed++;

            errors.push({
              code: row.code,
              reason: err.message,
            });
          }
        }

        resolve({
          totalRows: rows.length,
          imported,
          failed,
          errors,
        });
      })
      .on("error", reject);
  });
};