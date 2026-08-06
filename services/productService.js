import Product, { PRODUCT_STATUS } from "../models/productModel.js";
import AppError from "../middlewares/appError.js";
import { APIFeatures } from "../utils/apiFeatures.js";

export const getAllProductsService = async (filters) => {
  const query = Product.find();
  const apiFeatures = new APIFeatures(query, filters);

  await apiFeatures.process();

  return {
    products: apiFeatures.query,
    pagination: {
      totalCount: apiFeatures.totalCount,
      page: apiFeatures.page,
      limit: apiFeatures.limit,
    },
  };
};

export const createProductService = async (payload) => {
  const product = await Product.create(payload);
  return product;
};

export const getProductByIdService = async (id) => {
  const product = await Product.findById(id);

  if (!product) {
    throw new AppError("Product not found with this id", 404);
  }

  return product;
};

export const updateProductService = async (id, payload) => {
  const product = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new AppError("Product not found with this id", 404);
  }

  return product;
};

export const deleteProductService = async (id) => {
  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    throw new AppError("Product not found with this id", 404);
  }

  return product;
};

export const purchaseProductService = async (productId, quantity) => {
  const product = await Product.findOneAndUpdate(
    {
      _id: productId,
      status: PRODUCT_STATUS.ACTIVE,
      stock: { $gte: quantity },
    },
    { $inc: { stock: -quantity } },
    { new: true }
  );

  if (!product) {
    const existing = await Product.findById(productId);

    if (!existing) {
      throw new AppError("Product not found with this id", 404);
    }

    if (existing.status !== PRODUCT_STATUS.ACTIVE) {
      throw new AppError("Product is not available for purchase", 400);
    }

    if (existing.stock < quantity) {
      throw new AppError("Insufficient stock", 400);
    }
  }

  if (product && product.stock === 0) {
    product.status = PRODUCT_STATUS.OUT_OF_STOCK;
    await product.save();
  }

  return product;
};
