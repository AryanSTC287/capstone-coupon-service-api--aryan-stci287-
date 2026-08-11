import { jest } from "@jest/globals";

const mockGetAvailableCoupons = jest.fn();
const mockGetAvailableCouponById = jest.fn();

const mockAppSuccess = jest.fn();

jest.unstable_mockModule(
  "../../services/couponService.js",
  () => ({
    getAvailableCoupons:
      mockGetAvailableCoupons,
    getAvailableCouponById:
      mockGetAvailableCouponById,
  })
);

jest.unstable_mockModule(
  "../../middlewares/appSuccess.js",
  () => ({
    default: mockAppSuccess,
  })
);

const {
  getCustomerCouponsController,
  getCustomerCouponByIdController,
} = await import(
  "../../controllers/customerCouponController.js"
);

describe("customerCouponController", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: {},
      user: {
        id: "customer123",
      },
    };

    res = {};

    next = jest.fn();
  });

  describe("getCustomerCouponsController", () => {
    test("should return available coupons successfully", async () => {
      const coupons = [
        {
          _id: "coupon1",
          code: "SAVE20",
          discountType: "PERCENTAGE",
          discountValue: 20,
        },
        {
          _id: "coupon2",
          code: "SAVE50",
          discountType: "FIXED",
          discountValue: 50,
        },
      ];

      mockGetAvailableCoupons.mockResolvedValue(
        coupons
      );

      await getCustomerCouponsController(
        req,
        res,
        next
      );

      expect(
        mockGetAvailableCoupons
      ).toHaveBeenCalledTimes(1);

      expect(
        mockAppSuccess
      ).toHaveBeenCalledWith(res, {
        message:
          "Available coupons fetched successfully",
        data: {
          coupons,
        },
      });

      expect(next).not.toHaveBeenCalled();
    });

    test("should pass error to next", async () => {
      const error = new Error(
        "Failed to fetch available coupons"
      );

      mockGetAvailableCoupons.mockRejectedValue(
        error
      );

      await getCustomerCouponsController(
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

  describe("getCustomerCouponByIdController", () => {
    test("should return available coupon by ID successfully", async () => {
      const coupon = {
        _id: "coupon123",
        code: "SAVE20",
        discountType: "PERCENTAGE",
        discountValue: 20,
      };

      req.params.id = "coupon123";

      mockGetAvailableCouponById.mockResolvedValue(
        coupon
      );

      await getCustomerCouponByIdController(
        req,
        res,
        next
      );

      expect(
        mockGetAvailableCouponById
      ).toHaveBeenCalledWith(
        "coupon123"
      );

      expect(
        mockAppSuccess
      ).toHaveBeenCalledWith(res, {
        message:
          "Coupon fetched successfully",
        data: {
          coupon,
        },
      });

      expect(next).not.toHaveBeenCalled();
    });

    test("should pass error to next", async () => {
      const error = new Error(
        "Coupon not found"
      );

      req.params.id = "invalid-coupon";

      mockGetAvailableCouponById.mockRejectedValue(
        error
      );

      await getCustomerCouponByIdController(
        req,
        res,
        next
      );

      expect(
        mockGetAvailableCouponById
      ).toHaveBeenCalledWith(
        "invalid-coupon"
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