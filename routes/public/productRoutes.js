import express from "express";
import { getAllProducts, purchaseProduct } from "../../controllers/productController.js";
import { validateRequest } from "../../middlewares/validations.js";
import { purchaseProductSchema } from "../../utils/validationSchemas/productSchema.js";

const router = express.Router();

router.get("/", getAllProducts);
router.post("/:id/purchase", validateRequest(purchaseProductSchema), purchaseProduct);

export default router;
