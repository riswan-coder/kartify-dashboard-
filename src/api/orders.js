import API from './axios';

export const getShopOrders = () => API.get('/orders/shop/');
export const updateOrderStatus = (id, status) =>
  API.patch(`/orders/shop/${id}/update/`, { status });
export const getAllOrders = () => API.get('/orders/admin/all/');