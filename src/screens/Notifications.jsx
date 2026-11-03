import React from 'react';
import {
  Box, Card, Typography, Button, Stack, Avatar, IconButton, CircularProgress, Chip
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CampaignIcon from '@mui/icons-material/Campaign';
import { useApp } from '../context/AppContext';
import { timeAgo } from '../utils/format';

const TYPE_COLORS = {
  claim: 'primary',
  'skill-request': 'secondary',
  event: 'info',
  report: 'error',
  marketplace: 'warning',
  system: 'default'
};

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead, dismissNotification, dataLoading } = useApp();

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Notifications</Typography>
          <Typography variant="body2" color="text.secondary">
            Stay updated on your exchanges and activities
            {notifications.length > 0 && ` · ${unread} unread`}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<CheckIcon />}
          onClick={markAllNotificationsRead}
          disabled={unread === 0}
        >
          Mark All as Read
        </Button>
      </Box>

      {dataLoading && notifications.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
      ) : notifications.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <CampaignIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>You’re all caught up</Typography>
          <Typography variant="body2" color="text.secondary">
            Claims, skill requests, event registrations and admin updates will show up here.
          </Typography>
        </Card>
      ) : (
        <Stack spacing={2}>
          {notifications.map((n) => (
            <Card
              key={n.id}
              sx={{
                p: 2,
                bgcolor: n.read ? 'background.paper' : '#EEF2FF',
                borderColor: n.read ? '#F3F4F6' : '#C7D2FE',
                borderLeft: n.read ? '4px solid transparent' : '4px solid #6366F1',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 2
              }}
            >
              <Avatar sx={{ bgcolor: n.read ? '#9CA3AF' : 'primary.main' }}>
                <NotificationsIcon />
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{n.title}</Typography>
                  <Chip label={n.type} size="small" color={TYPE_COLORS[n.type] || 'default'} sx={{ height: 18, fontSize: '0.65rem' }} />
                  <Typography variant="caption" color="text.secondary">{timeAgo(n.createdAt)}</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{n.message}</Typography>
                {!n.read && (
                  <Button size="small" onClick={() => markNotificationRead(n.id)}>
                    Mark as Read
                  </Button>
                )}
              </Box>
              <IconButton size="small" onClick={() => dismissNotification(n.id)} title="Dismiss">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
