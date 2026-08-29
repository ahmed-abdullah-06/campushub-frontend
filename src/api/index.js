import axiosInstance from './axiosInstance';

// Auth API
export const loginUser = async (credentials) => {
  const res = await axiosInstance.post('/auth/login', credentials);
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await axiosInstance.post('/auth/register', userData);
  return res.data;
};

export const fetchProfile = async () => {
  const res = await axiosInstance.get('/users/profile');
  return res.data;
};

// Lost & Found API
export const fetchLostFoundItems = async () => {
  const res = await axiosInstance.get('/lost-found');
  return res.data;
};

export const createLostFoundItem = async (data) => {
  const res = await axiosInstance.post('/lost-found', data);
  return res.data;
};

export const updateLostFoundStatus = async (id, status) => {
  const res = await axiosInstance.patch(`/lost-found/${id}/status`, { status });
  return res.data;
};

// Marketplace API
export const fetchMarketplaceItems = async () => {
  const res = await axiosInstance.get('/marketplace');
  return res.data;
};

export const createMarketplaceItem = async (data) => {
  const res = await axiosInstance.post('/marketplace', data);
  return res.data;
};

export const updateMarketplaceStatus = async (id, status) => {
  const res = await axiosInstance.patch(`/marketplace/${id}/status`, { status });
  return res.data;
};

// Events API
export const fetchEvents = async () => {
  const res = await axiosInstance.get('/events');
  return res.data;
};

export const createEvent = async (data) => {
  const res = await axiosInstance.post('/events', data);
  return res.data;
};

export const toggleEventRegisterApi = async (id) => {
  const res = await axiosInstance.put(`/events/${id}/register`);
  return res.data;
};

// Notes API
export const fetchNotes = async () => {
  const res = await axiosInstance.get('/notes');
  return res.data;
};

export const createNote = async (data) => {
  const res = await axiosInstance.post('/notes', data);
  return res.data;
};

export const incrementNoteDownload = async (id) => {
  const res = await axiosInstance.put(`/notes/${id}/download`);
  return res.data;
};

// Skills API
export const fetchSkills = async () => {
  const res = await axiosInstance.get('/skills');
  return res.data;
};

export const createSkill = async (data) => {
  const res = await axiosInstance.post('/skills', data);
  return res.data;
};

export const fetchSkillRequests = async () => {
  const res = await axiosInstance.get('/skills/requests');
  return res.data;
};

export const sendSkillRequestApi = async (data) => {
  const res = await axiosInstance.post('/skills/requests', data);
  return res.data;
};

export const respondSkillRequestApi = async (id, status) => {
  const res = await axiosInstance.put(`/skills/requests/${id}`, { status });
  return res.data;
};

// Notifications API
export const fetchNotifications = async () => {
  const res = await axiosInstance.get('/notifications');
  return res.data;
};

export const markNotificationRead = async (id) => {
  const res = await axiosInstance.put(`/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await axiosInstance.put('/notifications/read-all');
  return res.data;
};

export const dismissNotification = async (id) => {
  const res = await axiosInstance.delete(`/notifications/${id}`);
  return res.data;
};

// Admin API
export const fetchAdminReports = async () => {
  const res = await axiosInstance.get('/admin/reports');
  return res.data;
};

export const resolveAdminReportApi = async (id, status) => {
  const res = await axiosInstance.put(`/admin/reports/${id}`, { status });
  return res.data;
};

export const fetchAdminUsers = async () => {
  const res = await axiosInstance.get('/admin/users');
  return res.data;
};

export const toggleUserSuspendApi = async (id) => {
  const res = await axiosInstance.put(`/admin/users/${id}/suspend`);
  return res.data;
};
