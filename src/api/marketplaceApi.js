import axiosInstance from './axiosInstance';

export const fetchMarketplaceItems = async (params) => {
  const response = await axiosInstance.get('/marketplace', { params });
  return response.data;
};

export const createMarketplaceItem = async (itemData) => {
  const response = await axiosInstance.post('/marketplace', itemData);
  return response.data;
};

export const updateMarketplaceStatus = async (id, status) => {
  const response = await axiosInstance.patch(`/marketplace/${id}/status`, { status });
  return response.data;
};