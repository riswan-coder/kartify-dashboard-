import API from './axios';

export const login = (credentials) =>
  API.post('/auth/login/', credentials);

export const logout = (refresh) =>
  API.post('/auth/logout/', { refresh });

export const getProfile = () =>
  API.get('/auth/profile/');