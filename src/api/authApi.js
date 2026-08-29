import axiosInstance from './axiosInstance';

export const loginUser = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

export const fetchProfile = async () => {
  const response = await axiosInstance.get('/users/profile');
  return response.data;
};