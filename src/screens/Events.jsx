import React, { useState } from 'react';
import {
  Box, Grid, Card, CardMedia, CardContent, Typography, Button,
  TextField, Select, MenuItem, Chip, Stack, Avatar, Dialog,
  DialogTitle, DialogContent, DialogActions, LinearProgress,
  CircularProgress, Alert, FormControl, InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckIcon from '@mui/icons-material/Check';
import UploadIcon from '@mui/icons-material/CloudUpload';
import FlagIcon from '@mui/icons-material/Flag';
import DeleteIcon from '@mui/icons-material/Delete';
import { useApp } from '../context/AppContext';
import * as api from '../api';
import ReportDialog from '../components/common/ReportDialog';
import { formatDate, formatTime12, timeAgo } from '../utils/format';

const CATEGORIES = ['Career', 'Technology', 'Academic', 'Arts', 'Social', 'Sports', 'Workshop'];

export default function Events() {
  const {
    events, addEvent, toggleEventRegister, currentUser, dataLoading, refreshData
  } = useApp();

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '', description: '', date: '', time: '', endTime: '', location: '', capacity: '', category: 'Academic', image: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const myId = currentUser?._id || currentUser?.id;
  const isOrganizer = (ev) => ev && myId && (ev.organizer?._id || ev.organizer) === myId;

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const { imageUrl } = await api.uploadImage(file);
      setForm((prev) => ({ ...prev, image: imageUrl }));
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed. Try a smaller image.');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const created = await addEvent(form);
      setOpenCreate(false);
      setSelectedEvent(created);
      setForm({ title: '', description: '', date: '', time: '', endTime: '', location: '', capacity: '', category: 'Academic', image: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create the event.');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleRegister = async () => {
    if (!selectedEvent) return;
    setBusy(true);
    setError('');
    try {
      setSelectedEvent(await toggleEventRegister(selectedEvent.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update your registration.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    setBusy(true);
    try {
      await api.deleteEvent(selectedEvent.id);
      setSelectedEvent(null);
      await refreshData();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete the event.');
    } finally {
      setBusy(false);
    }
  };

  const categories = ['All', ...CATEGORIES];

  const filtered = events.filter((ev) => {
    if (catFilter !== 'All' && ev.category !== catFilter) return false;
    if (search && !ev.title?.toLowerCase().includes(search.toLowerCase()) && !ev.location?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pct = (ev) => Math.min(100, Math.round(((ev.attendeeCount || 0) / (ev.capacity || 50)) * 100));
  const isFull = (ev) => (ev.attendeeCount || 0) >= (ev.capacity || 50);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Campus Events</Typography>
          <Typography variant="body2" color="text.secondary">Discover and join events taking place on campus</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
          Create Event
        </Button>
      </Box>

      {error && !selectedEvent && !openCreate && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>
      )}

      <Card sx={{ p: 2, mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            placeholder="Search campus events..."
            size="small"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ color: '#9CA3AF', mr: 1 }} /> }}
          />
          <Select size="small" value={catFilter} onChange={(e) => setCatFilter(e.target.value)} sx={{ minWidth: 160 }}>
            {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </Stack>
      </Card>

      {dataLoading && events.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No events found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {events.length === 0 ? 'No campus events yet — why not host the first one?' : 'Try a different keyword or category.'}
          </Typography>
          <Button variant="outlined" onClick={() => { setSearch(''); setCatFilter('All'); }}>Clear Filters</Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((ev) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={ev.id}>
              <Card
                onClick={() => { setSelectedEvent(ev); setError(''); }}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={ev.image || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500'}
                    alt={ev.title}
                  />
                  <Chip
                    label={ev.category}
                    size="small"
                    sx={{ position: 'absolute', top: 12, left: 12, bgcolor: 'white', fontWeight: 700 }}
                  />
                  {ev.isRegistered && (
                    <Chip
                      icon={<CheckIcon fontSize="small" />}
                      label="Registered"
                      size="small"
                      color="success"
                      sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 700 }}
                    />
                  )}
                </Box>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }} noWrap>{ev.title}</Typography>
                    <Stack spacing={0.5} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        <CalendarTodayIcon fontSize="inherit" />
                        <Typography variant="caption">{formatDate(ev.date)} · {formatTime12(ev.time)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        <LocationOnIcon fontSize="inherit" />
                        <Typography variant="caption" noWrap>{ev.location}</Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Box sx={{ pt: 1, borderTop: '1px solid #F3F4F6' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {isFull(ev) ? 'Fully booked' : 'Capacity'}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>{ev.attendeeCount || 0} / {ev.capacity}</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={pct(ev)} color={isFull(ev) ? 'warning' : 'primary'} sx={{ height: 6, borderRadius: 3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ------------------------- Event details ------------------------- */}
      <Dialog open={Boolean(selectedEvent)} onClose={() => setSelectedEvent(null)} maxWidth="sm" fullWidth disableRestoreFocus>
        {selectedEvent && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>{selectedEvent.title}</DialogTitle>
            <DialogContent dividers>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {selectedEvent.image && (
                <Box component="img" src={selectedEvent.image} alt={selectedEvent.title} sx={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 2, mb: 2 }} />
              )}
              <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Chip label={selectedEvent.category} color="primary" size="small" />
                {selectedEvent.isRegistered && <Chip label="You are registered" color="success" size="small" />}
                {isFull(selectedEvent) && !selectedEvent.isRegistered && <Chip label="Fully booked" color="warning" size="small" />}
              </Stack>
              <Typography variant="body1" paragraph>{selectedEvent.description}</Typography>
              <Stack spacing={1} sx={{ p: 2, bgcolor: '#F9FAFB', borderRadius: 2, mb: 2 }}>
                <Typography variant="subtitle2">
                  🗓 {formatDate(selectedEvent.date)} ({formatTime12(selectedEvent.time)}
                  {selectedEvent.endTime ? ` – ${formatTime12(selectedEvent.endTime)}` : ''})
                </Typography>
                <Typography variant="subtitle2">📍 {selectedEvent.location}</Typography>
                <Typography variant="subtitle2">
                  👥 Registered: {selectedEvent.attendeeCount || 0} / {selectedEvent.capacity}
                </Typography>
                <Box sx={{ width: '100%' }}>
                  <LinearProgress variant="determinate" value={pct(selectedEvent)} color={isFull(selectedEvent) ? 'warning' : 'primary'} sx={{ height: 6, borderRadius: 3 }} />
                </Box>
              </Stack>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  {(selectedEvent.organizerName || 'S')[0]}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2">Organized by {selectedEvent.organizerName || 'Student Community'}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedEvent.createdAt ? `Created ${timeAgo(selectedEvent.createdAt)}` : 'Campus event'}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, flexWrap: 'wrap', gap: 1 }}>
              <Button
                variant={selectedEvent.isRegistered ? 'outlined' : 'contained'}
                color={selectedEvent.isRegistered ? 'error' : 'primary'}
                onClick={handleToggleRegister}
                disabled={busy || (!selectedEvent.isRegistered && isFull(selectedEvent))}
              >
                {selectedEvent.isRegistered ? 'Unregister' : isFull(selectedEvent) ? 'Event Full' : 'Register Now'}
              </Button>
              {isOrganizer(selectedEvent) && (
                <Button color="error" startIcon={<DeleteIcon />} onClick={handleDelete} disabled={busy}>
                  Delete
                </Button>
              )}
              {!isOrganizer(selectedEvent) && (
                <Button color="error" startIcon={<FlagIcon />} onClick={() => setReportTarget(selectedEvent)}>
                  Report
                </Button>
              )}
              <Button onClick={() => setSelectedEvent(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ------------------------- Create event ------------------------- */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth disableRestoreFocus>
        <DialogTitle sx={{ fontWeight: 700 }}>Host a Campus Event</DialogTitle>
        <Box component="form" onSubmit={handleCreateSubmit}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Event Title" required fullWidth value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <TextField label="Description" multiline rows={3} required fullWidth value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Stack direction="row" spacing={2}>
              <TextField label="Date" type="date" required fullWidth InputLabelProps={{ shrink: true }} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <FormControl fullWidth>
                <InputLabel id="ev-cat-label">Category</InputLabel>
                <Select labelId="ev-cat-label" label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField label="Start Time" type="time" required fullWidth InputLabelProps={{ shrink: true }} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              <TextField label="End Time" type="time" fullWidth InputLabelProps={{ shrink: true }} value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField label="Location" required fullWidth value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <TextField label="Capacity" type="number" required fullWidth value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} inputProps={{ min: 1 }} />
            </Stack>
            <Box>
              <Button
                component="label"
                variant="outlined"
                startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />}
                disabled={uploading}
                fullWidth
              >
                {uploading ? 'Uploading...' : form.image ? 'Change Cover Image' : 'Add Cover Image (Optional)'}
                <input type="file" accept="image/*" hidden onChange={handleImageSelect} />
              </Button>
              {uploadError && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>{uploadError}</Typography>
              )}
              {form.image && (
                <Box component="img" src={api.resolveFileUrl(form.image)} alt="Preview" sx={{ mt: 1, width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 1 }} />
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenCreate(false)} disabled={busy}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={busy}>
              {busy ? <CircularProgress size={18} /> : 'Create Event'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ReportDialog
        open={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        targetType="Event"
        targetId={reportTarget?.id}
        targetLabel={reportTarget?.title}
      />
    </Box>
  );
}
