export const allowedOrigins = {
  development: [
    "https://dev.domain.com",
    "https://dev.domain.com/",
    "https://www.dev.domain.com",
    "https://www.dev.domain.com/",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],

  test: [
    "https://uat.domain.com",
    "https://uat.domain.com/",
    "https://www.uat.domain.com",
    "https://www.uat.domain.com/",
  ],

  production: [
    "https://domain.com",
    "https://domain.com/",
    "https://www.domain.com",
    "https://www.domain.com/",
  ],
};


export const userRefreshTokenPath =
  "/api/users/auth/update-refresh-access";


// User
export const USER_ROLE = {
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER",
};


export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};


// Coupon
export const DISCOUNT_TYPE = {
  PERCENTAGE: "PERCENTAGE",
  FIXED: "FIXED",
};


export const COUPON_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  EXPIRED: "EXPIRED",
};


// Bulk CSV Import Status
export const IMPORT_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
};


// Redemption
export const REDEMPTION_STATUS = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  REVERTED: "REVERTED",
};


// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};


// Sorting
export const SORT_ORDER = {
  ASC: "asc",
  DESC: "desc",
};


// Analytics
export const ANALYTICS_PERIOD = {
  TODAY: "TODAY",
  WEEK: "WEEK",
  MONTH: "MONTH",
  YEAR: "YEAR",
};


// CSV Import
export const CSV_HEADERS = [
  "code",
  "description",
  "discountType",
  "discountValue",
  "maxDiscount",
  "usageLimit",
  "perCustomerLimit",
  "startDate",
  "expiryDate",
];


// File Upload
export const ALLOWED_FILE_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
];

export const MAX_CSV_SIZE = 5 * 1024 * 1024;