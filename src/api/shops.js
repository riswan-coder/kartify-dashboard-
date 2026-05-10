import API from './axios';

export const getAllShops = () => API.get('/shops/admin/all/');
export const getMyShop = () => API.get('/shops/my-shop/');
export const createShop = (data) => API.post('/shops/create/', data);
export const updateMyShop = (data) => API.patch('/shops/my-shop/', data);
export const toggleShop = (id, isActive) =>
  API.patch(`/shops/${id}/update/`, { is_active: isActive });
export const deleteShop = (id) => API.delete(`/shops/${id}/delete/`);