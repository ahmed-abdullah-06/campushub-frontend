import React from 'react';
import { Box, Card, Typography, Button, Stack, Avatar, IconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useApp } from '../context/AppContext';

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead, dismissNotification } = useApp();

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Notifications</Typography>
          <Typography variant="body2" color="text.secondary">Stay updated on your exchanges and activities</Typography>
        </Box>
        <Button variant="outlined" startIcon={<CheckIcon />} onClick={markAllNotificationsRead}>
          Mark All as Read
        </Button>
      </Box>

      <Stack spacing={2}>
        {notifications.map((n) => (
          <Card
            key={n.id || n._id}
            sx={{
              p: 2,
              bgcolor: (n.read || n.isRead) ? 'background.paper' : '#EEF2FF',
              borderColor: (n.read || n.isRead) ? '#F3F4F6' : '#C7D2FE',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 2
            }}
          >
            <Avatar sx={{ bgcolor: (n.read || n.isRead) ? '#9CA3AF' : 'primary.main' }}>
              <NotificationsIcon />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{n.title || n.type || 'Notification'}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{n.message || n.body}</Typography>
              {!(n.read || n.isRead) && (
                <Button size="small" onClick={() => markNotificationRead(n.id || n._id)}>
                  Mark as Read
                </Button>
              )}
            </Box>
            <IconButton size="small" onClick={() => dismissNotification(n.id || n._id)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}