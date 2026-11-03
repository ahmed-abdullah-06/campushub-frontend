import axiosInstance from './axiosInstance';

/**
 * The API baseURL (e.g. http://localhost:5000/api or https://my-api.onrender.com/api).
 * Uploaded files are stored as RELATIVE paths in the database (/uploads/x.jpg)
 * so the same record works on localhost and in production. This helper turns
 * them back into absolute URLs the browser can load.
 */
export const getApiOrigin = () => {
  const base = axiosInstance.defaults?.baseURL || 'http://localhost:5000/api';
  return base.replace(/\/api\/?$/, '');
};

export const resolveFileUrl = (url) => {
  if (!url) return '';
  if (/^(https?:)?\/\//.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url; // absolute or inline — use as-is
  }
  return `${getApiOrigin()}${url.startsWith('/') ? '' : '/'}${url}`;
};

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------
export const loginUser = async (credentials) => {
  const res = await axiosInstance.post('/auth/login', credentials);
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await axiosInstance.post('/auth/register', userData);
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await axiosInstance.post('/auth/forgot-password', { email });
  return res.data;
};

export const resetPassword = async (token, password) => {
  const res = await axiosInstance.post('/auth/reset-password', { token, password });
  return res.data;
};

export const fetchProfile = async () => {
  const res = await axiosInstance.get('/users/profile');
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await axiosInstance.put('/users/profile', data);
  return res.data;
};

export const updateSettings = async (data) => {
  const res = await axiosInstance.put('/users/settings', data);
  return res.data;
};

// ---------------------------------------------------------------------------
// Lost & Found API
// ---------------------------------------------------------------------------
export const fetchLostFoundItems = async (params = {}) => {
  const res = await axiosInstance.get('/lost-found', { params });
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

export const deleteLostFoundItem = async (id) => {
  const res = await axiosInstance.delete(`/lost-found/${id}`);
  return res.data;
};

export const claimLostFoundItem = async (id, message) => {
  const res = await axiosInstance.post(`/lost-found/${id}/claim`, { message });
  return res.data;
};

export const releaseLostFoundClaim = async (id) => {
  const res = await axiosInstance.delete(`/lost-found/${id}/claim`);
  return res.data;
};

// ---------------------------------------------------------------------------
// Marketplace API
// ---------------------------------------------------------------------------
export const fetchMarketplaceItems = async (params = {}) => {
  const res = await axiosInstance.get('/marketplace', { params });
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

export const deleteMarketplaceItem = async (id) => {
  const res = await axiosInstance.delete(`/marketplace/${id}`);
  return res.data;
};

export const contactSeller = async (id, message) => {
  const res = await axiosInstance.post(`/marketplace/${id}/contact`, { message });
  return res.data; // { message, seller: { name, email, university } }
};

// ---------------------------------------------------------------------------
// Events API
// ---------------------------------------------------------------------------
export const fetchEvents = async (params = {}) => {
  const res = await axiosInstance.get('/events', { params });
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

export const deleteEvent = async (id) => {
  const res = await axiosInstance.delete(`/events/${id}`);
  return res.data;
};

// ---------------------------------------------------------------------------
// Notes API
// ---------------------------------------------------------------------------
export const fetchNotes = async (params = {}) => {
  const res = await axiosInstance.get('/notes', { params });
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

export const rateNote = async (id, rating) => {
  const res = await axiosInstance.put(`/notes/${id}/rate`, { rating });
  return res.data;
};

export const deleteNote = async (id) => {
  const res = await axiosInstance.delete(`/notes/${id}`);
  return res.data;
};

// ---------------------------------------------------------------------------
// Skills API
// ---------------------------------------------------------------------------
export const fetchSkills = async (params = {}) => {
  const res = await axiosInstance.get('/skills', { params });
  return res.data;
};

export const saveMySkillProfile = async (data) => {
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

// ---------------------------------------------------------------------------
// Notifications API
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Reports API (students flag inappropriate content)
// ---------------------------------------------------------------------------
export const createReport = async (data) => {
  const res = await axiosInstance.post('/reports', data);
  return res.data;
};

export const fetchMyReports = async () => {
  const res = await axiosInstance.get('/reports/mine');
  return res.data;
};

// ---------------------------------------------------------------------------
// Admin API
// ---------------------------------------------------------------------------
export const fetchAdminReports = async (status) => {
  const res = await axiosInstance.get('/admin/reports', { params: status ? { status } : {} });
  return res.data;
};

export const resolveAdminReportApi = async (id, status) => {
  const res = await axiosInstance.put(`/admin/reports/${id}`, { status });
  return res.data;
};

export const removeReportedContentApi = async (id) => {
  const res = await axiosInstance.delete(`/admin/reports/${id}/content`);
  return res.data;
};

export const fetchAdminUsers = async () => {
  const res = await axiosInstance.get('/admin/users');
  return res.data;
};

export const fetchAdminStats = async () => {
  const res = await axiosInstance.get('/admin/stats');
  return res.data;
};

export const toggleUserSuspendApi = async (id) => {
  const res = await axiosInstance.put(`/admin/users/${id}/suspend`);
  return res.data;
};

// ---------------------------------------------------------------------------
// Uploads API
// ---------------------------------------------------------------------------
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const res = await axiosInstance.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data; // { imageUrl: "/uploads/..." }
};

export const uploadNoteFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axiosInstance.post('/upload/note', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data; // { fileUrl, fileName, fileSize }
};
