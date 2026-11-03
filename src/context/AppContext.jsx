import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../api';

// ---------------------------------------------------------------------------
// Normalizers
// The API returns MongoDB documents (_id, populated refs, isRead, ...).
// Screens were written against a friendlier shape (id, postedBy, read, ...).
// Converting here (in one place) keeps every screen simple and guarantees the
// UI always reflects what the server actually returned.
// ---------------------------------------------------------------------------

const NOTIF_TITLES = {
  claim: 'Lost & Found Claim',
  'skill-request': 'Skill Exchange',
  event: 'Event Update',
  report: 'Content Report',
  marketplace: 'Marketplace',
  system: 'CampusHub'
};

const normalizeLost = (doc) => ({
  ...doc,
  id: doc._id,
  image: api.resolveFileUrl(doc.image),
  postedBy: doc.user || null,
  postedAt: doc.createdAt
});

const normalizeMarketItem = (doc) => ({
  ...doc,
  id: doc._id,
  image: api.resolveFileUrl(doc.image),
  postedAt: doc.createdAt
});

const normalizeEvent = (doc) => ({
  ...doc,
  id: doc._id,
  image: api.resolveFileUrl(doc.image),
  isRegistered: Boolean(doc.isRegistered),
  organizerName: doc.organizerName || 'Student Community'
});

const normalizeNote = (doc) => ({
  ...doc,
  id: doc._id,
  fileUrl: api.resolveFileUrl(doc.fileUrl),
  subject: doc.department
});

const normalizeSkill = (doc) => ({ ...doc, id: doc._id });

const normalizeSkillRequest = (doc) => ({
  ...doc,
  id: doc._id,
  fromUser: doc.fromUser || null,
  toUser: doc.toUser || null
});

const normalizeNotification = (doc) => ({
  ...doc,
  id: doc._id,
  read: Boolean(doc.isRead),
  title: NOTIF_TITLES[doc.type] || 'Notification'
});

const normalizeReport = (doc) => ({
  ...doc,
  id: doc._id,
  type: doc.targetType || 'Report',
  itemTitle: doc.targetTitle || doc.reason,
  reporterName: doc.reporter?.name || 'Student'
});

