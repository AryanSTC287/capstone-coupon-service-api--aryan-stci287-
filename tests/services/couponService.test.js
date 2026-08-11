import { jest } from "@jest/globals";

const mockCouponFindOne = jest.fn();
const mockCouponFind = jest.fn();
const mockCouponCreate = jest.fn();
const mockCreateAuditLog = jest.fn();

jest.unstable_mockModule(
  "../../models/couponModel.js",
  () => ({
    default: {
      findOne: mockCouponFindOne,
      find: mockCouponFind,
      create: mockCouponCreate,
    },
  })
);

jest.unstable_mockModule(
  "../../services/auditLogService.js",
  () => ({
    createAuditLog: mockCreateAuditLog,
  })
);

jest.unstable_mockModule(
  "../../middlewares/appError.js",
  () => ({
    default: class AppError extends Error {
      constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
      }
    },
  })
);

jest.unstable_mockModule(
  "../../config/constants.js",
  () => ({
    COUPON_STATUS: {
      ACTIVE: "ACTIVE",
      INACTIVE: "INACTIVE",
    },
    DISCOUNT_TYPE: {
      PERCENTAGE: "PERCENTAGE",
      FIXED: "FIXED",
    },
  })
);

const {
  createCoupon,
  getCoupons,
  getCouponById,
  getAvailableCoupons,
  getAvailableCouponById,
  updateCoupon,
  deleteCoupon,
} = await import(
  "../../services/couponService.js"
);

const {
  COUPON_STATUS,
  DISCOUNT_TYPE,
} = await import(
  "../../config/constants.js"
);

const createQuery = (result) => {
  const query = {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
  };

  query.then = (resolve, reject) =>
    Promise.resolve(result).then(
      resolve,
      reject
    );

  return query;
};

const validPayload = {
  code: "SAVE10",
  description: "Ten percent discount",
  discountType: DISCOUNT_TYPE.PERCENTAGE,
  discountValue: 10,
  maxDiscount: 100,
  usageLimit: 10,
  perCustomerLimit: 2,
  startDate: new Date("2026-08-01"),
  expiryDate: new Date("2026-12-31"),
  status: COUPON_STATUS.ACTIVE,
};

