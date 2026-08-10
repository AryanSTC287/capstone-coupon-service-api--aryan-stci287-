import csv from "csv-parser";
import { Readable } from "stream";

import Coupon from "../models/couponModel.js";
import ImportJob from "../models/importJobModel.js";

export const importCoupons = async (file, userId) => {
  if (!file) {
    throw new Error("CSV file is required");
  }

  if (!userId) {
    throw new Error("User id is required");
  }

  const importJob = await ImportJob.create({
    fileName: file.originalname,
    uploadedBy: userId,
    status: "PROCESSING",
    startedAt: new Date(),
  });

  const rows = [];

  const stream = Readable.from(file.buffer);

  return new Promise((resolve, reject) => {
    stream
      .pipe(csv())
      .on("data", (row) => {
        rows.push(row);
      })
      .on("end", async () => {
        let imported = 0;
        let failed = 0;
        const errors = [];

        await ImportJob.findByIdAndUpdate(importJob._id, {
          totalRows: rows.length,
        });

        for (let index = 0; index < rows.length; index++) {
          const row = rows[index];

          try {
            if (!row.code) {
              throw new Error("Coupon code is required");
            }

            const code = row.code.trim().toUpperCase();

            const exists = await Coupon.findOne({
              code,
              isDeleted: false,
            });

            if (exists) {
              failed++;

              errors.push({
                row: index + 1,
                reason: "Coupon already exists",
              });

              await ImportJob.findByIdAndUpdate(importJob._id, {
                processedRows: index + 1,
                failedRows: failed,
              });

              continue;
            }

            await Coupon.create({
              code,
              description: row.description || "",
              discountType: row.discountType
                ?.trim()
                .toUpperCase(),
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

            await ImportJob.findByIdAndUpdate(importJob._id, {
              processedRows: index + 1,
              successRows: imported,
            });
          } catch (error) {
            failed++;

            errors.push({
              row: index + 1,
              reason: error.message,
            });

            await ImportJob.findByIdAndUpdate(importJob._id, {
              processedRows: index + 1,
              failedRows: failed,
            });
          }
        }

        const finalStatus =
          failed === rows.length && rows.length > 0
            ? "FAILED"
            : "COMPLETED";

        const updatedImportJob =
          await ImportJob.findByIdAndUpdate(
            importJob._id,
            {
              status: finalStatus,
              totalRows: rows.length,
              processedRows: rows.length,
              successRows: imported,
              failedRows: failed,
              validationErrors: errors,
              completedAt: new Date(),
            },
            { new: true }
          );

        resolve({
          importJobId: updatedImportJob._id,
          totalRows: rows.length,
          imported,
          failed,
          errors,
        });
      })
      .on("error", async (error) => {
        await ImportJob.findByIdAndUpdate(importJob._id, {
          status: "FAILED",
          completedAt: new Date(),
          validationErrors: [
            {
              row: 0,
              reason: error.message,
            },
          ],
        });

        reject(error);
      });
  });
};