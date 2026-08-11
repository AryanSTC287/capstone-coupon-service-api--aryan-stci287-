import { jest } from "@jest/globals";

const mockRedeemCoupon = jest.fn();
const mockGetCustomerRedemptions = jest.fn();
const mockGetRedemptions = jest.fn();
const mockRevertRedemption = jest.fn();

const mockAppSuccess = jest.fn();

const mockRandomUUID = jest.fn();

jest.unstable_mockModule(
  "../../services/redemptionService.js",
  () => ({
    redeemCoupon: mockRedeemCoupon,
    getCustomerRedemptions:
      mockGetCustomerRedemptions,
    getRedemptions: mockGetRedemptions,
    revertRedemption:
      mockRevertRedemption,
  })
);

jest.unstable_mockModule(
  "../../middlewares/appSuccess.js",
  () => ({
    default: mockAppSuccess,
  })
);

jest.unstable_mockModule(
  "crypto",
  () => ({
    default: {
      randomUUID: mockRandomUUID,
    },
  })
);

const {
  redeemCouponController,
  getMyRedemptionsController,
  getAllRedemptionsController,
  revertRedemptionController,
} = await import(
  "../../controllers/redemptionController.js"
);

describe("redemptionController", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
      params: {},
      user: {
        id: "customer123",
      },
      get: jest.fn(),
      ip: "127.0.0.1",
    };

    res = {};

    next = jest.fn();

    mockRandomUUID.mockReturnValue(
      "generated-idempotency-key"
    );
  });

  describe("redeemCouponController", () => {
    test("should redeem coupon successfully using Idempotency-Key header", async () => {
      const result = {
        _id: "redemption123",
        coupon: "coupon123",
        customer: "customer123",
      };

      req.body = {
        couponCode: "SAVE20",
        orderId: "ORDER123",
        orderAmount: 1000,
      };

      req.get.mockReturnValue(
        "header-idempotency-key"
      );

      mockRedeemCoupon.mockResolvedValue(
        result
      );

      await redeemCouponController(
        req,
        res,
        next
      );

      expect(
        mockRedeemCoupon
      ).toHaveBeenCalledWith({
        ...req.body,
        customerId: "customer123",
        idempotencyKey:
          "header-idempotency-key",
      });

      expect(
        mockAppSuccess
      ).toHaveBeenCalledWith(res, {
        statusCode: 201,
        message:
          "Coupon redeemed successfully",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    test("should use idempotencyKey from request body when header is missing", async () => {
      const result = {
        _id: "redemption123",
      };

      req.body = {
        couponCode: "SAVE20",
        orderId: "ORDER123",
        idempotencyKey: "body-key",
      };

      req.get.mockReturnValue(
        undefined
      );

      mockRedeemCoupon.mockResolvedValue(
        result
      );

      await redeemCouponController(
        req,
        res,
        next
      );

      expect(
        mockRedeemCoupon
      ).toHaveBeenCalledWith({
        ...req.body,
        customerId: "customer123",
        idempotencyKey: "body-key",
      });
    });

    test("should generate idempotency key when header and body key are missing", async () => {
      const result = {
        _id: "redemption123",
      };

      req.body = {
        couponCode: "SAVE20",
        orderId: "ORDER123",
      };

      req.get.mockReturnValue(
        undefined
      );

      mockRedeemCoupon.mockResolvedValue(
        result
      );

      await redeemCouponController(
        req,
        res,
        next
      );

      expect(
        mockRandomUUID
      ).toHaveBeenCalled();

      expect(
        mockRedeemCoupon
      ).toHaveBeenCalledWith({
        ...req.body,
        customerId: "customer123",
        idempotencyKey:
          "generated-idempotency-key",
      });
    });

    test("should use customer ID from authenticated user", async () => {
      const result = {
        _id: "redemption123",
      };

      req.body = {
        couponCode: "SAVE20",
        orderId: "ORDER123",
      };

      req.user.id = "customer456";

      req.get.mockReturnValue(
        "header-key"
      );

      mockRedeemCoupon.mockResolvedValue(
        result
      );

      await redeemCouponController(
        req,
        res,
        next
      );

      expect(
        mockRedeemCoupon
      ).toHaveBeenCalledWith({
        ...req.body,
        customerId: "customer456",
        idempotencyKey: "header-key",
      });
    });

    test("should pass service error to next", async () => {
      const error = new Error(
        "Coupon usage limit exceeded"
      );

      req.body = {
        couponCode: "SAVE20",
        orderId: "ORDER123",
      };

      req.get.mockReturnValue(
        "header-key"
      );

      mockRedeemCoupon.mockRejectedValue(
        error
      );

      await redeemCouponController(
        req,
        res,
        next
      );

      expect(next).toHaveBeenCalledWith(
        error
      );

      expect(
        mockAppSuccess
      ).not.toHaveBeenCalled();
    });
  });

  describe("getMyRedemptionsController", () => {
    test("should return customer redemptions successfully", async () => {
      const redemptions = [
        {
          _id: "redemption1",
          orderId: "ORDER123",
        },
        {
          _id: "redemption2",
          orderId: "ORDER456",
        },
      ];

      req.user.id = "customer123";

      mockGetCustomerRedemptions.mockResolvedValue(
        redemptions
      );

      await getMyRedemptionsController(
        req,
        res,
        next
      );

      expect(
        mockGetCustomerRedemptions
      ).toHaveBeenCalledWith(
        "customer123"
      );

      expect(
        mockAppSuccess
      ).toHaveBeenCalledWith(res, {
        message:
          "Redemptions fetched successfully",
        data: redemptions,
      });

      expect(next).not.toHaveBeenCalled();
    });

    test("should pass error to next", async () => {
      const error = new Error(
        "Failed to fetch redemptions"
      );

      mockGetCustomerRedemptions.mockRejectedValue(
        error
      );

      await getMyRedemptionsController(
        req,
        res,
        next
      );

      expect(next).toHaveBeenCalledWith(
        error
      );

      expect(
        mockAppSuccess
      ).not.toHaveBeenCalled();
    });
  });

  describe("getAllRedemptionsController", () => {
    test("should return all redemptions successfully", async () => {
      const redemptions = [
        {
          _id: "redemption1",
          orderId: "ORDER123",
        },
        {
          _id: "redemption2",
          orderId: "ORDER456",
        },
      ];

      mockGetRedemptions.mockResolvedValue(
        redemptions
      );

      await getAllRedemptionsController(
        req,
        res,
        next
      );

      expect(
        mockGetRedemptions
      ).toHaveBeenCalledTimes(1);

      expect(
        mockAppSuccess
      ).toHaveBeenCalledWith(res, {
        message:
          "All redemptions fetched successfully",
        data: redemptions,
      });

      expect(next).not.toHaveBeenCalled();
    });

    test("should pass error to next", async () => {
      const error = new Error(
        "Failed to fetch all redemptions"
      );

      mockGetRedemptions.mockRejectedValue(
        error
      );

      await getAllRedemptionsController(
        req,
        res,
        next
      );

      expect(next).toHaveBeenCalledWith(
        error
      );

      expect(
        mockAppSuccess
      ).not.toHaveBeenCalled();
    });
  });

  describe("revertRedemptionController", () => {
    test("should revert redemption successfully", async () => {
      const result = {
        _id: "redemption123",
        status: "REVERTED",
      };

      req.params.id = "redemption123";
      req.user.id = "admin123";

      mockRevertRedemption.mockResolvedValue(
        result
      );

      await revertRedemptionController(
        req,
        res,
        next
      );

      expect(
        mockRevertRedemption
      ).toHaveBeenCalledWith({
        id: "redemption123",
        adminId: "admin123",
      });

      expect(
        mockAppSuccess
      ).toHaveBeenCalledWith(res, {
        message:
          "Redemption reverted successfully",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    test("should pass error to next", async () => {
      const error = new Error(
        "Redemption not found"
      );

      req.params.id = "invalid-redemption";
      req.user.id = "admin123";

      mockRevertRedemption.mockRejectedValue(
        error
      );

      await revertRedemptionController(
        req,
        res,
        next
      );

      expect(next).toHaveBeenCalledWith(
        error
      );

      expect(
        mockAppSuccess
      ).not.toHaveBeenCalled();
    });
  });
});