describe("couponService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createCoupon", () => {
    test("should reject when coupon code is missing", async () => {
      await expect(
        createCoupon(
          {
            ...validPayload,
            code: "",
          },
          "user-1"
        )
      ).rejects.toMatchObject({
        message: "Coupon code is required",
        statusCode: 400,
      });
    });

    test("should reject when usage limit is missing", async () => {
      const payload = {
        ...validPayload,
      };

      delete payload.usageLimit;

      await expect(
        createCoupon(payload, "user-1")
      ).rejects.toMatchObject({
        message: "Usage limit is required",
        statusCode: 400,
      });
    });

    test("should reject when usage limit is less than 1", async () => {
      await expect(
        createCoupon(
          {
            ...validPayload,
            usageLimit: 0,
          },
          "user-1"
        )
      ).rejects.toMatchObject({
        message:
          "Usage limit must be at least 1",
        statusCode: 400,
      });
    });

    test("should reject when per customer limit is missing", async () => {
      const payload = {
        ...validPayload,
      };

      delete payload.perCustomerLimit;

      await expect(
        createCoupon(payload, "user-1")
      ).rejects.toMatchObject({
        message:
          "Per customer limit is required",
        statusCode: 400,
      });
    });

    test("should reject when per customer limit exceeds usage limit", async () => {
      await expect(
        createCoupon(
          {
            ...validPayload,
            usageLimit: 2,
            perCustomerLimit: 3,
          },
          "user-1"
        )
      ).rejects.toMatchObject({
        message:
          "Per customer limit cannot exceed usage limit",
        statusCode: 400,
      });
    });

    test("should reject when discount type is missing", async () => {
      const payload = {
        ...validPayload,
      };

      delete payload.discountType;

      await expect(
        createCoupon(payload, "user-1")
      ).rejects.toMatchObject({
        message: "Discount type is required",
        statusCode: 400,
      });
    });

    test("should reject invalid discount type", async () => {
      await expect(
        createCoupon(
          {
            ...validPayload,
            discountType: "INVALID",
          },
          "user-1"
        )
      ).rejects.toMatchObject({
        message: "Invalid discount type",
        statusCode: 400,
      });
    });

    test("should reject missing discount value", async () => {
      const payload = {
        ...validPayload,
      };

      delete payload.discountValue;

      await expect(
        createCoupon(payload, "user-1")
      ).rejects.toMatchObject({
        message:
          "Discount value is required",
        statusCode: 400,
      });
    });

    test("should reject zero discount value", async () => {
      await expect(
        createCoupon(
          {
            ...validPayload,
            discountValue: 0,
          },
          "user-1"
        )
      ).rejects.toMatchObject({
        message:
          "Discount value must be greater than 0",
        statusCode: 400,
      });
    });

    test("should reject percentage discount above 100", async () => {
      await expect(
        createCoupon(
          {
            ...validPayload,
            discountValue: 101,
          },
          "user-1"
        )
      ).rejects.toMatchObject({
        message:
          "Percentage discount cannot exceed 100",
        statusCode: 400,
      });
    });

    test("should reject negative max discount", async () => {
      await expect(
        createCoupon(
          {
            ...validPayload,
            maxDiscount: -1,
          },
          "user-1"
        )
      ).rejects.toMatchObject({
        message:
          "Maximum discount cannot be negative",
        statusCode: 400,
      });
    });

    test("should reject missing start date", async () => {
      const payload = {
        ...validPayload,
      };

      delete payload.startDate;

      await expect(
        createCoupon(payload, "user-1")
      ).rejects.toMatchObject({
        message: "Start date is required",
        statusCode: 400,
      });
    });

    test("should reject missing expiry date", async () => {
      const payload = {
        ...validPayload,
      };

      delete payload.expiryDate;

      await expect(
        createCoupon(payload, "user-1")
      ).rejects.toMatchObject({
        message: "Expiry date is required",
        statusCode: 400,
      });
    });

    test("should reject invalid start date", async () => {
      await expect(
        createCoupon(
          {
            ...validPayload,
            startDate: "invalid-date",
          },
          "user-1"
        )
      ).rejects.toMatchObject({
        message: "Invalid start date",
        statusCode: 400,
      });
    });

    test("should reject invalid expiry date", async () => {
      await expect(
        createCoupon(
          {
            ...validPayload,
            expiryDate: "invalid-date",
          },
          "user-1"
        )
      ).rejects.toMatchObject({
        message: "Invalid expiry date",
        statusCode: 400,
      });
    });

    test("should reject when expiry date is before start date", async () => {
      await expect(
        createCoupon(
          {
            ...validPayload,
            startDate: new Date(
              "2026-12-31"
            ),
            expiryDate: new Date(
              "2026-08-01"
            ),
          },
          "user-1"
        )
      ).rejects.toMatchObject({
        message:
          "Expiry date must be after start date",
        statusCode: 400,
      });
    });

    test("should reject duplicate coupon", async () => {
      mockCouponFindOne.mockReturnValue(
        createQuery({
          _id: "existing-coupon",
          code: "SAVE10",
        })
      );

      await expect(
        createCoupon(
          validPayload,
          "user-1"
        )
      ).rejects.toMatchObject({
        message: "Coupon already exists",
        statusCode: 409,
      });
    });

    test("should create coupon successfully", async () => {
      mockCouponFindOne.mockReturnValue(
        createQuery(null)
      );

      const coupon = {
        _id: "coupon-1",
        code: "SAVE10",
        discountType:
          DISCOUNT_TYPE.PERCENTAGE,
        discountValue: 10,
        usageLimit: 10,
        perCustomerLimit: 2,
        maxDiscount: 100,
        createdBy: "user-1",
      };

      mockCouponCreate.mockResolvedValue(
        coupon
      );

      mockCreateAuditLog.mockResolvedValue(
        {}
      );

      const result = await createCoupon(
        {
          ...validPayload,
          code: " save10 ",
        },
        "user-1",
        "127.0.0.1"
      );

      expect(result).toBe(coupon);

      expect(
        mockCouponCreate
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "SAVE10",
          usageLimit: 10,
          perCustomerLimit: 2,
          discountValue: 10,
          maxDiscount: 100,
          createdBy: "user-1",
        })
      );

      expect(
        mockCreateAuditLog
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          user: "user-1",
          action: "CREATE_COUPON",
          entity: "COUPON",
          entityId: "coupon-1",
          description:
            "Created coupon SAVE10",
          ipAddress: "127.0.0.1",
        })
      );
    });

    test("should set maxDiscount to null when not provided", async () => {
      mockCouponFindOne.mockReturnValue(
        createQuery(null)
      );

      const coupon = {
        _id: "coupon-1",
        code: "SAVE10",
      };

      mockCouponCreate.mockResolvedValue(
        coupon
      );

      mockCreateAuditLog.mockResolvedValue(
        {}
      );

      await createCoupon(
        {
          ...validPayload,
          maxDiscount: "",
        },
        "user-1"
      );

      expect(
        mockCouponCreate
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          maxDiscount: null,
        })
      );
    });
  });

  describe("getCoupons", () => {
    test("should return all non-deleted coupons", async () => {
      const coupons = [
        {
          _id: "coupon-1",
          code: "SAVE10",
        },
      ];

      mockCouponFind.mockReturnValue(
        createQuery(coupons)
      );

      const result = await getCoupons();

      expect(result).toBe(coupons);

      expect(
        mockCouponFind
      ).toHaveBeenCalledWith({
        isDeleted: false,
      });
    });
  });

  describe("getCouponById", () => {
    test("should return coupon by ID", async () => {
      const coupon = {
        _id: "coupon-1",
        code: "SAVE10",
      };

      mockCouponFindOne.mockReturnValue(
        createQuery(coupon)
      );

      const result =
        await getCouponById("coupon-1");

      expect(result).toBe(coupon);

      expect(
        mockCouponFindOne
      ).toHaveBeenCalledWith({
        _id: "coupon-1",
        isDeleted: false,
      });
    });

    test("should reject when coupon is not found", async () => {
      mockCouponFindOne.mockReturnValue(
        createQuery(null)
      );

      await expect(
        getCouponById("coupon-1")
      ).rejects.toMatchObject({
        message: "Coupon not found",
        statusCode: 404,
      });
    });
  });

  describe("getAvailableCoupons", () => {
    test("should return available active coupons", async () => {
      const coupons = [
        {
          _id: "coupon-1",
          code: "SAVE10",
          status:
            COUPON_STATUS.ACTIVE,
        },
      ];

      mockCouponFind.mockReturnValue(
        createQuery(coupons)
      );

      const result =
        await getAvailableCoupons();

      expect(result).toBe(coupons);

      expect(
        mockCouponFind
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          isDeleted: false,
          status: COUPON_STATUS.ACTIVE,
          startDate:
            expect.objectContaining({
              $lte: expect.any(Date),
            }),
          expiryDate:
            expect.objectContaining({
              $gt: expect.any(Date),
            }),
          $expr: {
            $lt: [
              "$usedCount",
              "$usageLimit",
            ],
          },
        })
      );
    });
  });

  describe("getAvailableCouponById", () => {
    test("should return available coupon by ID", async () => {
      const coupon = {
        _id: "coupon-1",
        code: "SAVE10",
        status:
          COUPON_STATUS.ACTIVE,
      };

      mockCouponFindOne.mockReturnValue(
        createQuery(coupon)
      );

      const result =
        await getAvailableCouponById(
          "coupon-1"
        );

      expect(result).toBe(coupon);

      expect(
        mockCouponFindOne
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: "coupon-1",
          isDeleted: false,
          status:
            COUPON_STATUS.ACTIVE,
          startDate:
            expect.objectContaining({
              $lte: expect.any(Date),
            }),
          expiryDate:
            expect.objectContaining({
              $gt: expect.any(Date),
            }),
          $expr: {
            $lt: [
              "$usedCount",
              "$usageLimit",
            ],
          },
        })
      );
    });

    test("should reject when coupon is not available", async () => {
      mockCouponFindOne.mockReturnValue(
        createQuery(null)
      );

      await expect(
        getAvailableCouponById(
          "coupon-1"
        )
      ).rejects.toMatchObject({
        message:
          "Coupon is not available",
        statusCode: 404,
      });
    });
  });

  describe("updateCoupon", () => {
    const createCouponDocument = () => ({
      _id: "coupon-1",
      code: "OLD10",
      description: "Old description",
      discountType:
        DISCOUNT_TYPE.PERCENTAGE,
      discountValue: 10,
      maxDiscount: 100,
      usageLimit: 10,
      usedCount: 2,
      perCustomerLimit: 2,
      startDate: new Date(
        "2026-08-01"
      ),
      expiryDate: new Date(
        "2026-12-31"
      ),
      status: COUPON_STATUS.ACTIVE,
      save: jest
        .fn()
        .mockResolvedValue(undefined),
    });

    test("should reject when coupon is not found", async () => {
      mockCouponFindOne.mockReturnValue(
        createQuery(null)
      );

      await expect(
        updateCoupon(
          "coupon-1",
          validPayload,
          "user-1"
        )
      ).rejects.toMatchObject({
        message: "Coupon not found",
        statusCode: 404,
      });
    });

    test("should reject when usage limit is reduced below current usage", async () => {
      const coupon =
        createCouponDocument();

      mockCouponFindOne.mockReturnValue(
        createQuery(coupon)
      );

      await expect(
        updateCoupon(
          "coupon-1",
          {
            ...validPayload,
            usageLimit: 1,
          },
          "user-1"
        )
      ).rejects.toMatchObject({
        message:
          "Usage limit cannot be less than current usage count (2)",
        statusCode: 400,
      });
    });

    test("should reject duplicate coupon code during update", async () => {
      const coupon =
        createCouponDocument();

      mockCouponFindOne
        .mockReturnValueOnce(
          createQuery(coupon)
        )
        .mockReturnValueOnce(
          createQuery({
            _id: "other-coupon",
            code: "NEWCODE",
          })
        );

      await expect(
        updateCoupon(
          "coupon-1",
          {
            ...validPayload,
            code: "NEWCODE",
          },
          "user-1"
        )
      ).rejects.toMatchObject({
        message:
          "Coupon code already exists",
        statusCode: 409,
      });
    });

    test("should update coupon successfully", async () => {
      const coupon =
        createCouponDocument();

      mockCouponFindOne
        .mockReturnValueOnce(
          createQuery(coupon)
        )
        .mockReturnValueOnce(
          createQuery(null)
        );

      mockCreateAuditLog.mockResolvedValue(
        {}
      );

      const result = await updateCoupon(
        "coupon-1",
        {
          code: "NEW10",
          description:
            "Updated description",
          discountType:
            DISCOUNT_TYPE.PERCENTAGE,
          discountValue: 20,
          maxDiscount: 200,
          usageLimit: 10,
          perCustomerLimit: 2,
          startDate: new Date(
            "2026-08-01"
          ),
          expiryDate: new Date(
            "2026-12-31"
          ),
          status:
            COUPON_STATUS.ACTIVE,
        },
        "user-1",
        "127.0.0.1"
      );

      expect(result).toBe(coupon);

      expect(coupon.code).toBe(
        "NEW10"
      );

      expect(
        coupon.description
      ).toBe("Updated description");

      expect(
        coupon.discountValue
      ).toBe(20);

      expect(
        coupon.maxDiscount
      ).toBe(200);

      expect(
        coupon.usageLimit
      ).toBe(10);

      expect(
        coupon.perCustomerLimit
      ).toBe(2);

      expect(coupon.status).toBe(
        COUPON_STATUS.ACTIVE
      );

      expect(
        coupon.save
      ).toHaveBeenCalled();

      expect(
        mockCreateAuditLog
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          user: "user-1",
          action: "UPDATE_COUPON",
          entity: "COUPON",
          entityId: "coupon-1",
          description:
            "Updated coupon NEW10",
          ipAddress: "127.0.0.1",
        })
      );
    });
  });

  describe("deleteCoupon", () => {
    test("should reject when coupon is not found", async () => {
      mockCouponFindOne.mockReturnValue(
        createQuery(null)
      );

      await expect(
        deleteCoupon(
          "coupon-1",
          "admin-1"
        )
      ).rejects.toMatchObject({
        message: "Coupon not found",
        statusCode: 404,
      });
    });

    test("should delete coupon successfully", async () => {
      const coupon = {
        _id: "coupon-1",
        code: "SAVE10",
        isDeleted: false,
        status:
          COUPON_STATUS.ACTIVE,
        save: jest
          .fn()
          .mockResolvedValue(undefined),
      };

      mockCouponFindOne.mockReturnValue(
        createQuery(coupon)
      );

      mockCreateAuditLog.mockResolvedValue(
        {}
      );

      const result = await deleteCoupon(
        "coupon-1",
        "admin-1",
        "127.0.0.1"
      );

      expect(result).toEqual({
        message:
          "Coupon deleted successfully",
      });

      expect(
        coupon.isDeleted
      ).toBe(true);

      expect(
        coupon.deletedAt
      ).toBeInstanceOf(Date);

      expect(coupon.status).toBe(
        COUPON_STATUS.INACTIVE
      );

      expect(
        coupon.save
      ).toHaveBeenCalled();

      expect(
        mockCreateAuditLog
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          user: "admin-1",
          action: "DELETE_COUPON",
          entity: "COUPON",
          entityId: "coupon-1",
          description:
            "Deleted coupon SAVE10",
          ipAddress: "127.0.0.1",
        })
      );
    });
  });
});