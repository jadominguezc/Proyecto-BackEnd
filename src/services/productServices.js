import productRepository from "../repositories/productRepository.js";

export const getProducts = async ({ limit, page, sort, query }) => {
  const filter = query ? { title: new RegExp(query, "i") } : {};
  const options = {
    limit: parseInt(limit, 10) || 10,
    page: parseInt(page, 10) || 1,
    sort: sort ? { price: sort === "asc" ? 1 : -1 } : {},
  };

  return await productRepository.getProducts(filter, options);
};

export const createProduct = async (productData) => {
  return await productRepository.addProduct(productData);
};

export const deleteProduct = async (productId) => {
  return await productRepository.removeProduct(productId);
};
