import csv from "csv-parser";
import fs from "fs";

import Coupon from "../models/couponModel.js";
import ImportJob from "../models/importJobModel.js";
import { IMPORT_STATUS } from "../config/constants.js";

export const importCoupons = async (file, adminId) => {
  const job = await ImportJob.create({
    fileName: file.originalname,
    uploadedBy: adminId,
    status: IMPORT_STATUS.PROCESSING,
  });

  return new Promise((resolve, reject) => {
    const coupons = [];

    fs.createReadStream(file.path)
      .pipe(csv())
      .on("data", (row) => {
        coupons.push(row);
      })
      .on("end", async () => {
        try {
          job.totalRows = coupons.length;

          let processedRows = 0;
          let successRows = 0;
          let failedRows = 0;

          const errors = [];

          for (let i = 0; i < coupons.length; i++) {
            const row = coupons[i];

            processedRows++;

            try {
              if (!row.code) {
                failedRows++;

                errors.push({
                  row: i + 1,
                  reason: "Coupon code is missing",
                });

                continue;
              }

              const exists = await Coupon.findOne({
                code: row.code.toUpperCase(),
                isDeleted: false,
              });

              if (exists) {
                failedRows++;

                errors.push({
                  row: i + 1,
                  reason: "Coupon already exists",
                });

                continue;
              }

              await Coupon.create({
                code: row.code.toUpperCase(),
                description: row.description || "",
                discountType: row.discountType,
                discountValue: Number(row.discountValue),
                maxDiscount: row.maxDiscount
                  ? Number(row.maxDiscount)
                  : null,
                usageLimit: Number(row.usageLimit),
                perCustomerLimit: Number(row.perCustomerLimit),
                startDate: new Date(row.startDate),
                expiryDate: new Date(row.expiryDate),
                createdBy: adminId,
              });

              successRows++;
            } catch (err) {
              failedRows++;

              errors.push({
                row: i + 1,
                reason: err.message,
              });
            }
          }

          job.processedRows = processedRows;
          job.successRows = successRows;
          job.failedRows = failedRows;
          job.errors = errors;
          job.completedAt = new Date();
          job.status = IMPORT_STATUS.COMPLETED;

          await job.save();

          // Delete uploaded file after processing
          fs.unlink(file.path, () => {});

          resolve(job);
        } catch (err) {
          job.status = IMPORT_STATUS.FAILED;
          job.completedAt = new Date();

          await job.save();

          fs.unlink(file.path, () => {});

          reject(err);
        }
      })
      .on("error", async (err) => {
        job.status = IMPORT_STATUS.FAILED;
        job.completedAt = new Date();

        await job.save();

        fs.unlink(file.path, () => {});

        reject(err);
      });
  });
};

export const getImportJobs = async () => {
  return await ImportJob.find()
    .populate("uploadedBy", "name email")
    .sort({ createdAt: -1 });
};