import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../api';

const defaultUser = {
  id: 'u1',
  name: 'Alex Johnson',
  email: 'alex.j@university.edu',
  role: 'student',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  major: 'Computer Science',
  year: 'Junior (Year 3)',
  university: 'State University',
  joinedDate: 'September 2023'
};

const initialLost = [
  {
    id: 'lf_1',
    title: 'Blue Leather Backpack',
    category: 'Bags',
    type: 'lost',
    location: 'Central Library, 2nd Floor',
    dateLost: '2026-08-24',
    description: 'Left near quiet study room 204. Contains a MacBook Air with stickers and spiral notebooks.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
    status: 'active',
    postedBy: defaultUser,
    postedAt: '2 hours ago'
  },
  {
    id: 'lf_2',
    title: 'Apple AirPods Pro Case',
    category: 'Electronics',
    type: 'found',
    location: 'Student Union Cafeteria',
    dateLost: '2026-08-25',
    description: 'Found on table near smoothie station. White wireless charging case with black protective cover.',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500',
    status: 'active',
    postedBy: defaultUser,
    postedAt: '5 hours ago'
  }
];

const initialMarket = [
  {
    id: 'mp_1',
    title: 'Calculus: Early Transcendentals (8th Ed)',
    price: 45,
    category: 'Books',
    condition: 'Good',
    description: 'Light highlighting on chapters 2-4. Binding intact. Great for MATH 101/102.',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
    status: 'available',
    seller: defaultUser,
    postedAt: '1 day ago'
  },
  {
    id: 'mp_2',
    title: 'Ergonomic Desk Chair',
    price: 80,
    category: 'Furniture',
    condition: 'Like New',
    description: 'Mesh back chair with lumbar support. Used for one semester. Moving out sale.',
    image: 'https://images.unsplash.com/photo-1580481072645-022f9a6d1296?w=500',
    status: 'available',
    seller: defaultUser,
    postedAt: '2 days ago'
  }
];

const initialEvents = [
  {
    id: 'ev_1',
    title: 'Annual Campus Hackathon 2026',
    description: '24-hour coding challenge. Build innovative projects, network with sponsors, and win prizes!',
    date: '2026-09-15',
    time: '09:00 AM',
    endTime: '09:00 AM',
    location: 'Engineering Complex, Hall A',
    capacity: 200,
    attendeeCount: 142,
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500',
    organizer: defaultUser,
    isRegistered: true
  },
  {
    id: 'ev_2',
    title: 'Career & Internship Fair',
    description: 'Connect with top employers hiring for tech, business, and creative roles.',
    date: '2026-09-20',
    time: '10:00 AM',
    endTime: '04:00 PM',
    location: 'Student Activity Center',
    capacity: 500,
    attendeeCount: 310,
    category: 'Career',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500',
    organizer: defaultUser,
    isRegistered: false
  }
];

const initialNotes = [
  {
    id: 'n_1',
    title: 'CS201 Data Structures Complete Study Guide',
    courseCode: 'CS 201',
    department: 'Computer Science',
    description: 'Detailed summary of Trees, Graphs, Sorting algorithms, and Big-O notation.',
    fileSize: '4.2 MB',
    pages: 28,
    downloads: 184,
    rating: 4.9,
    ratingCount: 32,
    uploader: defaultUser,
    uploadedAt: '3 days ago'
  }
];

const initialSkills = [
  {
    id: 'sk_1',
    user: defaultUser,
    userName: 'Alex Johnson',
    major: 'Computer Science',
    university: 'State University',
    offeredSkills: ['React', 'Node.js', 'Python'],
    wantedSkills: ['UI/UX Design', 'Figma', 'Public Speaking'],
    rating: 4.9,
    ratingCount: 15,
    bio: 'CS Junior passionate about web dev and AI. Looking to learn Figma design principles!'
  }
];

const initialNotifs = [
  {
    id: 'notif_1',
    title: 'Event Reminder',
    message: 'Annual Campus Hackathon starts in 3 days!',
    timestamp: '10 min ago',
    read: false,
    type: 'event'
  }
];

const initialReports = [
  {
    id: 'rep_1',
    type: 'Marketplace Listing',
    itemTitle: 'Suspiciously Low Price iPhone',
    reason: 'Potential scam item',
    status: 'pending',
    reportedBy: 'Student'
  }
];

