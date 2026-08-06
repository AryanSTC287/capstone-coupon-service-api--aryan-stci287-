# Coupon Redemption Service Backend

A scalable Node.js REST API backend for managing coupons, redemptions, users, and admin operations.

This service provides authentication, role-based access control, coupon lifecycle management, redemption tracking, analytics, and CSV-based coupon import/export functionality.

---

## Features

### Authentication & Authorization

- User registration and login
- JWT based authentication
- Access token and refresh token handling
- Role-based authorization

Supported roles:

- Admin
- Customer
- Support Agent
- System Service Account


---

##  Coupon Management(CRUD OPERATIONS)

Admin can:

- Create coupons
- View coupons
- Get coupon details
- Update coupons
- Delete coupons
- Manage coupon availability
- Track coupon usage


---

##  Redemption Management

Customer:

- Redeem coupons
- View redemption history


Admin:

- View all redemptions
- Manage redemption records
- Revert redemptions


---

##  Admin Features

Includes:

- User management
- Product management
- Analytics dashboard APIs
- Audit logs


---

## CSV Operations

### Coupon Import

Admin can upload CSV files to bulk create coupons.

Endpoint:
