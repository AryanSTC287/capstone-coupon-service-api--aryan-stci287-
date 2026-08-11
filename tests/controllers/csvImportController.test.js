import { jest } from "@jest/globals";

const mockImportCoupons = jest.fn();

const mockFind = jest.fn();
const mockPopulate = jest.fn();
const mockSort = jest.fn();
const mockSkip = jest.fn();
const mockLimit = jest.fn();
const mockCountDocuments = jest.fn();
const mockFindById = jest.fn();

const mockAppSuccess = jest.fn();

jest.unstable_mockModule(
  "../../services/csvImportService.js",
  () => ({
    importCoupons: mockImportCoupons,
  })
);

jest.unstable_mockModule(
  "../../models/importJobModel.js",
  () => ({
    default: {
      find: mockFind,
      countDocuments: mockCountDocuments,
      findById: mockFindById,
    },
  })
);

jest.unstable_mockModule(
  "../../middlewares/appSuccess.js",
  () => ({
    default: mockAppSuccess,
  })
);

const {
  importCouponsController,
  getImportJobsController,
  getImportJobByIdController,
} = await import(
  "../../controllers/csvImportController.js"
);

describe("csvImportController", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      file: null,
      body: {},
      params: {},
      query: {},
      user: {
        id: "admin123",
      },
    };

    res = {};

    next = jest.fn();

    mockFind.mockReturnValue({
      populate: mockPopulate,
    });

    mockPopulate.mockReturnValue({
      sort: mockSort,
    });

    mockSort.mockReturnValue({
      skip: mockSkip,
    });

    mockSkip.mockReturnValue({
      limit: mockLimit,
    });

    mockFindById.mockReturnValue({
      populate: jest.fn(),
    });
  });

  describe("importCouponsController", () => {
    test("should import coupons successfully", async () => {
      const file = {
        originalname: "coupons.csv",
        buffer: Buffer.from(
          "code,discountType,discountValue"
        ),
      };

      const result = {
        importJobId: "import123",
        totalRows: 5,
        imported: 4,
        failed: 1,
        errors: [],
      };

      req.file = file;
      req.user.id = "admin123";

      mockImportCoupons.mockResolvedValue(
        result
      );

      await importCouponsController(
        req,
        res,
        next
      );

      expect(
        mockImportCoupons
      ).toHaveBeenCalledWith(
        file,
        "admin123"
      );

      expect(
        mockAppSuccess
      ).toHaveBeenCalledWith(res, {
        statusCode: 201,
        message: "CSV imported successfully",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    test("should reject when CSV file is missing", async () => {
      req.file = null;

      await importCouponsController(
        req,
        res,
        next
      );

      expect(next).toHaveBeenCalled();

      const error = next.mock.calls[0][0];

      expect(error.message).toBe(
        "CSV file is required"
      );

      expect(
        mockImportCoupons
      ).not.toHaveBeenCalled();

      expect(
        mockAppSuccess
      ).not.toHaveBeenCalled();
    });

    test("should pass service error to next", async () => {
      const file = {
        originalname: "coupons.csv",
        buffer: Buffer.from("csv-data"),
      };

      const error = new Error(
        "CSV import failed"
      );

      req.file = file;

      mockImportCoupons.mockRejectedValue(
        error
      );

      await importCouponsController(
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

  describe("getImportJobsController", () => {
    test("should return import jobs successfully", async () => {
      const imports = [
        {
          _id: "import1",
          fileName: "coupons1.csv",
          status: "COMPLETED",
        },
        {
          _id: "import2",
          fileName: "coupons2.csv",
          status: "PROCESSING",
        },
      ];

      const totalCount = 15;

      req.query = {
        page: "2",
        limit: "5",
      };

      mockLimit.mockResolvedValue(
        imports
      );

      mockCountDocuments.mockResolvedValue(
        totalCount
      );

      await getImportJobsController(
        req,
        res,
        next
      );

      expect(
        mockFind
      ).toHaveBeenCalledWith({});

      expect(
        mockPopulate
      ).toHaveBeenCalledWith(
        "uploadedBy",
        "name email role"
      );

      expect(
        mockSort
      ).toHaveBeenCalledWith({
        createdAt: -1,
      });

      expect(
        mockSkip
      ).toHaveBeenCalledWith(5);

      expect(
        mockLimit
      ).toHaveBeenCalledWith(5);

      expect(
        mockCountDocuments
      ).toHaveBeenCalledTimes(1);

      expect(
        mockAppSuccess
      ).toHaveBeenCalledWith(res, {
        message:
          "Import history fetched successfully",
        data: {
          imports,
          pagination: {
            totalCount: 15,
            page: 2,
            limit: 5,
            totalPages: 3,
          },
        },
      });

      expect(next).not.toHaveBeenCalled();
    });

    test("should use default page and limit", async () => {
      const imports = [];

      req.query = {};

      mockLimit.mockResolvedValue(
        imports
      );

      mockCountDocuments.mockResolvedValue(
        0
      );

      await getImportJobsController(
        req,
        res,
        next
      );

      expect(
        mockSkip
      ).toHaveBeenCalledWith(0);

      expect(
        mockLimit
      ).toHaveBeenCalledWith(10);

      expect(
        mockAppSuccess
      ).toHaveBeenCalledWith(res, {
        message:
          "Import history fetched successfully",
        data: {
          imports,
          pagination: {
            totalCount: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          },
        },
      });

      expect(next).not.toHaveBeenCalled();
    });

    test("should pass error to next", async () => {
      const error = new Error(
        "Failed to fetch import jobs"
      );

      mockLimit.mockRejectedValue(error);

      await getImportJobsController(
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

  describe("getImportJobByIdController", () => {
    test("should return import job by ID successfully", async () => {
      const importJob = {
        _id: "import123",
        fileName: "coupons.csv",
        status: "COMPLETED",
      };

      req.params.id = "import123";

      const mockJobPopulate = jest.fn();

      mockJobPopulate.mockResolvedValue(
        importJob
      );

      mockFindById.mockReturnValue({
        populate: mockJobPopulate,
      });

      await getImportJobByIdController(
        req,
        res,
        next
      );

      expect(
        mockFindById
      ).toHaveBeenCalledWith(
        "import123"
      );

      expect(
        mockJobPopulate
      ).toHaveBeenCalledWith(
        "uploadedBy",
        "name email role"
      );

      expect(
        mockAppSuccess
      ).toHaveBeenCalledWith(res, {
        message:
          "Import details fetched successfully",
        data: importJob,
      });

      expect(next).not.toHaveBeenCalled();
    });

    test("should reject when import job is not found", async () => {
      req.params.id = "invalid-import";

      const mockJobPopulate = jest.fn();

      mockJobPopulate.mockResolvedValue(
        null
      );

      mockFindById.mockReturnValue({
        populate: mockJobPopulate,
      });

      await getImportJobByIdController(
        req,
        res,
        next
      );

      expect(
        mockFindById
      ).toHaveBeenCalledWith(
        "invalid-import"
      );

      expect(next).toHaveBeenCalled();

      const error = next.mock.calls[0][0];

      expect(error.message).toBe(
        "Import job not found"
      );

      expect(
        mockAppSuccess
      ).not.toHaveBeenCalled();
    });

    test("should pass database error to next", async () => {
      const error = new Error(
        "Database error"
      );

      const mockJobPopulate = jest.fn();

      mockJobPopulate.mockRejectedValue(
        error
      );

      req.params.id = "import123";

      mockFindById.mockReturnValue({
        populate: mockJobPopulate,
      });

      await getImportJobByIdController(
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