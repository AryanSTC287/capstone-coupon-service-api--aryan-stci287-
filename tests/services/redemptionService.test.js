import { jest } from "@jest/globals";

const mockStartSession = jest.fn();

const mockCouponFindOne = jest.fn();
const mockCouponFindOneAndUpdate = jest.fn();
const mockCouponFindById = jest.fn();

const mockRedemptionFindOne = jest.fn();
const mockRedemptionCountDocuments = jest.fn();
const mockRedemptionFind = jest.fn();
const mockRedemptionFindById = jest.fn();
const mockRedemptionCreate = jest.fn();

const mockUserFindOneAndUpdate = jest.fn();

jest.unstable_mockModule("mongoose", () => ({
  default: {
    startSession: mockStartSession,
  },
}));

jest.unstable_mockModule(
  "../../models/couponModel.js",
  () => ({
    default: {
      findOne: mockCouponFindOne,
      findOneAndUpdate:
        mockCouponFindOneAndUpdate,
      findById: mockCouponFindById,
    },
  })
);

jest.unstable_mockModule(
  "../../models/redemptionModel.js",
  () => ({
    default: {
      findOne: mockRedemptionFindOne,
      countDocuments:
        mockRedemptionCountDocuments,
      find: mockRedemptionFind,
      findById: mockRedemptionFindById,
      create: mockRedemptionCreate,
    },
  })
);

