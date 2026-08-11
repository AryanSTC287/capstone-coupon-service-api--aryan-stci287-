import { jest } from "@jest/globals";

const mockExportCoupons = jest.fn();

jest.unstable_mockModule(
  "../../services/csvExportService.js",
  () => ({
    exportCoupons: mockExportCoupons,
  })
);

const {
  exportCouponsController,
} = await import(
  "../../controllers/csvExportController.js"
);

describe("csvExportController", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {};

    res = {
      header: jest.fn(),
      attachment: jest.fn(),
      send: jest.fn(),
    };

    next = jest.fn();
  });

  describe("exportCouponsController", () => {
    test("should export coupons successfully", async () => {
      const csv = [
        "code,discountType,discountValue",
        "SAVE20,PERCENTAGE,20",
        "SAVE50,PERCENTAGE,50",
      ].join("\n");

      mockExportCoupons.mockResolvedValue(csv);

      await exportCouponsController(
        req,
        res,
        next
      );

      expect(
        mockExportCoupons
      ).toHaveBeenCalledTimes(1);

      expect(
        res.header
      ).toHaveBeenCalledWith(
        "Content-Type",
        "text/csv"
      );

      expect(
        res.attachment
      ).toHaveBeenCalledWith(
        "coupons.csv"
      );

      expect(
        res.send
      ).toHaveBeenCalledWith(csv);

      expect(next).not.toHaveBeenCalled();
    });

    test("should pass error to next", async () => {
      const error = new Error(
        "Failed to export coupons"
      );

      mockExportCoupons.mockRejectedValue(
        error
      );

      await exportCouponsController(
        req,
        res,
        next
      );

      expect(next).toHaveBeenCalledWith(
        error
      );

      expect(
        res.header
      ).not.toHaveBeenCalled();

      expect(
        res.attachment
      ).not.toHaveBeenCalled();

      expect(
        res.send
      ).not.toHaveBeenCalled();
    });
  });
});