const initialAdminUsers = [
  { id: 'u1', name: 'Alex Johnson', email: 'alex.j@university.edu', role: 'student', university: 'State University', status: 'active' },
  { id: 'u2', name: 'Sarah Miller', email: 'sarah.m@university.edu', role: 'student', university: 'State University', status: 'active' },
  { id: 'u3', name: 'Admin Account', email: 'admin@campushub.edu', role: 'admin', university: 'State University', status: 'active' }
];

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authLoading, setAuthLoading] = useState(false); // localStorage read above is synchronous, so this is instant
  
  const [lostItems, setLostItems] = useState(initialLost);
  const [marketplaceItems, setMarketplaceItems] = useState(initialMarket);
  const [events, setEvents] = useState(initialEvents);
  const [notes, setNotes] = useState(initialNotes);
  const [skills, setSkills] = useState(initialSkills);
  const [skillRequests, setSkillRequests] = useState([]);
  const [notifications, setNotifications] = useState(initialNotifs);
  const [adminReports, setAdminReports] = useState(initialReports);
  const [adminUsers, setAdminUsers] = useState(initialAdminUsers);

  // Sync with backend API on mount
  useEffect(() => {
    const loadBackendData = async () => {
      try {
        const [lfData, mpData, evData, ntData, skData, notifData, repData, usrData] = await Promise.allSettled([
          api.fetchLostFoundItems(),
          api.fetchMarketplaceItems(),
          api.fetchEvents(),
          api.fetchNotes(),
          api.fetchSkills(),
          api.fetchNotifications(),
          api.fetchAdminReports(),
          api.fetchAdminUsers()
        ]);

        if (lfData.status === 'fulfilled' && Array.isArray(lfData.value)) setLostItems(lfData.value);
        if (mpData.status === 'fulfilled' && Array.isArray(mpData.value)) setMarketplaceItems(mpData.value);
        if (evData.status === 'fulfilled' && Array.isArray(evData.value)) setEvents(evData.value);
        if (ntData.status === 'fulfilled' && Array.isArray(ntData.value)) setNotes(ntData.value);
        if (skData.status === 'fulfilled' && Array.isArray(skData.value)) setSkills(skData.value);
        if (notifData.status === 'fulfilled' && Array.isArray(notifData.value)) setNotifications(notifData.value);
        if (repData.status === 'fulfilled' && Array.isArray(repData.value)) setAdminReports(repData.value);
        if (usrData.status === 'fulfilled' && Array.isArray(usrData.value)) setAdminUsers(usrData.value);
      } catch (err) {
        console.warn('Backend API sync notice: running with current state cache.', err);
      }
    };

    loadBackendData();
  }, []);

  // Authentication Actions
  const login = async (email, password) => {
    try {
      const data = await api.loginUser({ email, password });
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setCurrentUser(data);
        return data;
      }
    } catch (err) {
      // Fallback demo login
      const demoUser = { ...defaultUser, email, role: email.includes('admin') ? 'admin' : 'student' };
      setCurrentUser(demoUser);
      localStorage.setItem('user', JSON.stringify(demoUser));
      return demoUser;
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await api.registerUser({ name, email, password });
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setCurrentUser(data);
        return data;
      }
    } catch (err) {
      const demoUser = { ...defaultUser, name, email };
      setCurrentUser(demoUser);
      localStorage.setItem('user', JSON.stringify(demoUser));
      return demoUser;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Lost & Found Actions
  const addLostItem = async (item) => {
    const newItem = {
      id: `lf_${Date.now()}`,
      ...item,
      status: 'active',
      postedBy: currentUser,
      postedAt: 'Just now'
    };
    setLostItems(prev => [newItem, ...prev]);
    try {
      await api.createLostFoundItem(item);
    } catch (err) { console.error(err); }
    return newItem;
  };

  const toggleLostStatus = async (id) => {
    setLostItems(prev => prev.map(item =>
      (item.id === id || item._id === id) ? { ...item, status: item.status === 'active' ? 'resolved' : 'active' } : item
    ));
    try {
      await api.updateLostFoundStatus(id);
    } catch (err) { console.error(err); }
  };

  // Marketplace Actions
  const addMarketplaceItem = async (item) => {
    const newItem = {
      id: `mp_${Date.now()}`,
      ...item,
      price: Number(item.price),
      status: 'available',
      seller: currentUser,
      postedAt: 'Just now'
    };
    setMarketplaceItems(prev => [newItem, ...prev]);
    try {
      await api.createMarketplaceItem(item);
    } catch (err) { console.error(err); }
    return newItem;
  };

  const markMarketplaceSold = async (id) => {
    setMarketplaceItems(prev => prev.map(item => (item.id === id || item._id === id) ? { ...item, status: 'sold' } : item));
    try {
      await api.updateMarketplaceStatus(id, 'sold');
    } catch (err) { console.error(err); }
  };

  // Event Actions
  const addEvent = async (event) => {
    const newEvent = {
      id: `ev_${Date.now()}`,
      ...event,
      capacity: Number(event.capacity),
      attendeeCount: 1,
      organizer: currentUser,
      isRegistered: true,
      category: event.category || 'Academic'
    };
    setEvents(prev => [newEvent, ...prev]);
    try {
      await api.createEvent(event);
    } catch (err) { console.error(err); }
    return newEvent;
  };

  const toggleEventRegister = async (id) => {
    setEvents(prev => prev.map(e => {
      if (e.id === id || e._id === id) {
        const isReg = e.isRegistered;
        return {
          ...e,
          isRegistered: !isReg,
          attendeeCount: isReg ? Math.max(0, (e.attendeeCount || 1) - 1) : (e.attendeeCount || 0) + 1
        };
      }
      return e;
    }));
    try {
      await api.toggleEventRegisterApi(id);
    } catch (err) { console.error(err); }
  };

  // Notes Actions
  const addNote = async (note) => {
    const newNote = {
      id: `n_${Date.now()}`,
      ...note,
      pages: Number(note.pages) || 5,
      uploader: currentUser,
      fileSize: '2.4 MB',
      downloads: 0,
      rating: 5.0,
      ratingCount: 1,
      uploadedAt: 'Just now'
    };
    setNotes(prev => [newNote, ...prev]);
    try {
      await api.createNote(note);
    } catch (err) { console.error(err); }
    return newNote;
  };

  // Skill Actions
  const sendSkillRequest = async (targetUser, offered, wanted, message) => {
    const newReq = {
      id: `sr_${Date.now()}`,
      fromUser: currentUser,
      toUser: targetUser,
      skillOffered: offered,
      skillWanted: wanted,
      message,
      status: 'pending',
      sentAt: new Date().toISOString()
    };
    setSkillRequests(prev => [...prev, newReq]);
    try {
      await api.sendSkillRequestApi({ toUser: targetUser, skillOffered: offered, skillWanted: wanted, message });
    } catch (err) { console.error(err); }
  };

  const respondSkillRequest = async (id, status) => {
    setSkillRequests(prev => prev.map(r => (r.id === id || r._id === id) ? { ...r, status } : r));
    try {
      await api.respondSkillRequestApi(id, status);
    } catch (err) { console.error(err); }
  };

  // Notifications Actions
  const markNotificationRead = async (id) => {
    setNotifications(prev => prev.map(n => (n.id === id || n._id === id) ? { ...n, read: true } : n));
    try {
      await api.markNotificationRead(id);
    } catch (err) { console.error(err); }
  };

  const markAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await api.markAllNotificationsRead();
    } catch (err) { console.error(err); }
  };

  const dismissNotification = async (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id && n._id !== id));
    try {
      await api.dismissNotification(id);
    } catch (err) { console.error(err); }
  };

  // Admin Actions
  const resolveAdminReport = async (id, status) => {
    setAdminReports(prev => prev.map(r => (r.id === id || r._id === id) ? { ...r, status } : r));
    try {
      await api.resolveAdminReportApi(id, status);
    } catch (err) { console.error(err); }
  };

  const toggleUserSuspend = async (id) => {
    setAdminUsers(prev => prev.map(u => (u.id === id || u._id === id) ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u));
    try {
      await api.toggleUserSuspendApi(id);
    } catch (err) { console.error(err); }
  };
  
  const updateProfile = async (updates) => {
  try {
    const data = await api.updateProfile(updates);
    setCurrentUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || 'Failed to update profile' };
  }
};


    return (
    <AppContext.Provider value={{
      currentUser, authLoading,updateProfile, login, register, logout, setCurrentUser,
      lostItems, addLostItem, toggleLostStatus,
      marketplaceItems, addMarketplaceItem, markMarketplaceSold,
      events, addEvent, toggleEventRegister,
      notes, addNote,
      skills, skillRequests, sendSkillRequest, respondSkillRequest,
      notifications, markNotificationRead, markAllNotificationsRead, dismissNotification,
      adminReports, resolveAdminReport, adminUsers, toggleUserSuspend
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);