import { jest } from "@jest/globals";

const mockCouponFindOne = jest.fn();
const mockCouponCreate = jest.fn();

const mockImportJobCreate = jest.fn();
const mockImportJobFindByIdAndUpdate = jest.fn();
const mockImportJobFind = jest.fn();

jest.unstable_mockModule("../../models/couponModel.js", () => ({
  default: {
    findOne: mockCouponFindOne,
    create: mockCouponCreate,
  },
}));

jest.unstable_mockModule(
  "../../models/importJobModel.js",
  () => ({
    default: {
      create: mockImportJobCreate,
      findByIdAndUpdate:
        mockImportJobFindByIdAndUpdate,
      find: mockImportJobFind,
    },
  })
);

const {
  importCoupons,
  getImportJobs,
} = await import(
  "../../services/importService.js"
);

describe("importService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockImportJobCreate.mockResolvedValue({
      _id: "import-job-123",
    });

    mockImportJobFindByIdAndUpdate.mockResolvedValue(
      {}
    );

    mockCouponFindOne.mockResolvedValue(null);

    mockCouponCreate.mockResolvedValue({
      _id: "coupon-123",
    });
  });

  describe("importCoupons", () => {
    it("should throw an error when CSV file is missing", async () => {
      await expect(
        importCoupons(null, "user-123")
      ).rejects.toThrow(
        "CSV file is required"
      );

      expect(
        mockImportJobCreate
      ).not.toHaveBeenCalled();

      expect(
        mockCouponCreate
      ).not.toHaveBeenCalled();
    });

    it("should import a valid CSV successfully", async () => {
      const csvData = [
        "code,description,discountType,discountValue,maxDiscount,usageLimit,perCustomerLimit,startDate,expiryDate",
        "SAVE10,Ten percent off,PERCENTAGE,10,100,10,2,2026-01-01,2026-12-31",
      ].join("\n");

      const file = {
        originalname: "coupons.csv",
        buffer: Buffer.from(csvData),
      };

      const result = await importCoupons(
        file,
        "user-123"
      );

      expect(
        mockImportJobCreate
      ).toHaveBeenCalledTimes(1);

      expect(
        mockImportJobCreate
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          fileName: "coupons.csv",
          uploadedBy: "user-123",
          status: "PROCESSING",
          totalRows: 1,
          processedRows: 0,
          successRows: 0,
          failedRows: 0,
        })
      );

      expect(
        mockCouponFindOne
      ).toHaveBeenCalledWith({
        code: "SAVE10",
        isDeleted: false,
      });

      expect(
        mockCouponCreate
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "SAVE10",
          description: "Ten percent off",
          discountType: "PERCENTAGE",
          discountValue: 10,
          maxDiscount: 100,
          usageLimit: 10,
          perCustomerLimit: 2,
          createdBy: "user-123",
        })
      );

      expect(
        mockImportJobFindByIdAndUpdate
      ).toHaveBeenCalled();

      expect(result).toEqual({
        importJobId: "import-job-123",
        totalRows: 1,
        imported: 1,
        failed: 0,
        errors: [],
      });
    });

    it("should convert coupon code and discount type to uppercase", async () => {
      const csvData = [
        "code,description,discountType,discountValue,maxDiscount,usageLimit,perCustomerLimit,startDate,expiryDate",
        " save20 ,Twenty off,fixed,20,,20,5,2026-01-01,2026-12-31",
      ].join("\n");

      const file = {
        originalname: "coupons.csv",
        buffer: Buffer.from(csvData),
      };

      await importCoupons(
        file,
        "user-123"
      );

      expect(
        mockCouponFindOne
      ).toHaveBeenCalledWith({
        code: "SAVE20",
        isDeleted: false,
      });

      expect(
        mockCouponCreate
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "SAVE20",
          discountType: "FIXED",
          maxDiscount: null,
        })
      );
    });

    it("should fail when coupon code is missing", async () => {
      const csvData = [
        "code,description,discountType,discountValue,maxDiscount,usageLimit,perCustomerLimit,startDate,expiryDate",
        ",No code,PERCENTAGE,10,100,10,2,2026-01-01,2026-12-31",
      ].join("\n");

      const file = {
        originalname: "invalid.csv",
        buffer: Buffer.from(csvData),
      };

      const result = await importCoupons(
        file,
        "user-123"
      );

      expect(result.imported).toBe(0);
      expect(result.failed).toBe(1);

      expect(result.errors).toEqual([
        {
          row: 2,
          code: "",
          reason: "Coupon code is required",
        },
      ]);

      expect(
        mockCouponCreate
      ).not.toHaveBeenCalled();
    });

    it("should fail when discount type is invalid", async () => {
      const csvData = [
        "code,description,discountType,discountValue,maxDiscount,usageLimit,perCustomerLimit,startDate,expiryDate",
        "BADTYPE,Invalid type,INVALID,10,100,10,2,2026-01-01,2026-12-31",
      ].join("\n");

      const file = {
        originalname: "invalid.csv",
        buffer: Buffer.from(csvData),
      };

      const result = await importCoupons(
        file,
        "user-123"
      );

      expect(result.imported).toBe(0);
      expect(result.failed).toBe(1);

      expect(result.errors[0]).toEqual({
        row: 2,
        code: "BADTYPE",
        reason:
          "Discount type must be PERCENTAGE or FIXED",
      });

      expect(
        mockCouponCreate
      ).not.toHaveBeenCalled();
    });

    it("should fail when discount value is invalid", async () => {
      const csvData = [
        "code,description,discountType,discountValue,maxDiscount,usageLimit,perCustomerLimit,startDate,expiryDate",
        "BADVALUE,Invalid value,PERCENTAGE,0,100,10,2,2026-01-01,2026-12-31",
      ].join("\n");

      const file = {
        originalname: "invalid.csv",
        buffer: Buffer.from(csvData),
      };

      const result = await importCoupons(
        file,
        "user-123"
      );

      expect(result.imported).toBe(0);
      expect(result.failed).toBe(1);

      expect(result.errors[0].reason).toBe(
        "Invalid discount value"
      );
    });

    it("should fail when usage limit is invalid", async () => {
      const csvData = [
        "code,description,discountType,discountValue,maxDiscount,usageLimit,perCustomerLimit,startDate,expiryDate",
        "BADLIMIT,Invalid usage,PERCENTAGE,10,100,0,2,2026-01-01,2026-12-31",
      ].join("\n");

      const file = {
        originalname: "invalid.csv",
        buffer: Buffer.from(csvData),
      };

      const result = await importCoupons(
        file,
        "user-123"
      );

      expect(result.imported).toBe(0);
      expect(result.failed).toBe(1);

      expect(result.errors[0].reason).toBe(
        "Invalid usage limit"
      );
    });

    it("should fail when per customer limit is invalid", async () => {
      const csvData = [
        "code,description,discountType,discountValue,maxDiscount,usageLimit,perCustomerLimit,startDate,expiryDate",
        "BADCUSTOMER,Invalid customer limit,PERCENTAGE,10,100,10,0,2026-01-01,2026-12-31",
      ].join("\n");

      const file = {
        originalname: "invalid.csv",
        buffer: Buffer.from(csvData),
      };

      const result = await importCoupons(
        file,
        "user-123"
      );

      expect(result.imported).toBe(0);
      expect(result.failed).toBe(1);

      expect(result.errors[0].reason).toBe(
        "Invalid per customer limit"
      );
    });

    it("should fail when per customer limit exceeds usage limit", async () => {
      const csvData = [
        "code,description,discountType,discountValue,maxDiscount,usageLimit,perCustomerLimit,startDate,expiryDate",
        "BADRELATION,Invalid relation,PERCENTAGE,10,100,5,10,2026-01-01,2026-12-31",
      ].join("\n");

      const file = {
        originalname: "invalid.csv",
        buffer: Buffer.from(csvData),
      };

      const result = await importCoupons(
        file,
        "user-123"
      );

      expect(result.imported).toBe(0);
      expect(result.failed).toBe(1);

      expect(result.errors[0].reason).toBe(
        "Per customer limit cannot exceed usage limit"
      );
    });

    it("should fail when start date is invalid", async () => {
      const csvData = [
        "code,description,discountType,discountValue,maxDiscount,usageLimit,perCustomerLimit,startDate,expiryDate",
        "BADSTART,Invalid start,PERCENTAGE,10,100,10,2,invalid-date,2026-12-31",
      ].join("\n");

      const file = {
        originalname: "invalid.csv",
        buffer: Buffer.from(csvData),
      };

      const result = await importCoupons(
        file,
        "user-123"
      );

      expect(result.imported).toBe(0);
      expect(result.failed).toBe(1);

      expect(result.errors[0].reason).toBe(
        "Invalid start date"
      );
    });

    it("should fail when expiry date is invalid", async () => {
      const csvData = [
        "code,description,discountType,discountValue,maxDiscount,usageLimit,perCustomerLimit,startDate,expiryDate",
        "BADEXPIRY,Invalid expiry,PERCENTAGE,10,100,10,2,2026-01-01,invalid-date",
      ].join("\n");

      const file = {
        originalname: "invalid.csv",
        buffer: Buffer.from(csvData),
      };

      const result = await importCoupons(
        file,
        "user-123"
      );

      expect(result.imported).toBe(0);
      expect(result.failed).toBe(1);

      expect(result.errors[0].reason).toBe(
        "Invalid expiry date"
      );
    });

    it("should fail when expiry date is before start date", async () => {
      const csvData = [
        "code,description,discountType,discountValue,maxDiscount,usageLimit,perCustomerLimit,startDate,expiryDate",
        "BADDATE,Invalid dates,PERCENTAGE,10,100,10,2,2026-12-31,2026-01-01",
      ].join("\n");

      const file = {
        originalname: "invalid.csv",
        buffer: Buffer.from(csvData),
      };

      const result = await importCoupons(
        file,
        "user-123"
      );

      expect(result.imported).toBe(0);
      expect(result.failed).toBe(1);

      expect(result.errors[0].reason).toBe(
        "Expiry date must be after start date"
      );
    });

    it("should fail when coupon already exists", async () => {
      mockCouponFindOne.mockResolvedValue({
        _id: "existing-coupon",
        code: "EXISTING",
      });

      const csvData = [
        "code,description,discountType,discountValue,maxDiscount,usageLimit,perCustomerLimit,startDate,expiryDate",
        "existing,Already exists,PERCENTAGE,10,100,10,2,2026-01-01,2026-12-31",
      ].join("\n");

      const file = {
        originalname: "duplicate.csv",
        buffer: Buffer.from(csvData),
      };

      const result = await importCoupons(
        file,
        "user-123"
      );

      expect(result.imported).toBe(0);
      expect(result.failed).toBe(1);

      expect(result.errors).toEqual([
        {
          row: 2,
          code: "existing",
          reason: "Coupon already exists",
        },
      ]);

      expect(
        mockCouponCreate
      ).not.toHaveBeenCalled();
    });

    it("should continue processing when one row fails", async () => {
      const csvData = [
        "code,description,discountType,discountValue,maxDiscount,usageLimit,perCustomerLimit,startDate,expiryDate",
        "GOOD,Valid coupon,PERCENTAGE,10,100,10,2,2026-01-01,2026-12-31",
        ",Missing code,PERCENTAGE,20,100,10,2,2026-01-01,2026-12-31",
        "GOOD2,Another valid,FIXED,20,,20,5,2026-01-01,2026-12-31",
      ].join("\n");

      const file = {
        originalname: "mixed.csv",
        buffer: Buffer.from(csvData),
      };

      const result = await importCoupons(
        file,
        "user-123"
      );

      expect(result.totalRows).toBe(3);
      expect(result.imported).toBe(2);
      expect(result.failed).toBe(1);

      expect(result.errors).toHaveLength(1);

      expect(result.errors[0]).toEqual({
        row: 3,
        code: "",
        reason: "Coupon code is required",
      });

      expect(
        mockCouponCreate
      ).toHaveBeenCalledTimes(2);
    });

    it("should mark import job as FAILED when all rows fail", async () => {
      const csvData = [
        "code,description,discountType,discountValue,maxDiscount,usageLimit,perCustomerLimit,startDate,expiryDate",
        ",Invalid 1,PERCENTAGE,10,100,10,2,2026-01-01,2026-12-31",
        ",Invalid 2,PERCENTAGE,20,100,10,2,2026-01-01,2026-12-31",
      ].join("\n");

      const file = {
        originalname: "failed.csv",
        buffer: Buffer.from(csvData),
      };

      const result = await importCoupons(
        file,
        "user-123"
      );

      expect(result.totalRows).toBe(2);
      expect(result.imported).toBe(0);
      expect(result.failed).toBe(2);

      const finalUpdateCalls =
        mockImportJobFindByIdAndUpdate.mock.calls;

      const finalCall =
        finalUpdateCalls[
          finalUpdateCalls.length - 1
        ];

      expect(finalCall[0]).toBe(
        "import-job-123"
      );

      expect(finalCall[1]).toEqual(
        expect.objectContaining({
          status: "FAILED",
          processedRows: 2,
          successRows: 0,
          failedRows: 2,
          ValidationErrors: expect.any(Array),
        })
      );
    });

    it("should mark import job as COMPLETED when at least one row succeeds", async () => {
      const csvData = [
        "code,description,discountType,discountValue,maxDiscount,usageLimit,perCustomerLimit,startDate,expiryDate",
        "GOOD,Valid coupon,PERCENTAGE,10,100,10,2,2026-01-01,2026-12-31",
        ",Invalid coupon,PERCENTAGE,20,100,10,2,2026-01-01,2026-12-31",
      ].join("\n");

      const file = {
        originalname: "completed.csv",
        buffer: Buffer.from(csvData),
      };

      const result = await importCoupons(
        file,
        "user-123"
      );

      expect(result.imported).toBe(1);
      expect(result.failed).toBe(1);

      const calls =
        mockImportJobFindByIdAndUpdate.mock.calls;

      const finalCall =
        calls[calls.length - 1];

      expect(finalCall[1]).toEqual(
        expect.objectContaining({
          status: "COMPLETED",
          processedRows: 2,
          successRows: 1,
          failedRows: 1,
        })
      );
    });

    it("should use null when maxDiscount is empty", async () => {
      const csvData = [
        "code,description,discountType,discountValue,maxDiscount,usageLimit,perCustomerLimit,startDate,expiryDate",
        "NOMAX,No maximum,FIXED,50,,10,2,2026-01-01,2026-12-31",
      ].join("\n");

      const file = {
        originalname: "nomax.csv",
        buffer: Buffer.from(csvData),
      };

      await importCoupons(
        file,
        "user-123"
      );

      expect(
        mockCouponCreate
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          maxDiscount: null,
        })
      );
    });

    it("should reject when ImportJob.create fails", async () => {
      mockImportJobCreate.mockRejectedValue(
        new Error("Database error")
      );

      const csvData = [
        "code,description,discountType,discountValue,maxDiscount,usageLimit,perCustomerLimit,startDate,expiryDate",
        "SAVE10,Valid coupon,PERCENTAGE,10,100,10,2,2026-01-01,2026-12-31",
      ].join("\n");

      const file = {
        originalname: "database-error.csv",
        buffer: Buffer.from(csvData),
      };

      await expect(
        importCoupons(file, "user-123")
      ).rejects.toThrow("Database error");
    });
  });

  describe("getImportJobs", () => {
    it("should return all import jobs with uploadedBy populated and sorted", async () => {
      const sortMock = jest.fn();

      const expectedJobs = [
        {
          _id: "job-1",
          fileName: "coupons.csv",
        },
      ];

      sortMock.mockResolvedValue(
        expectedJobs
      );

      const populateMock = jest
        .fn()
        .mockReturnValue({
          sort: sortMock,
        });

      mockImportJobFind.mockReturnValue({
        populate: populateMock,
      });

      const result =
        await getImportJobs();

      expect(
        mockImportJobFind
      ).toHaveBeenCalledWith();

      expect(
        populateMock
      ).toHaveBeenCalledWith(
        "uploadedBy",
        "name email role"
      );

      expect(sortMock).toHaveBeenCalledWith({
        createdAt: -1,
      });

      expect(result).toEqual(
        expectedJobs
      );
    });
  });
});