const normalizeUser = (user) => (user ? { ...user, id: user._id } : null);

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? normalizeUser(JSON.parse(saved)) : null;
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(false);

  // `null` while loading so screens can distinguish "loading" from "empty"
  const [lostItems, setLostItems] = useState([]);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [skills, setSkills] = useState([]);
  const [skillRequests, setSkillRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [adminReports, setAdminReports] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  const userId = currentUser?._id || currentUser?.id;

  const isAdmin = currentUser?.role === 'admin';

  // ---------------------------------------------------------------------------
  // Load everything the dashboard needs whenever a session exists
  // ---------------------------------------------------------------------------
  const loadAllData = useCallback(async () => {
    if (!userId) return;
    setDataLoading(true);
    try {
      const core = await Promise.allSettled([
        api.fetchLostFoundItems(),
        api.fetchMarketplaceItems(),
        api.fetchEvents(),
        api.fetchNotes(),
        api.fetchSkills(),
        api.fetchSkillRequests(),
        api.fetchNotifications()
      ]);
      const [lf, mp, ev, nt, sk, sr, notif] = core;
      if (lf.status === 'fulfilled' && Array.isArray(lf.value)) setLostItems(lf.value.map(normalizeLost));
      if (mp.status === 'fulfilled' && Array.isArray(mp.value)) setMarketplaceItems(mp.value.map(normalizeMarketItem));
      if (ev.status === 'fulfilled' && Array.isArray(ev.value)) setEvents(ev.value.map(normalizeEvent));
      if (nt.status === 'fulfilled' && Array.isArray(nt.value)) setNotes(nt.value.map(normalizeNote));
      if (sk.status === 'fulfilled' && Array.isArray(sk.value)) setSkills(sk.value.map(normalizeSkill));
      if (sr.status === 'fulfilled' && Array.isArray(sr.value)) setSkillRequests(sr.value.map(normalizeSkillRequest));
      if (notif.status === 'fulfilled' && Array.isArray(notif.value)) setNotifications(notif.value.map(normalizeNotification));

      // Admin-only datasets — never request them as a student (403 noise)
      if (isAdmin) {
        const adminData = await Promise.allSettled([
          api.fetchAdminReports(),
          api.fetchAdminUsers()
        ]);
        const [rep, usr] = adminData;
        if (rep.status === 'fulfilled' && Array.isArray(rep.value)) setAdminReports(rep.value.map(normalizeReport));
        if (usr.status === 'fulfilled' && Array.isArray(usr.value)) setAdminUsers(usr.value);
      }
    } catch (err) {
      console.warn('CampusHub: some data could not be loaded.', err);
    } finally {
      setDataLoading(false);
    }
  }, [userId, isAdmin]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ---------------------------------------------------------------------------
  // Authentication — NO silent demo fallback: failures surface to the UI
  // so a broken backend can never masquerade as a successful login.
  // ---------------------------------------------------------------------------
  const persistSession = (data) => {
    const user = normalizeUser(data);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
    return user;
  };

  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const data = await api.loginUser({ email, password });
      if (!data?.token) throw new Error('Login failed');
      return persistSession(data);
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setAuthLoading(true);
    try {
      const data = await api.registerUser({ name, email, password });
      if (!data?.token) throw new Error('Registration failed');
      return persistSession(data);
    } finally {
      setAuthLoading(false);
    }
  };

  // Requests a reset link for an email. The API always answers with the same
  // generic message (never reveals whether the account exists).
  const requestPasswordReset = async (email) => {
    const data = await api.forgotPassword(email);
    return { success: true, message: data?.message || 'If an account exists for that email, a password reset link has been sent.' };
  };

  // Completes the reset with the emailed token; the API logs the user in.
  const completePasswordReset = async (token, password) => {
    setAuthLoading(true);
    try {
      const data = await api.resetPassword(token, password);
      if (!data?.token) throw new Error('Reset failed');
      return persistSession(data);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setLostItems([]);
    setMarketplaceItems([]);
    setEvents([]);
    setNotes([]);
    setSkills([]);
    setSkillRequests([]);
    setNotifications([]);
    setAdminReports([]);
    setAdminUsers([]);
  };

  const refreshData = () => loadAllData();

  // ---------------------------------------------------------------------------
  // Lost & Found
  // ---------------------------------------------------------------------------
  const addLostItem = async (item) => {
    const created = await api.createLostFoundItem(item);
    const normalized = normalizeLost(created);
    setLostItems((prev) => [normalized, ...prev]);
    return normalized;
  };

  const toggleLostStatus = async (id, status) => {
    const updated = await api.updateLostFoundStatus(id, status);
    const normalized = normalizeLost(updated);
    setLostItems((prev) => prev.map((item) => (item.id === id ? normalized : item)));
    return normalized;
  };

  const claimLostItem = async (id, message) => {
    const updated = await api.claimLostFoundItem(id, message);
    const normalized = normalizeLost(updated);
    setLostItems((prev) => prev.map((item) => (item.id === id ? normalized : item)));
    return normalized;
  };

  const releaseLostClaim = async (id) => {
    const updated = await api.releaseLostFoundClaim(id);
    const normalized = normalizeLost(updated);
    setLostItems((prev) => prev.map((item) => (item.id === id ? normalized : item)));
    return normalized;
  };

  // ---------------------------------------------------------------------------
  // Marketplace
  // ---------------------------------------------------------------------------
  const addMarketplaceItem = async (item) => {
    const created = await api.createMarketplaceItem({ ...item, price: Number(item.price) });
    const normalized = normalizeMarketItem(created);
    setMarketplaceItems((prev) => [normalized, ...prev]);
    return normalized;
  };

  const markMarketplaceSold = async (id) => {
    const updated = await api.updateMarketplaceStatus(id, 'sold');
    const normalized = normalizeMarketItem(updated);
    setMarketplaceItems((prev) => prev.map((item) => (item.id === id ? normalized : item)));
    return normalized;
  };

  const contactSeller = async (id, message) => api.contactSeller(id, message);

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------
  const addEvent = async (event) => {
    const created = await api.createEvent(event);
    const normalized = normalizeEvent(created);
    setEvents((prev) => [normalized, ...prev]);
    return normalized;
  };

  const toggleEventRegister = async (id) => {
    const updated = await api.toggleEventRegisterApi(id);
    const normalized = normalizeEvent(updated);
    setEvents((prev) => prev.map((e) => (e.id === id ? normalized : e)));
    return normalized;
  };

  // ---------------------------------------------------------------------------
  // Notes
  // ---------------------------------------------------------------------------
  const addNote = async (note) => {
    const created = await api.createNote(note);
    const normalized = normalizeNote(created);
    setNotes((prev) => [normalized, ...prev]);
    return normalized;
  };

  const downloadNote = async (id) => {
    const updated = await api.incrementNoteDownload(id);
    const normalized = normalizeNote(updated);
    setNotes((prev) => prev.map((n) => (n.id === id ? normalized : n)));
    return normalized;
  };

  const rateNote = async (id, rating) => {
    const updated = await api.rateNote(id, rating);
    const normalized = normalizeNote(updated);
    setNotes((prev) => prev.map((n) => (n.id === id ? normalized : n)));
    return normalized;
  };

  // ---------------------------------------------------------------------------
  // Skill Exchange
  // ---------------------------------------------------------------------------
  const saveMySkillProfile = async (profile) => {
    const saved = await api.saveMySkillProfile(profile);
    const normalized = normalizeSkill(saved);
    setSkills((prev) => {
      const withoutMine = prev.filter((s) => s.id !== normalized.id && s.user?._id !== userId);
      return [normalized, ...withoutMine];
    });
    return normalized;
  };

  const sendSkillRequest = async (targetUserId, offered, wanted, message) => {
    const created = await api.sendSkillRequestApi({
      toUser: targetUserId,
      skillOffered: offered,
      skillWanted: wanted,
      message
    });
    const normalized = normalizeSkillRequest(created);
    setSkillRequests((prev) => [normalized, ...prev]);
    return normalized;
  };

  const respondSkillRequest = async (id, status) => {
    const updated = await api.respondSkillRequestApi(id, status);
    const normalized = normalizeSkillRequest(updated);
    setSkillRequests((prev) => prev.map((r) => (r.id === id ? normalized : r)));
    return normalized;
  };

  // ---------------------------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------------------------
  const markNotificationRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await api.markNotificationRead(id);
    } catch (err) {
      console.warn('Could not mark notification as read', err);
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.markAllNotificationsRead();
    } catch (err) {
      console.warn('Could not mark notifications as read', err);
    }
  };

  const dismissNotification = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await api.dismissNotification(id);
    } catch (err) {
      console.warn('Could not dismiss notification', err);
    }
  };

  // ---------------------------------------------------------------------------
  // Reports (students) + Admin
  // ---------------------------------------------------------------------------
  const submitReport = async ({ targetType, targetId, reason }) => {
    const created = await api.createReport({ targetType, targetId, reason });
    return created;
  };

  const resolveAdminReport = async (id, status) => {
    const updated = await api.resolveAdminReportApi(id, status);
    setAdminReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: updated.status } : r)));
    return updated;
  };

  const removeReportedContent = async (id) => {
    const result = await api.removeReportedContentApi(id);
    setAdminReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'reviewed' } : r)));
    return result;
  };

  const toggleUserSuspend = async (id) => {
    const updated = await api.toggleUserSuspendApi(id);
    setAdminUsers((prev) => prev.map((u) => ((u._id || u.id) === id ? { ...u, status: updated.status } : u)));
    return updated;
  };

  // ---------------------------------------------------------------------------
  // Profile + Settings
  // ---------------------------------------------------------------------------
  const updateProfile = async (updates) => {
    try {
      const data = await api.updateProfile(updates);
      const user = normalizeUser(data);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update profile' };
    }
  };

  const saveSettings = async (settings) => {
    try {
      const data = await api.updateSettings(settings);
      const user = { ...currentUser, settings: data.settings };
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to save settings' };
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        authLoading,
        dataLoading,
        setCurrentUser,
        login,
        register,
        requestPasswordReset,
        completePasswordReset,
        logout,
        refreshData,

        lostItems,
        addLostItem,
        toggleLostStatus,
        claimLostItem,
        releaseLostClaim,

        marketplaceItems,
        addMarketplaceItem,
        markMarketplaceSold,
        contactSeller,

        events,
        addEvent,
        toggleEventRegister,

        notes,
        addNote,
        downloadNote,
        rateNote,

        skills,
        skillRequests,
        saveMySkillProfile,
        sendSkillRequest,
        respondSkillRequest,

        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        dismissNotification,

        submitReport,

        adminReports,
        resolveAdminReport,
        removeReportedContent,
        adminUsers,
        toggleUserSuspend,

        updateProfile,
        saveSettings
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