jest.unstable_mockModule(
  "../../models/userModel.js",
  () => ({
    default: {
      findOneAndUpdate:
        mockUserFindOneAndUpdate,
    },
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

const {
  redeemCoupon,
  getCustomerRedemptions,
  getRedemptions,
  revertRedemption,
} = await import(
  "../../services/redemptionService.js"
);

const createSession = () => {
  const session = {
    withTransaction: jest.fn(),
    endSession: jest.fn(),
  };

  session.withTransaction.mockImplementation(
    async (callback) => {
      return callback();
    }
  );

  return session;
};

const createQuery = (result) => {
  const query = {
    session: jest.fn(),
    populate: jest.fn(),
    sort: jest.fn(),
    select: jest.fn(),
  };

  query.session.mockReturnValue(query);
  query.populate.mockReturnValue(query);
  query.sort.mockReturnValue(query);
  query.select.mockReturnValue(query);

  query.then = (resolve, reject) =>
    Promise.resolve(result).then(
      resolve,
      reject
    );

  query.catch = (reject) =>
    Promise.resolve(result).catch(reject);

  return query;
};

describe("redemptionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const session = createSession();

    mockStartSession.mockResolvedValue(session);

    mockCouponFindOne.mockReturnValue(
      createQuery(null)
    );

    mockCouponFindOneAndUpdate.mockReturnValue(
      createQuery(null)
    );

    mockCouponFindById.mockReturnValue(
      createQuery(null)
    );

    mockRedemptionFindOne.mockReturnValue(
      createQuery(null)
    );

    mockRedemptionCountDocuments.mockReturnValue(
      createQuery(0)
    );

    mockRedemptionFind.mockReturnValue(
      createQuery([])
    );

    mockRedemptionFindById.mockReturnValue(
      createQuery(null)
    );

    mockUserFindOneAndUpdate.mockReturnValue(
      createQuery(null)
    );
  });

  describe("redeemCoupon", () => {
    test("should reject when coupon code is missing", async () => {
      await expect(
        redeemCoupon({
          customerId: "customer1",
          orderId: "order1",
          idempotencyKey: "key1",
        })
      ).rejects.toMatchObject({
        message: "Coupon code is required",
        statusCode: 400,
      });
    });

    test("should reject when order ID is missing", async () => {
      await expect(
        redeemCoupon({
          couponCode: "SAVE10",
          customerId: "customer1",
          idempotencyKey: "key1",
        })
      ).rejects.toMatchObject({
        message: "Order ID is required",
        statusCode: 400,
      });
    });

    test("should reject when idempotency key is missing", async () => {
      await expect(
        redeemCoupon({
          couponCode: "SAVE10",
          customerId: "customer1",
          orderId: "order1",
        })
      ).rejects.toMatchObject({
        message: "Idempotency key is required",
        statusCode: 400,
      });
    });

    test("should reject when customer ID is missing", async () => {
      await expect(
        redeemCoupon({
          couponCode: "SAVE10",
          orderId: "order1",
          idempotencyKey: "key1",
        })
      ).rejects.toMatchObject({
        message: "Customer ID is required",
        statusCode: 400,
      });
    });

    test("should reject negative order amount", async () => {
      await expect(
        redeemCoupon({
          couponCode: "SAVE10",
          customerId: "customer1",
          orderId: "order1",
          idempotencyKey: "key1",
          orderAmount: -100,
        })
      ).rejects.toMatchObject({
        message:
          "Order amount must be a valid non-negative number",
        statusCode: 400,
      });
    });

    test("should return existing redemption for same idempotency key", async () => {
      const existingRedemption = {
        _id: "redemption1",
        idempotencyKey: "key1",
        populate: jest.fn().mockResolvedValue(),
      };

      mockRedemptionFindOne.mockReturnValue(
        createQuery(existingRedemption)
      );

      const result = await redeemCoupon({
        couponCode: "SAVE10",
        customerId: "customer1",
        orderId: "order1",
        idempotencyKey: "key1",
        orderAmount: 1000,
      });

      expect(result).toBe(existingRedemption);
      expect(
        mockCouponFindOne
      ).not.toHaveBeenCalled();
    });

    test("should reject when coupon is not found", async () => {
      mockCouponFindOne.mockReturnValue(
        createQuery(null)
      );

      await expect(
        redeemCoupon({
          couponCode: "SAVE10",
          customerId: "customer1",
          orderId: "order1",
          idempotencyKey: "key1",
        })
      ).rejects.toMatchObject({
        message: "Coupon not found",
        statusCode: 404,
      });
    });

    test("should reject inactive coupon", async () => {
      mockCouponFindOne.mockReturnValue(
        createQuery({
          _id: "coupon1",
          status: "INACTIVE",
        })
      );

      await expect(
        redeemCoupon({
          couponCode: "SAVE10",
          customerId: "customer1",
          orderId: "order1",
          idempotencyKey: "key1",
        })
      ).rejects.toMatchObject({
        message: "Coupon is inactive",
        statusCode: 400,
      });
    });

    test("should reject coupon that has not started", async () => {
      mockCouponFindOne.mockReturnValue(
        createQuery({
          _id: "coupon1",
          status: "ACTIVE",
          startDate: new Date(
            Date.now() + 86400000
          ),
          expiryDate: new Date(
            Date.now() + 172800000
          ),
        })
      );

      await expect(
        redeemCoupon({
          couponCode: "SAVE10",
          customerId: "customer1",
          orderId: "order1",
          idempotencyKey: "key1",
        })
      ).rejects.toMatchObject({
        message: "Coupon is not active yet",
        statusCode: 400,
      });
    });

    test("should reject expired coupon", async () => {
      mockCouponFindOne.mockReturnValue(
        createQuery({
          _id: "coupon1",
          status: "ACTIVE",
          startDate: new Date(
            Date.now() - 172800000
          ),
          expiryDate: new Date(
            Date.now() - 86400000
          ),
        })
      );

      await expect(
        redeemCoupon({
          couponCode: "SAVE10",
          customerId: "customer1",
          orderId: "order1",
          idempotencyKey: "key1",
        })
      ).rejects.toMatchObject({
        message: "Coupon has expired",
        statusCode: 400,
      });
    });

    test("should reject inactive or missing customer", async () => {
      mockCouponFindOne.mockReturnValue(
        createQuery({
          _id: "coupon1",
          status: "ACTIVE",
          startDate: new Date(
            Date.now() - 86400000
          ),
          expiryDate: new Date(
            Date.now() + 86400000
          ),
          perCustomerLimit: 2,
        })
      );

      mockUserFindOneAndUpdate.mockReturnValue(
        createQuery(null)
      );

      await expect(
        redeemCoupon({
          couponCode: "SAVE10",
          customerId: "customer1",
          orderId: "order1",
          idempotencyKey: "key1",
        })
      ).rejects.toMatchObject({
        message:
          "Customer not found or inactive",
        statusCode: 404,
      });
    });

    test("should reject when customer redemption limit is exceeded", async () => {
      mockCouponFindOne.mockReturnValue(
        createQuery({
          _id: "coupon1",
          status: "ACTIVE",
          startDate: new Date(
            Date.now() - 86400000
          ),
          expiryDate: new Date(
            Date.now() + 86400000
          ),
          perCustomerLimit: 2,
        })
      );

      mockUserFindOneAndUpdate.mockReturnValue(
        createQuery({
          _id: "customer1",
          status: "ACTIVE",
        })
      );

      mockRedemptionCountDocuments.mockReturnValue(
        createQuery(2)
      );

      await expect(
        redeemCoupon({
          couponCode: "SAVE10",
          customerId: "customer1",
          orderId: "order1",
          idempotencyKey: "key1",
        })
      ).rejects.toMatchObject({
        message:
          "Customer redemption limit exceeded",
        statusCode: 400,
      });
    });

    test("should reject when order has already been redeemed", async () => {
      const coupon = {
        _id: "coupon1",
        status: "ACTIVE",
        startDate: new Date(
          Date.now() - 86400000
        ),
        expiryDate: new Date(
          Date.now() + 86400000
        ),
        perCustomerLimit: 2,
      };

      mockCouponFindOne.mockReturnValue(
        createQuery(coupon)
      );

      mockUserFindOneAndUpdate.mockReturnValue(
        createQuery({
          _id: "customer1",
          status: "ACTIVE",
        })
      );

      mockRedemptionCountDocuments.mockReturnValue(
        createQuery(0)
      );

      mockRedemptionFindOne
        .mockReturnValueOnce(
          createQuery(null)
        )
        .mockReturnValueOnce(
          createQuery({
            _id: "existing",
            orderId: "order1",
          })
        );

      await expect(
        redeemCoupon({
          couponCode: "SAVE10",
          customerId: "customer1",
          orderId: "order1",
          idempotencyKey: "key1",
        })
      ).rejects.toMatchObject({
        message:
          "This order has already been redeemed",
        statusCode: 409,
      });
    });

    test("should reject when global usage limit is exceeded", async () => {
      const coupon = {
        _id: "coupon1",
        status: "ACTIVE",
        startDate: new Date(
          Date.now() - 86400000
        ),
        expiryDate: new Date(
          Date.now() + 86400000
        ),
        perCustomerLimit: 2,
        usageLimit: 5,
        usedCount: 5,
        discountType: "FIXED",
        discountValue: 100,
        maxDiscount: null,
      };

      mockCouponFindOne.mockReturnValue(
        createQuery(coupon)
      );

      mockUserFindOneAndUpdate.mockReturnValue(
        createQuery({
          _id: "customer1",
          status: "ACTIVE",
        })
      );

      mockRedemptionCountDocuments.mockReturnValue(
        createQuery(0)
      );

      mockRedemptionFindOne
        .mockReturnValueOnce(
          createQuery(null)
        )
        .mockReturnValueOnce(
          createQuery(null)
        );

      mockCouponFindOneAndUpdate.mockReturnValue(
        createQuery(null)
      );

      await expect(
        redeemCoupon({
          couponCode: "SAVE10",
          customerId: "customer1",
          orderId: "order1",
          idempotencyKey: "key1",
        })
      ).rejects.toMatchObject({
        message:
          "Coupon usage limit exceeded",
        statusCode: 400,
      });
    });

    test("should successfully redeem fixed discount coupon", async () => {
      const coupon = {
        _id: "coupon1",
        status: "ACTIVE",
        startDate: new Date(
          Date.now() - 86400000
        ),
        expiryDate: new Date(
          Date.now() + 86400000
        ),
        perCustomerLimit: 2,
        usageLimit: 10,
        usedCount: 0,
        discountType: "FIXED",
        discountValue: 100,
        maxDiscount: null,
      };

      const redemption = {
        _id: "redemption1",
        discountAmount: 100,
        populate: jest.fn().mockResolvedValue(),
      };

      mockCouponFindOne.mockReturnValue(
        createQuery(coupon)
      );

      mockUserFindOneAndUpdate.mockReturnValue(
        createQuery({
          _id: "customer1",
          status: "ACTIVE",
        })
      );

      mockRedemptionCountDocuments.mockReturnValue(
        createQuery(0)
      );

      mockRedemptionFindOne
        .mockReturnValueOnce(
          createQuery(null)
        )
        .mockReturnValueOnce(
          createQuery(null)
        );

      mockCouponFindOneAndUpdate.mockReturnValue(
        createQuery(coupon)
      );

      mockRedemptionCreate.mockResolvedValue([
        redemption,
      ]);

      const result = await redeemCoupon({
        couponCode: " save10 ",
        customerId: "customer1",
        orderId: " order1 ",
        idempotencyKey: " key1 ",
        orderAmount: 1000,
      });

      expect(result).toBe(redemption);

      expect(
        mockRedemptionCreate
      ).toHaveBeenCalledWith(
        [
          expect.objectContaining({
            coupon: "coupon1",
            customer: "customer1",
            orderId: "order1",
            orderAmount: 1000,
            idempotencyKey: "key1",
            discountAmount: 100,
            status: "SUCCESS",
          }),
        ],
        expect.objectContaining({
          session: expect.any(Object),
        })
      );
    });

    test("should calculate percentage discount correctly", async () => {
      const coupon = {
        _id: "coupon1",
        status: "ACTIVE",
        startDate: new Date(
          Date.now() - 86400000
        ),
        expiryDate: new Date(
          Date.now() + 86400000
        ),
        perCustomerLimit: 2,
        usageLimit: 10,
        usedCount: 0,
        discountType: "PERCENTAGE",
        discountValue: 10,
        maxDiscount: null,
      };

      const redemption = {
        discountAmount: 100,
        populate: jest.fn().mockResolvedValue(),
      };

      mockCouponFindOne.mockReturnValue(
        createQuery(coupon)
      );

      mockUserFindOneAndUpdate.mockReturnValue(
        createQuery({
          _id: "customer1",
          status: "ACTIVE",
        })
      );

      mockRedemptionCountDocuments.mockReturnValue(
        createQuery(0)
      );

      mockRedemptionFindOne
        .mockReturnValueOnce(
          createQuery(null)
        )
        .mockReturnValueOnce(
          createQuery(null)
        );

      mockCouponFindOneAndUpdate.mockReturnValue(
        createQuery(coupon)
      );

      mockRedemptionCreate.mockResolvedValue([
        redemption,
      ]);

      await redeemCoupon({
        couponCode: "SAVE10",
        customerId: "customer1",
        orderId: "order1",
        idempotencyKey: "key1",
        orderAmount: 1000,
      });

      expect(
        mockRedemptionCreate
      ).toHaveBeenCalledWith(
        [
          expect.objectContaining({
            discountAmount: 100,
          }),
        ],
        expect.any(Object)
      );
    });

    test("should respect maximum discount for percentage coupon", async () => {
      const coupon = {
        _id: "coupon1",
        status: "ACTIVE",
        startDate: new Date(
          Date.now() - 86400000
        ),
        expiryDate: new Date(
          Date.now() + 86400000
        ),
        perCustomerLimit: 2,
        usageLimit: 10,
        usedCount: 0,
        discountType: "PERCENTAGE",
        discountValue: 20,
        maxDiscount: 100,
      };

      const redemption = {
        discountAmount: 100,
        populate: jest.fn().mockResolvedValue(),
      };

      mockCouponFindOne.mockReturnValue(
        createQuery(coupon)
      );

      mockUserFindOneAndUpdate.mockReturnValue(
        createQuery({
          _id: "customer1",
          status: "ACTIVE",
        })
      );

      mockRedemptionCountDocuments.mockReturnValue(
        createQuery(0)
      );

      mockRedemptionFindOne
        .mockReturnValueOnce(
          createQuery(null)
        )
        .mockReturnValueOnce(
          createQuery(null)
        );

      mockCouponFindOneAndUpdate.mockReturnValue(
        createQuery(coupon)
      );

      mockRedemptionCreate.mockResolvedValue([
        redemption,
      ]);

      await redeemCoupon({
        couponCode: "SAVE20",
        customerId: "customer1",
        orderId: "order1",
        idempotencyKey: "key1",
        orderAmount: 1000,
      });

      expect(
        mockRedemptionCreate
      ).toHaveBeenCalledWith(
        [
          expect.objectContaining({
            discountAmount: 100,
          }),
        ],
        expect.any(Object)
      );
    });
  });

  describe("getCustomerRedemptions", () => {
    test("should return customer redemptions", async () => {
      const redemptions = [
        {
          _id: "redemption1",
        },
      ];

      mockRedemptionFind.mockReturnValue(
        createQuery(redemptions)
      );

      const result =
        await getCustomerRedemptions(
          "customer1"
        );

      expect(result).toEqual(redemptions);
      expect(
        mockRedemptionFind
      ).toHaveBeenCalledWith({
        customer: "customer1",
      });
    });
  });

  describe("getRedemptions", () => {
    test("should return all redemptions", async () => {
      const redemptions = [
        {
          _id: "redemption1",
        },
      ];

      mockRedemptionFind.mockReturnValue(
        createQuery(redemptions)
      );

      const result =
        await getRedemptions();

      expect(result).toEqual(redemptions);
      expect(
        mockRedemptionFind
      ).toHaveBeenCalledWith();
    });
  });

  describe("revertRedemption", () => {
    test("should reject when redemption is not found", async () => {
      mockRedemptionFindById.mockReturnValue(
        createQuery(null)
      );

      await expect(
        revertRedemption({
          id: "redemption1",
          adminId: "admin1",
        })
      ).rejects.toMatchObject({
        message: "Redemption not found",
        statusCode: 404,
      });
    });

    test("should reject already reverted redemption", async () => {
      mockRedemptionFindById.mockReturnValue(
        createQuery({
          status: "REVERTED",
        })
      );

      await expect(
        revertRedemption({
          id: "redemption1",
          adminId: "admin1",
        })
      ).rejects.toMatchObject({
        message: "Already reverted",
        statusCode: 400,
      });
    });

    test("should reject when coupon is not found during revert", async () => {
      mockRedemptionFindById.mockReturnValue(
        createQuery({
          status: "SUCCESS",
          coupon: "coupon1",
          discountAmount: 100,
        })
      );

      mockCouponFindById.mockReturnValue(
        createQuery(null)
      );

      await expect(
        revertRedemption({
          id: "redemption1",
          adminId: "admin1",
        })
      ).rejects.toMatchObject({
        message: "Coupon not found",
        statusCode: 404,
      });
    });

    test("should reject when coupon counters cannot be updated", async () => {
      const redemption = {
        status: "SUCCESS",
        coupon: "coupon1",
        discountAmount: 100,
        save: jest.fn().mockResolvedValue(),
      };

      mockRedemptionFindById.mockReturnValue(
        createQuery(redemption)
      );

      mockCouponFindById.mockReturnValue(
        createQuery({
          _id: "coupon1",
        })
      );

      mockCouponFindOneAndUpdate.mockReturnValue(
        createQuery(null)
      );

      await expect(
        revertRedemption({
          id: "redemption1",
          adminId: "admin1",
        })
      ).rejects.toMatchObject({
        message:
          "Unable to update coupon counters",
        statusCode: 400,
      });
    });

    test("should successfully revert redemption", async () => {
      const redemption = {
        status: "SUCCESS",
        coupon: "coupon1",
        customer: "customer1",
        discountAmount: 100,
        save: jest.fn().mockResolvedValue(),
        populate: jest.fn().mockResolvedValue(),
      };

      mockRedemptionFindById.mockReturnValue(
        createQuery(redemption)
      );

      mockCouponFindById.mockReturnValue(
        createQuery({
          _id: "coupon1",
        })
      );

      mockCouponFindOneAndUpdate.mockReturnValue(
        createQuery({
          _id: "coupon1",
          usedCount: 0,
          totalRedemptions: 0,
          totalDiscountGiven: 0,
        })
      );

      const result =
        await revertRedemption({
          id: "redemption1",
          adminId: "admin1",
        });

      expect(result).toBe(redemption);
      expect(
        redemption.status
      ).toBe("REVERTED");
      expect(
        redemption.revertedBy
      ).toBe("admin1");

      expect(
        redemption.save
      ).toHaveBeenCalledWith({
        session: expect.any(Object),
      });
    });
  });
});