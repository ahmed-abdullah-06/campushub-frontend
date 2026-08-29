import axiosInstance from './axiosInstance';

export const fetchLostFoundPosts = async (params) => {
  const response = await axiosInstance.get('/lost-found', { params });
  return response.data;
};

export const createLostFoundPost = async (postData) => {
  const response = await axiosInstance.post('/lost-found', postData);
  return response.data;
};

export const updateLostFoundStatus = async (id, status) => {
  const response = await axiosInstance.patch(`/lost-found/${id}/status`, { status });
  return response.data;
};