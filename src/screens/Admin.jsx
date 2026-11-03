import React, { useEffect, useState } from 'react';
import {
  Box, Card, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Stack, Grid,
  CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import EventIcon from '@mui/icons-material/Event';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import DeleteIcon from '@mui/icons-material/Delete';
import { useApp } from '../context/AppContext';
import * as api from '../api';
import { timeAgo } from '../utils/format';

const TARGET_LABELS = {
  LostFound: 'Lost & Found',
  Marketplace: 'Marketplace',
  User: 'User',
  Skill: 'Skill Profile',
  Event: 'Event',
  Note: 'Note'
};

export default function Admin() {
  const {
    adminReports, resolveAdminReport, removeReportedContent,
    adminUsers, toggleUserSuspend, dataLoading, refreshData
  } = useApp();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null); // report awaiting removal
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await api.fetchAdminStats();
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load admin stats');
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  const statCards = stats
    ? [
        { label: 'Total Users', value: stats.users.total, sub: `${stats.users.suspended} suspended`, icon: <PeopleIcon />, color: '#4F46E5' },
        { label: 'Lost & Found Posts', value: stats.lostFound.total, sub: `${stats.lostFound.open} still open`, icon: <LocationOnIcon />, color: '#0D9488' },
        { label: 'Marketplace Listings', value: stats.marketplace.total, sub: `${stats.marketplace.sold} sold`, icon: <ShoppingBagIcon />, color: '#D97706' },
        { label: 'Pending Reports', value: stats.reports.pending, sub: 'awaiting review', icon: <ReportProblemIcon />, color: '#DC2626' },
        { label: 'Events', value: stats.events.total, sub: 'created', icon: <EventIcon />, color: '#7C3AED' },
        { label: 'Notes Shared', value: stats.notes.total, sub: `${stats.skills.total} skill profiles`, icon: <MenuBookIcon />, color: '#0891B2' }
      ]
    : [];

  const handleRemoveContent = async () => {
    if (!confirmTarget) return;
    setBusy(true);
    setError('');
    try {
      const result = await removeReportedContent(confirmTarget.id);
      setConfirmTarget(null);
      await refreshData();
      // Reload stats so the counters reflect the deletion
      const fresh = await api.fetchAdminStats();
      setStats(fresh);
      if (result?.action === 'already_deleted') {
        setError('That content had already been removed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove the content.');
    } finally {
      setBusy(false);
    }
  };

  const handleDismiss = async (id) => {
    setError('');
    try {
      await resolveAdminReport(id, 'dismissed');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update the report.');
    }
  };

  const handleSuspend = async (id) => {
    setError('');
    try {
      await toggleUserSuspend(id);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update the account.');
    }
  };

  const pendingReports = adminReports.filter((r) => r.status === 'pending');
  const handledReports = adminReports.filter((r) => r.status !== 'pending');

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ bgcolor: '#D97706', p: 3, borderRadius: 3, color: 'white', mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <ShieldIcon fontSize="large" />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Admin Moderation Panel</Typography>
          <Typography variant="body2">Manage users, reviews, and community reported content</Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Platform Statistics */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Platform Overview</Typography>
      {statsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={28} /></Box>
      ) : (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {statCards.map((card, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
              <Card sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${card.color}1A`, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {card.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
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
        {dataLoading && adminReports.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={24} /></Box>
        )}
        {pendingReports.length === 0 && !dataLoading && (
          <Card sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary">No pending reports right now. 🎉</Typography>
          </Card>
        )}
        {pendingReports.map((r) => (
          <Card key={r.id} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                  <Chip label={TARGET_LABELS[r.targetType] || r.type} size="small" color="secondary" />
                  <Chip label="pending" size="small" color="error" />
                  <Chip label={timeAgo(r.createdAt)} size="small" variant="outlined" />
                </Stack>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{r.targetTitle}</Typography>
                <Typography variant="body2" color="text.secondary">Reason: {r.reason}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Reported by {r.reporterName}{r.reporter?.email ? ` (${r.reporter.email})` : ''}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => setConfirmTarget(r)}
                >
                  Remove Post
                </Button>
                <Button variant="outlined" size="small" onClick={() => handleDismiss(r.id)}>
                  Dismiss
                </Button>
              </Stack>
            </Box>
          </Card>
        ))}
      </Stack>

      {handledReports.length > 0 && (
        <>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Recently Handled Reports</Typography>
          <Stack spacing={1.5} sx={{ mb: 4 }}>
            {handledReports.slice(0, 5).map((r) => (
              <Card key={r.id} sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {r.targetTitle} — {r.reason}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {TARGET_LABELS[r.targetType]} · {timeAgo(r.createdAt)}
                  </Typography>
                </Box>
                <Chip label={r.status} size="small" color={r.status === 'dismissed' ? 'default' : 'success'} />
              </Card>
            ))}
          </Stack>
        </>
      )}

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Registered Platform Users</Typography>
      <TableContainer component={Card}>
        <Table>
          <TableHead sx={{ bgcolor: '#F9FAFB' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>University</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {adminUsers.map((u) => (
              <TableRow key={u._id || u.id}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{u.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={u.role} size="small" color={u.role === 'admin' ? 'warning' : 'default'} />
                </TableCell>
                <TableCell>{u.university || '—'}</TableCell>
                <TableCell>
                  <Chip label={u.status || 'active'} color={u.status === 'active' ? 'success' : 'error'} size="small" />
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    color={u.status === 'active' ? 'error' : 'success'}
                    onClick={() => handleSuspend(u._id || u.id)}
                  >
                    {u.status === 'active' ? 'Suspend' : 'Reinstate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirm destructive removal of reported content */}
      <Dialog open={Boolean(confirmTarget)} onClose={() => setConfirmTarget(null)} maxWidth="sm" fullWidth disableRestoreFocus>
        <DialogTitle sx={{ fontWeight: 700 }}>Remove reported content?</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <b>{confirmTarget?.targetTitle}</b> will be permanently deleted from CampusHub.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Reason on file: “{confirmTarget?.reason}” — reported by {confirmTarget?.reporterName}.
            {confirmTarget?.targetType === 'User' && ' Reported user accounts are suspended instead of deleted.'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmTarget(null)} disabled={busy}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleRemoveContent} disabled={busy}>
            {busy ? <CircularProgress size={18} /> : 'Delete & Resolve'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
