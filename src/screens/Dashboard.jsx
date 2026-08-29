import React from 'react';
import { Box, Grid, Card, Typography, Button, Avatar, Chip, Stack } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import EventIcon from '@mui/icons-material/Event';
import BoltIcon from '@mui/icons-material/Bolt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useApp } from '../context/AppContext';

export default function Dashboard({ onNavigate }) {
  const { currentUser, lostItems, marketplaceItems, events, skillRequests, notifications } = useApp();

  const userName = currentUser ? currentUser.name : 'Student';
  const activePostsCount = (lostItems?.length || 0) + (marketplaceItems?.length || 0);
  const unreadNotifsCount = notifications?.filter(n => !n.read)?.length || 0;
  const eventsCount = events?.length || 0;
  const pendingSkillReqsCount = skillRequests?.filter(s => s.status === 'pending')?.length || 0;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Welcome Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #0D9488 100%)',
          borderRadius: 4,
          p: 4,
          color: 'white',
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ zIndex: 1 }}>
          <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>Good morning 👋</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Welcome back, {userName}!</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
            You have <b>{pendingSkillReqsCount} pending skill requests</b> and <b>{unreadNotifsCount} unread notifications</b>.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={() => onNavigate('skills')}
              sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#F3F4F6' } }}
            >
              View Requests
            </Button>
            <Button
              variant="contained"
              onClick={() => onNavigate('lost-found')}
              sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' } }}
            >
              Post Lost Item
            </Button>
          </Stack>
        </Box>
        <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.3)', border: '4px solid rgba(255,255,255,0.4)', fontSize: '2rem' }}>
          {userName[0]}
        </Avatar>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Active Items/Posts', val: String(activePostsCount), change: 'Live listings', icon: <ShoppingBagIcon color="primary" /> },
          { label: 'Unread Notifications', val: String(unreadNotifsCount), change: '', icon: <LocationOnIcon color="error" /> },
          { label: 'Campus Events', val: String(eventsCount), change: 'Available now', icon: <EventIcon color="secondary" /> },
          { label: 'Skill Requests', val: String(pendingSkillReqsCount), change: 'Skill exchange', icon: <BoltIcon sx={{ color: '#7C3AED' }} /> },
        ].map((stat, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
            <Card sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{stat.label}</Typography>
                <Typography variant="h4" sx={{ my: 0.5, fontWeight: 700 }}>{stat.val}</Typography>
                {stat.change && <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>{stat.change}</Typography>}
              </Box>
              <Box sx={{ p: 1, bgcolor: '#F3F4F6', borderRadius: 2 }}>{stat.icon}</Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Layout Content */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Recent Campus Activity</Typography>
            <Stack spacing={2} divider={<Box sx={{ borderBottom: '1px solid #F3F4F6' }} />}>
              {[
                { title: 'Lost & Found Update', sub: 'New items added to campus hub', time: 'Recently', icon: <LocationOnIcon fontSize="small" /> },
                { title: 'Skill exchange available', sub: 'Connect with peers on campus', time: 'Active', icon: <BoltIcon fontSize="small" /> },
                { title: 'Student Marketplace', sub: 'Listings ready for trading', time: 'Active', icon: <ShoppingBagIcon fontSize="small" /> },
              ].map((item, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#EEF2FF', color: 'primary.main', width: 36, height: 36 }}>{item.icon}</Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.sub}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">{item.time}</Typography>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {/* Registered Event Card */}
            <Card sx={{ overflow: 'hidden' }}>
              <Box sx={{ height: 120, bgcolor: '#374151', position: 'relative', p: 1.5 }}>
                <Chip label="Upcoming" color="primary" size="small" sx={{ fontWeight: 700 }} />
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">Featured Event</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{events[0]?.title || 'Campus Hackathon 2026'}</Typography>
                <Button fullWidth variant="outlined" size="small" endIcon={<ArrowForwardIcon />} onClick={() => onNavigate('events')}>
                  Explore Events
                </Button>
              </Box>
            </Card>

            {/* Quick Actions */}
            <Card sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Quick Actions</Typography>
              <Stack spacing={1}>
                {[
                  { label: 'Post a lost item', target: 'lost-found' },
                  { label: 'List something to sell', target: 'marketplace' },
                  { label: 'Create an event', target: 'events' },
                  { label: 'Share your notes', target: 'notes' },
                ].map((act, idx) => (
                  <Button key={idx} fullWidth sx={{ justifyContent: 'space-between', color: 'text.primary', '&:hover': { bgcolor: '#F9FAFB' } }} onClick={() => onNavigate(act.target)}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>• {act.label}</Typography>
                    <ArrowForwardIcon fontSize="small" sx={{ color: '#9CA3AF' }} />
                  </Button>
                ))}
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}