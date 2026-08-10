import csv from "csv-parser";
import { Readable } from "stream";

import Coupon from "../models/couponModel.js";
import ImportJob from "../models/importJobModel.js";

export const importCoupons = async (file, userId) => {
  if (!file) {
    throw new Error("CSV file is required");
  }

  const rows = [];

  const stream = Readable.from(file.buffer);

  return new Promise((resolve, reject) => {
    stream
      .pipe(csv())
      .on("data", (row) => {
        rows.push(row);
      })
      .on("end", async () => {
        try {
          let imported = 0;
          let failed = 0;
          const errors = [];

          const importJob = await ImportJob.create({
            fileName: file.originalname,
            uploadedBy: userId,
            status: "PROCESSING",
            totalRows: rows.length,
            processedRows: 0,
            successRows: 0,
            failedRows: 0,
            startedAt: new Date(),
          });

          for (let index = 0; index < rows.length; index++) {
            const row = rows[index];

            try {
              const code = row.code?.trim().toUpperCase();

              const description =
                row.description?.trim() || "";

              const discountType =
                row.discountType?.trim().toUpperCase();

              const discountValue =
                Number(row.discountValue);

              const maxDiscount =
                row.maxDiscount?.trim()
                  ? Number(row.maxDiscount)
                  : null;

              const usageLimit =
                Number(row.usageLimit);

              const perCustomerLimit =
                Number(row.perCustomerLimit);

              const startDate =
                new Date(row.startDate);

              const expiryDate =
                new Date(row.expiryDate);

              if (!code) {
                throw new Error(
                  "Coupon code is required"
                );
              }

              if (
                !["PERCENTAGE", "FIXED"].includes(
                  discountType
                )
              ) {
                throw new Error(
                  "Discount type must be PERCENTAGE or FIXED"
                );
              }

              if (
                !Number.isFinite(discountValue) ||
                discountValue < 1
              ) {
                throw new Error(
                  "Invalid discount value"
                );
              }

              if (
                !Number.isFinite(usageLimit) ||
                usageLimit < 1
              ) {
                throw new Error(
                  "Invalid usage limit"
                );
              }

              if (
                !Number.isFinite(
                  perCustomerLimit
                ) ||
                perCustomerLimit < 1
              ) {
                throw new Error(
                  "Invalid per customer limit"
                );
              }

              if (
                perCustomerLimit > usageLimit
              ) {
                throw new Error(
                  "Per customer limit cannot exceed usage limit"
                );
              }

              if (
                Number.isNaN(startDate.getTime())
              ) {
                throw new Error(
                  "Invalid start date"
                );
              }

              if (
                Number.isNaN(expiryDate.getTime())
              ) {
                throw new Error(
                  "Invalid expiry date"
                );
              }

              if (startDate >= expiryDate) {
                throw new Error(
                  "Expiry date must be after start date"
                );
              }

              const exists = await Coupon.findOne({
                code,
                isDeleted: false,
              });

              if (exists) {
                throw new Error(
                  "Coupon already exists"
                );
              }

              await Coupon.create({
                code,
                description,
                discountType,
                discountValue,
                maxDiscount,
                usageLimit,
                perCustomerLimit,
                startDate,
                expiryDate,
                createdBy: userId,
              });

              imported++;
            } catch (error) {
              failed++;

              errors.push({
                row: index + 2,
                code: row.code || "",
                reason: error.message,
              });
            }

            await ImportJob.findByIdAndUpdate(
              importJob._id,
              {
                processedRows: index + 1,
                successRows: imported,
                failedRows: failed,
              }
            );
          }

          const finalStatus =
            failed === rows.length
              ? "FAILED"
              : "COMPLETED";

          await ImportJob.findByIdAndUpdate(
            importJob._id,
            {
              status: finalStatus,
              processedRows: rows.length,
              successRows: imported,
              failedRows: failed,
              ValidationErrors: errors.map(
                (error) => ({
                  row: error.row,
                  reason: error.reason,
                })
              ),
              completedAt: new Date(),
            }
          );

          resolve({
            importJobId: importJob._id,
            totalRows: rows.length,
            imported,
            failed,
            errors,
          });
        } catch (error) {
          reject(error);
        }
      })
      .on("error", reject);
  });
};

export const getImportJobs = async () => {
  return ImportJob.find()
    .populate(
      "uploadedBy",
      "name email role"
    )
    .sort({
      createdAt: -1,
    });
};