import React, { useEffect, useState } from 'react';
import { Box, Card, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Stack, Grid, CircularProgress } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { useApp } from '../context/AppContext';
import * as api from '../api';

export default function Admin() {
  const { adminReports, resolveAdminReport, adminUsers, toggleUserSuspend } = useApp();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await api.fetchAdminStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  const statCards = stats ? [
    { label: 'Total Users', value: stats.users.total, sub: `${stats.users.suspended} suspended`, icon: <PeopleIcon />, color: '#4F46E5' },
    { label: 'Lost & Found Posts', value: stats.lostFound.total, sub: `${stats.lostFound.open} still open`, icon: <LocationOnIcon />, color: '#0D9488' },
    { label: 'Marketplace Listings', value: stats.marketplace.total, sub: `${stats.marketplace.sold} sold`, icon: <ShoppingBagIcon />, color: '#D97706' },
    { label: 'Pending Reports', value: stats.reports.pending, sub: 'awaiting review', icon: <ReportProblemIcon />, color: '#DC2626' },
  ] : [];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ bgcolor: '#D97706', p: 3, borderRadius: 3, color: 'white', mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <ShieldIcon fontSize="large" />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Admin Moderation Panel</Typography>
          <Typography variant="body2">Manage users, reviews, and community reported content</Typography>
        </Box>
      </Box>

      {/* Platform Statistics */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Platform Overview</Typography>
      {statsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={28} /></Box>
      ) : (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {statCards.map((card, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
              <Card sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${card.color}1A`, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {card.icon}
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.1 }}>{card.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{card.label}</Typography>
                  <Typography variant="caption" color="text.disabled" display="block">{card.sub}</Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Pending Content Reports</Typography>
      <Stack spacing={2} sx={{ mb: 4 }}>
        {adminReports.length === 0 && (
          <Typography variant="body2" color="text.secondary">No pending reports right now.</Typography>
        )}
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