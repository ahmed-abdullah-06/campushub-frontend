import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Drawer, AppBar, Toolbar, Typography, InputBase,
  IconButton, Badge, Avatar, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Chip, Divider, Menu, MenuItem,
  ListItemIcon as MenuItemIcon, useMediaQuery, Paper, InputAdornment, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HomeIcon from '@mui/icons-material/Home';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import BoltIcon from '@mui/icons-material/Bolt';
import EventIcon from '@mui/icons-material/Event';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useApp } from '../context/AppContext';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 240;

export default function MainLayout({ currentScreen, onNavigate, children }) {
  const {
    currentUser, notifications, logout, dataLoading,
    lostItems, marketplaceItems, events, notes, skills
  } = useApp();
  const [anchorEl, setAnchorEl] = useState(null); // controls the top-right profile dropdown
  const menuOpen = Boolean(anchorEl);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // phones + small tablets
  const [mobileOpen, setMobileOpen] = useState(false); // controls the collapsible drawer on mobile

  const userName = currentUser ? currentUser.name : 'Student';
  const unreadCount = notifications ? notifications.filter(n => !(n.read || n.isRead)).length : 0;

  // ---------------------------------------------------------------------
  // Global search — searches across every loaded module at once and jumps
  // to the matching screen when a result is picked.
  // ---------------------------------------------------------------------
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const pick = (item, screen, label, extra, type) => {
      const haystack = [label, extra, item.description, item.category, item.location,
        item.subject, item.department, item.name, item.status].filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(q)) return null;
      return { key: `${screen}-${item.id || item._id}`, screen, label, type, extra };
    };

    const results = [];
    (lostItems || []).forEach(i => {
      const r = pick(i, 'lost-found', i.title, i.location, 'Lost & Found'); if (r) results.push(r);
    });
    (marketplaceItems || []).forEach(i => {
      const r = pick(i, 'marketplace', i.title, i.condition, 'Marketplace'); if (r) results.push(r);
    });
    (events || []).forEach(i => {
      const r = pick(i, 'events', i.title, i.location, 'Event'); if (r) results.push(r);
    });
    (notes || []).forEach(i => {
      const r = pick(i, 'notes', i.title, i.subject, 'Note'); if (r) results.push(r);
    });
    (skills || []).forEach(i => {
      const skillsStr = [...(i.offeredSkills || []), ...(i.wantedSkills || [])].join(' ');
      const r = pick(i, 'skills', i.userName, skillsStr, 'Skill Profile'); if (r) results.push(r);
    });
    return results.slice(0, 8);
  }, [query, lostItems, marketplaceItems, events, notes, skills]);

  const handleSearchPick = (result) => {
    setQuery('');
    setSearchOpen(false);
    onNavigate(result.screen);
  };

  // Close the results dropdown when clicking anywhere outside the search box
  useEffect(() => {
    if (!searchOpen) return undefined;
    const onPointerDown = (e) => {
      if (!e.target.closest?.('[data-campus-search]')) setSearchOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [searchOpen]);

  const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon /> },
  { id: 'lost-found', label: 'Lost & Found', icon: <LocationOnIcon /> },
  { id: 'marketplace', label: 'Marketplace', icon: <ShoppingBagIcon /> },
  { id: 'skills', label: 'Skill Exchange', icon: <BoltIcon /> },
  { id: 'events', label: 'Events', icon: <EventIcon /> },
  { id: 'notes', label: 'Notes', icon: <MenuBookIcon /> },
  { id: 'notifications', label: 'Notifications', icon: <NotificationsIcon />, badge: unreadCount || null },
  { id: 'profile', label: 'My Profile', icon: <PersonIcon /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
  ...(currentUser?.role === 'admin' ? [{ id: 'admin', label: 'Admin Panel', icon: <AdminPanelSettingsIcon />, admin: true }] : []),
];

  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleMenuNavigate = (screen) => {
  handleMenuClose(); // close (and let focus release) BEFORE changing the screen
  onNavigate(screen);
};
  const handleMenuLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleNavClick = (id) => {
    onNavigate(id);
    if (isMobile) setMobileOpen(false); // auto-close the drawer after picking a page on mobile
  };

  // The actual sidebar content — shared between the mobile (temporary) and desktop (permanent) drawers
  const drawerContent = (
    <>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <HomeIcon fontSize="small" />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
          CampusHub
        </Typography>
      </Box>

      <Typography variant="caption" sx={{ px: 3, pt: 1, pb: 0.5, color: '#9CA3AF', fontWeight: 700, letterSpacing: 1 }}>
        MAIN
      </Typography>

      <List sx={{ px: 1.5, flex: 1 }}>
        {menuItems.map((item) => {
          const active = currentScreen === item.id;
          return (
            <ListItem disablePadding key={item.id} sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavClick(item.id)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: active ? '#EEF2FF' : 'transparent',
                  color: active ? 'primary.main' : '#4B5563',
                  '&:hover': { backgroundColor: active ? '#EEF2FF' : '#F9FAFB' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: active ? 'primary.main' : '#9CA3AF' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} slotProps={{ primary: { fontSize: '0.875rem', fontWeight: active ? 600 : 500 } }} />
                {item.badge && (
                  <Chip label={item.badge} size="small" color="primary" sx={{ height: 20, fontSize: '0.75rem', fontWeight: 700 }} />
                )}
                {item.admin && (
                  <Chip label="Admin" size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#FEF3C7', color: '#D97706', fontWeight: 600 }} />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: '#F3F4F6' }} />

      {/* Profile Footer */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: '0.875rem' }}>
          {userName[0]}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>{userName}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block">State University</Typography>
        </Box>
        <IconButton size="small" color="default" onClick={logout} title="Sign Out">
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Desktop: permanent sidebar, always visible */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' }, // hidden on mobile, shown from md up
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderColor: '#F3F4F6',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile: temporary sidebar, opens over content when hamburger is tapped */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid #F3F4F6', color: 'text.primary' }}>
          <Toolbar sx={{ justifyContent: 'space-between', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
              {/* Hamburger only shows on mobile */}
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setMobileOpen(true)}
                sx={{ display: { xs: 'inline-flex', md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>

              <Box data-campus-search sx={{ position: 'relative', display: 'flex', alignItems: 'center', width: { xs: '100%', sm: 260, md: 320 }, maxWidth: '100%' }}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', bgcolor: '#F9FAFB', px: 2, py: 0.5, borderRadius: 8,
                  width: '100%', maxWidth: '100%',
                  '&:focus-within': { boxShadow: '0 0 0 2px #EEF2FF' },
                }}>
                  <SearchIcon sx={{ color: '#9CA3AF', mr: 1, fontSize: 20, flexShrink: 0 }} />
                  <InputBase
                    placeholder="Search items, events, notes..."
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
                    onFocus={() => setSearchOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchResults.length > 0) handleSearchPick(searchResults[0]);
                      if (e.key === 'Escape') { setSearchOpen(false); e.currentTarget.blur(); }
                    }}
                    endAdornment={
                      dataLoading && query.trim().length >= 2 ? (
                        <InputAdornment position="end"><CircularProgress size={16} /></InputAdornment>
                      ) : null
                    }
                    sx={{ fontSize: '0.875rem', width: '100%' }}
                  />
                </Box>

                {/* Cross-module search results */}
                {searchOpen && query.trim().length >= 2 && (
                  <Paper
                    elevation={3}
                    sx={{
                      position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 1300,
                      maxHeight: 340, overflowY: 'auto', borderRadius: 2, border: '1px solid #F3F4F6',
                    }}
                  >
                    {searchResults.length === 0 ? (
                      <Box sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {dataLoading ? 'Loading campus data…' : `No matches for “${query.trim()}”`}
                        </Typography>
                      </Box>
                    ) : (
                      searchResults.map((r) => (
                        <Box
                          key={r.key}
                          onClick={() => handleSearchPick(r)}
                          sx={{
                            px: 2, py: 1.25, cursor: 'pointer', display: 'flex', alignItems: 'center',
                            gap: 1.5, '&:hover': { bgcolor: '#F9FAFB' },
                          }}
                        >
                          <Chip label={r.type} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem', flexShrink: 0 }} />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>{r.label}</Typography>
                            {r.extra && (
                              <Typography variant="caption" color="text.secondary" noWrap display="block">{r.extra}</Typography>
                            )}
                          </Box>
                        </Box>
                      ))
                    )}
                  </Paper>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              <IconButton color="inherit" onClick={() => onNavigate('notifications')}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              <Box
                onClick={handleAvatarClick}
                sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', borderRadius: 2, px: 1, py: 0.5, '&:hover': { bgcolor: '#F9FAFB' } }}
              >
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.8rem' }}>
                  {userName[0]}
                </Avatar>
                {/* First name hides on very small screens to save space */}
                <Typography variant="body2" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                  {userName.split(' ')[0]}
                </Typography>
              </Box>

              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={(e) => { e.currentTarget.blur(); handleMenuNavigate('profile'); }}>
                  <MenuItemIcon sx={{ minWidth: 34 }}><PersonIcon fontSize="small" /></MenuItemIcon>
                  My Profile
                </MenuItem>
                <MenuItem onClick={(e) => { e.currentTarget.blur(); handleMenuNavigate('settings'); }}>
                  <MenuItemIcon sx={{ minWidth: 34 }}><SettingsIcon fontSize="small" /></MenuItemIcon>
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={(e) => { e.currentTarget.blur(); handleMenuLogout(); }} sx={{ color: 'error.main' }}>
                  <MenuItemIcon sx={{ minWidth: 34 }}><LogoutIcon fontSize="small" color="error" /></MenuItemIcon>
                  Sign Out
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ p: { xs: 1.5, sm: 2, md: 2.5 }, flexGrow: 1, minWidth: 0 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}