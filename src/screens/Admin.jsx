import React from 'react';
import { Box, Card, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Stack } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import { useApp } from '../context/AppContext';

export default function Admin() {
  const { adminReports, resolveAdminReport, adminUsers, toggleUserSuspend } = useApp();

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ bgcolor: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', p: 3, borderRadius: 3, color: 'white', mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <ShieldIcon fontSize="large" />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Admin Moderation Panel</Typography>
          <Typography variant="body2">Manage users, reviews, and community reported content</Typography>
        </Box>
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Pending Content Reports</Typography>
      <Stack spacing={2} sx={{ mb: 4 }}>
        {adminReports.map((r) => (
          <Card key={r.id || r._id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Chip label={r.type || 'Report'} size="small" color="secondary" />
                <Chip label={r.status} size="small" color={r.status === 'pending' ? 'error' : 'success'} />
              </Stack>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{r.itemTitle || r.reason}</Typography>
              <Typography variant="body2" color="text.secondary">Reason: {r.reason}</Typography>
            </Box>
            {r.status === 'pending' && (
              <Stack direction="row" spacing={1}>
                <Button variant="contained" color="error" size="small" onClick={() => resolveAdminReport(r.id || r._id, 'resolved')}>
                  Remove Post
                </Button>
                <Button variant="outlined" size="small" onClick={() => resolveAdminReport(r.id || r._id, 'dismissed')}>
                  Dismiss
                </Button>
              </Stack>
            )}
          </Card>
        ))}
      </Stack>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Registered Platform Users</Typography>
      <TableContainer component={Card}>
        <Table>
          <TableHead sx={{ bgcolor: '#F9FAFB' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>University</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {adminUsers.map((u) => (
              <TableRow key={u.id || u._id}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.university || 'State University'}</TableCell>
                <TableCell>
                  <Chip label={u.status || 'active'} color={u.status === 'active' ? 'success' : 'error'} size="small" />
                </TableCell>
                <TableCell>
                  <Button size="small" color={u.status === 'active' ? 'error' : 'success'} onClick={() => toggleUserSuspend(u.id || u._id)}>
                    {u.status === 'active' ? 'Suspend' : 'Reinstate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}