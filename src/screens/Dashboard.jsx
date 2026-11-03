import React from 'react';
import { Box, Grid, Card, Typography, Button, Avatar, Chip, Stack, Divider } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import EventIcon from '@mui/icons-material/Event';
import BoltIcon from '@mui/icons-material/Bolt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useApp } from '../context/AppContext';
import { timeAgo, formatDate } from '../utils/format';

const iconForType = (type) => {
  switch (type) {
    case 'lost': return <LocationOnIcon fontSize="small" />;
    case 'market': return <ShoppingBagIcon fontSize="small" />;
    case 'event': return <EventIcon fontSize="small" />;
    case 'note': return <MenuBookIcon fontSize="small" />;
    default: return <BoltIcon fontSize="small" />;
  }
};

export default function Dashboard({ onNavigate }) {
  const {
    currentUser, lostItems, marketplaceItems, events, notes,
    skillRequests, notifications, dataLoading
  } = useApp();

  const userName = currentUser ? currentUser.name : 'Student';
  const activePostsCount = lostItems.filter((i) => i.status !== 'resolved').length;
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;
  const pendingIncoming = skillRequests.filter(
    (r) => r.status === 'pending' && (r.toUser?._id || r.toUser) === (currentUser?._id || currentUser?.id)
  );
  const upcomingEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

  // A real activity feed: the newest items across every module, newest first.
  const activity = [
    ...lostItems.map((i) => ({
      kind: 'lost',
      title: i.title,
      sub: `${i.type === 'lost' ? 'Lost' : 'Found'} · ${i.location}`,
      at: i.createdAt
    })),
    ...marketplaceItems.map((i) => ({
      kind: 'market',
      title: i.title,
      sub: `Listed for $${i.price}`,
      at: i.createdAt
    })),
    ...events.map((e) => ({
      kind: 'event',
      title: e.title,
      sub: `${formatDate(e.date)} · ${e.location}`,
      at: e.createdAt
    })),
    ...notes.map((n) => ({
      kind: 'note',
      title: n.title,
      sub: `${n.courseCode} · ${n.department}`,
      at: n.createdAt
    }))
  ]
    .filter((a) => a.at)
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 6);

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
          <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>Welcome to CampusHub 👋</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Welcome back, {userName}!</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
            You have <b>{pendingIncoming.length} pending skill request{pendingIncoming.length === 1 ? '' : 's'}</b> and{' '}
            <b>{unreadNotifsCount} unread notification{unreadNotifsCount === 1 ? '' : 's'}</b>.
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
          { label: 'Active Items/Posts', val: String(activePostsCount), change: 'Open listings', icon: <ShoppingBagIcon color="primary" /> },
          { label: 'Unread Notifications', val: String(unreadNotifsCount), change: '', icon: <LocationOnIcon color="error" /> },
          { label: 'Campus Events', val: String(events.length), change: 'Available now', icon: <EventIcon color="secondary" /> },
          { label: 'Incoming Requests', val: String(pendingIncoming.length), change: 'Skill exchange', icon: <BoltIcon sx={{ color: '#7C3AED' }} /> },
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent Campus Activity</Typography>
              <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => onNavigate('lost-found')}>
                Browse all
              </Button>
            </Box>
            {activity.length === 0 ? (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {dataLoading ? 'Loading the latest activity…' : 'Nothing here yet — post the first item to get your campus trading.'}
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2} divider={<Divider />}>
                {activity.map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                      <Avatar sx={{ bgcolor: '#EEF2FF', color: 'primary.main', width: 36, height: 36 }}>
                        {iconForType(item.kind)}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{item.title}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap display="block">{item.sub}</Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, ml: 1 }}>
                      {timeAgo(item.at)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {/* Registered Event Card */}
            <Card sx={{ overflow: 'hidden' }}>
              <Box sx={{ height: 120, position: 'relative', overflow: 'hidden' }}>
                {upcomingEvents[0]?.image ? (
                  <Box
                    component="img"
                    src={upcomingEvents[0].image}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Box sx={{ width: '100%', height: '100%', bgcolor: '#374151' }} />
                )}
                <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
                  <Chip label="Upcoming" color="primary" size="small" sx={{ fontWeight: 700 }} />
                </Box>
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">Featured Event</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {upcomingEvents[0]?.title || 'No events announced yet'}
                </Typography>
                {upcomingEvents[0] && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    {formatDate(upcomingEvents[0].date)} · {upcomingEvents[0].location}
                  </Typography>
                )}
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
