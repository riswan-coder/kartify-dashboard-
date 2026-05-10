import API from './axios';

export const getMyProducts = () => API.get('/products/my-products/');
export const createProduct = (data) => API.post('/products/my-products/', data);
export const updateProduct = (id, data) => API.patch(`/products/my-products/${id}/`, data);
export const deleteProduct = (id) => API.delete(`/products/my-products/${id}/`);
export const getCategories = () => API.get('/products/categories/');