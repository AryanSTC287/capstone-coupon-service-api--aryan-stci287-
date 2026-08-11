import { jest } from "@jest/globals";

const mockCreateCoupon = jest.fn();
const mockGetCoupons = jest.fn();
const mockGetCouponById = jest.fn();
const mockUpdateCoupon = jest.fn();
const mockDeleteCoupon = jest.fn();

jest.unstable_mockModule(
  "../../services/couponService.js",
  () => ({
    createCoupon: mockCreateCoupon,
    getCoupons: mockGetCoupons,
    getCouponById: mockGetCouponById,
    updateCoupon: mockUpdateCoupon,
    deleteCoupon: mockDeleteCoupon,
  })
);

const mockAppSuccess = jest.fn();

jest.unstable_mockModule(
  "../../middlewares/appSuccess.js",
  () => ({
    default: mockAppSuccess,
  })
);

const {
  createCouponController,
  getCouponsController,
  getCouponByIdController,
  updateCouponController,
  deleteCouponController,
} = await import(
  "../../controllers/couponController.js"
);

describe("couponController", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
      params: {},
      user: {
        id: "admin123",
      },
      ip: "127.0.0.1",
    };

    res = {};

    next = jest.fn();
  });

  describe("createCouponController", () => {
    test("should create coupon successfully", async () => {
      const coupon = {
        _id: "coupon123",
        code: "SAVE20",
      };

      req.body = {
        code: "SAVE20",
        discountType: "PERCENTAGE",
        discountValue: 20,
        usageLimit: 100,
        perCustomerLimit: 2,
      };

      mockCreateCoupon.mockResolvedValue(coupon);

      await createCouponController(req, res, next);

      expect(mockCreateCoupon).toHaveBeenCalledWith(
        req.body,
        req.user.id,
        req.ip
      );

      expect(mockAppSuccess).toHaveBeenCalledWith(
        res,
        {
          statusCode: 201,
          message: "Coupon created successfully",
          data: coupon,
        }
      );

      expect(next).not.toHaveBeenCalled();
    });

    test("should pass error to next", async () => {
      const error = new Error("Create coupon failed");

      mockCreateCoupon.mockRejectedValue(error);

      await createCouponController(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mockAppSuccess).not.toHaveBeenCalled();
    });
  });

  describe("getCouponsController", () => {
    test("should return all coupons successfully", async () => {
      const coupons = [
        {
          _id: "coupon1",
          code: "SAVE10",
        },
        {
          _id: "coupon2",
          code: "SAVE20",
        },
      ];

      mockGetCoupons.mockResolvedValue(coupons);

      await getCouponsController(req, res, next);

      expect(mockGetCoupons).toHaveBeenCalledWith();

      expect(mockAppSuccess).toHaveBeenCalledWith(
        res,
        {
          message: "Coupons fetched successfully",
          data: coupons,
        }
      );

      expect(next).not.toHaveBeenCalled();
    });

    test("should pass error to next", async () => {
      const error = new Error("Failed to fetch coupons");

      mockGetCoupons.mockRejectedValue(error);

      await getCouponsController(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mockAppSuccess).not.toHaveBeenCalled();
    });
  });

  describe("getCouponByIdController", () => {
    test("should return coupon by ID successfully", async () => {
      const coupon = {
        _id: "coupon123",
        code: "SAVE20",
      };

      req.params.id = "coupon123";

      mockGetCouponById.mockResolvedValue(coupon);

      await getCouponByIdController(req, res, next);

      expect(mockGetCouponById).toHaveBeenCalledWith(
        "coupon123"
      );

      expect(mockAppSuccess).toHaveBeenCalledWith(
        res,
        {
          message: "Coupon fetched successfully",
          data: coupon,
        }
      );

      expect(next).not.toHaveBeenCalled();
    });

    test("should pass error to next", async () => {
      const error = new Error("Coupon not found");

      req.params.id = "invalid-id";

      mockGetCouponById.mockRejectedValue(error);

      await getCouponByIdController(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mockAppSuccess).not.toHaveBeenCalled();
    });
  });

  describe("updateCouponController", () => {
    test("should update coupon successfully", async () => {
      const coupon = {
        _id: "coupon123",
        code: "UPDATED20",
      };

      req.params.id = "coupon123";

      req.body = {
        code: "UPDATED20",
        discountValue: 20,
      };

      mockUpdateCoupon.mockResolvedValue(coupon);

      await updateCouponController(req, res, next);

      expect(mockUpdateCoupon).toHaveBeenCalledWith(
        req.params.id,
        req.body,
        req.user.id,
        req.ip
      );

      expect(mockAppSuccess).toHaveBeenCalledWith(
        res,
        {
          message: "Coupon updated successfully",
          data: coupon,
        }
      );

      expect(next).not.toHaveBeenCalled();
    });

    test("should pass error to next", async () => {
      const error = new Error("Update coupon failed");

      req.params.id = "coupon123";

      mockUpdateCoupon.mockRejectedValue(error);

      await updateCouponController(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mockAppSuccess).not.toHaveBeenCalled();
    });
  });

  describe("deleteCouponController", () => {
    test("should delete coupon successfully", async () => {
      const result = {
        _id: "coupon123",
        deleted: true,
      };

      req.params.id = "coupon123";

      mockDeleteCoupon.mockResolvedValue(result);

      await deleteCouponController(req, res, next);

      expect(mockDeleteCoupon).toHaveBeenCalledWith(
        req.params.id,
        req.user.id,
        req.ip
      );

      expect(mockAppSuccess).toHaveBeenCalledWith(
        res,
        {
          message: "Coupon deleted successfully",
          data: result,
        }
      );

      expect(next).not.toHaveBeenCalled();
    });

    test("should pass error to next", async () => {
      const error = new Error("Delete coupon failed");

      req.params.id = "coupon123";

      mockDeleteCoupon.mockRejectedValue(error);

      await deleteCouponController(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mockAppSuccess).not.toHaveBeenCalled();
    });
  });
});