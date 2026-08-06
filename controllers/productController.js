import * as productService from "../services/productService.js";
import appSuccess from "../middlewares/appSuccess.js";

export const getAllProducts = async (req, res, next) => {
  try {
    const result = await productService.getAllProductsService(req.query);
    appSuccess(res, {
      message: "Products fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProductService(req.body);
    appSuccess(res, {
      statusCode: 201,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductByIdService(req.params.id);
    appSuccess(res, {
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProductService(
      req.params.id,
      req.body
    );
    appSuccess(res, {
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const deleted = await productService.deleteProductService(req.params.id);
    appSuccess(res, {
      message: "Product deleted successfully",
      data: { deleted },
    });
  } catch (error) {
    next(error);
  }
};

export const purchaseProduct = async (req, res, next) => {
  try {
    const product = await productService.purchaseProductService(
      req.params.id,
      req.body.quantity
    );
    appSuccess(res, {
      message: "Product purchased successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};
