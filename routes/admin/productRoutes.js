import express from "express";
import {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  purchaseProduct,
} from "../../controllers/productController.js";
import { verifyToken, authorize } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validations.js";
import {
  createProductSchema,
  updateProductSchema,
  purchaseProductSchema,
} from "../../utils/validationSchemas/productSchema.js";

const router = express.Router();

router.get("/", verifyToken, authorize("ADMIN"), getAllProducts);
router.post(
  "/",
  verifyToken,
  authorize("ADMIN"),
  validateRequest(createProductSchema),
  createProduct
);
router.get("/:id", verifyToken, authorize("ADMIN"), getProductById);
router.put(
  "/:id",
  verifyToken,
  authorize("ADMIN"),
  validateRequest(updateProductSchema),
  updateProduct
);
router.delete("/:id", verifyToken, authorize("ADMIN"), deleteProduct);
router.post(
  "/:id/purchase",
  verifyToken,
  purchaseProduct
);

export default router;
