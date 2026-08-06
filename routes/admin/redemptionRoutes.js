import express from "express";

import {
  getAllRedemptionsController,
  revertRedemptionController,
} from "../../controllers/redemptionController.js";


import {
  verifyToken,
  authorize,
} from "../../middlewares/auth.js";


import {
  validate,
} from "../../middlewares/validations.js";


import {
  revertRedemptionSchema,
} from "../../utils/validationSchemas/redemptionSchema.js";


const router = express.Router();


// Admin Authentication
router.use(verifyToken);


// Get All Redemptions
router.get(
  "/",
  authorize("ADMIN"),
  getAllRedemptionsController
);


// Revert Redemption
router.patch(
  "/:id/revert",
  authorize("ADMIN"),
  validate(revertRedemptionSchema),
  revertRedemptionController
);


export default router;