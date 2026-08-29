import React, { useState } from 'react';
import {
  Box, Drawer, AppBar, Toolbar, Typography, InputBase,
  IconButton, Badge, Avatar, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Chip, Divider, Menu, MenuItem,
  ListItemIcon as MenuItemIcon
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
import { useApp } from '../context/AppContext';

const drawerWidth = 240;

export default function MainLayout({ currentScreen, onNavigate, children }) {
  const { currentUser, notifications, logout } = useApp();
  const [anchorEl, setAnchorEl] = useState(null); // controls the top-right profile dropdown
  const menuOpen = Boolean(anchorEl);

  const userName = currentUser ? currentUser.name : 'Student';
  const unreadCount = notifications ? notifications.filter(n => !(n.read || n.isRead)).length : 0;

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
    { id: 'admin', label: 'Admin Panel', icon: <AdminPanelSettingsIcon />, admin: true },
  ];

  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleMenuNavigate = (screen) => {
    onNavigate(screen);
    handleMenuClose();
  };
  const handleMenuLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Sidebar Navigation */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderColor: '#F3F4F6',
          },
        }}
      >
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
                  onClick={() => onNavigate(item.id)}
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
      </Drawer>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid #F3F4F6', color: 'text.primary' }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#F9FAFB', px: 2, py: 0.5, borderRadius: 8, width: 320 }}>
              <SearchIcon sx={{ color: '#9CA3AF', mr: 1, fontSize: 20 }} />
              <InputBase placeholder="Search campus hub..." sx={{ fontSize: '0.875rem', width: '100%' }} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton color="inherit" onClick={() => onNavigate('notifications')}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* This whole block used to do nothing on click. Now it opens a real dropdown. */}
              <Box
                onClick={handleAvatarClick}
                sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', borderRadius: 2, px: 1, py: 0.5, '&:hover': { bgcolor: '#F9FAFB' } }}
              >
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.8rem' }}>
                  {userName[0]}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{userName.split(' ')[0]}</Typography>
              </Box>

              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={() => handleMenuNavigate('profile')}>
                  <MenuItemIcon sx={{ minWidth: 34 }}><PersonIcon fontSize="small" /></MenuItemIcon>
                  My Profile
                </MenuItem>
                <MenuItem onClick={() => handleMenuNavigate('settings')}>
                  <MenuItemIcon sx={{ minWidth: 34 }}><SettingsIcon fontSize="small" /></MenuItemIcon>
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleMenuLogout} sx={{ color: 'error.main' }}>
                  <MenuItemIcon sx={{ minWidth: 34 }}><LogoutIcon fontSize="small" color="error" /></MenuItemIcon>
                  Sign Out
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ p: 4, flexGrow: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}