import React, { useState } from 'react';
import {
  Box, Grid, Card, CardMedia, CardContent, Typography, Button,
  TextField, Select, MenuItem, Chip, Stack, Avatar, Dialog,
  DialogTitle, DialogContent, DialogActions, LinearProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import CheckIcon from '@mui/icons-material/Check';
import { useApp } from '../context/AppContext';

export default function Events() {
  const { events, addEvent, toggleEventRegister } = useApp();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', date: '', time: '', endTime: '', location: '', capacity: '', category: 'Academic', image: ''
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const created = addEvent(form);
    setOpenCreate(false);
    setSelectedEvent(created);
    setForm({ title: '', description: '', date: '', time: '', endTime: '', location: '', capacity: '', category: 'Academic', image: '' });
  };

  const categories = ['All', 'Career', 'Technology', 'Academic', 'Arts', 'Social', 'Sports'];

  const filtered = events.filter((ev) => {
    if (catFilter !== 'All' && ev.category !== catFilter) return false;
    if (search && !ev.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Campus Events</Typography>
          <Typography variant="body2" color="text.secondary">Discover and join events taking place on campus</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
          Create Event
        </Button>
      </Box>

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

      <Grid container spacing={3}>
        {filtered.map((ev) => {
          const percent = Math.min(100, Math.round(((ev.attendeeCount || 1) / (ev.capacity || 50)) * 100));
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={ev.id || ev._id}>
              <Card
                onClick={() => setSelectedEvent(ev)}
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
                        <Typography variant="caption">{ev.date} · {ev.time}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        <LocationOnIcon fontSize="inherit" />
                        <Typography variant="caption" noWrap>{ev.location}</Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Box sx={{ pt: 1, borderTop: '1px solid #F3F4F6' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">Capacity</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>{ev.attendeeCount} / {ev.capacity}</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={percent} sx={{ height: 6, borderRadius: 3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Event Details Dialog */}
      <Dialog open={Boolean(selectedEvent)} onClose={() => setSelectedEvent(null)} maxWidth="sm" fullWidth disableRestoreFocus>
        {selectedEvent && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>{selectedEvent.title}</DialogTitle>
            <DialogContent dividers>
              {selectedEvent.image && (
                <Box component="img" src={selectedEvent.image} sx={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 2, mb: 2 }} />
              )}
              <Chip label={selectedEvent.category} color="primary" size="small" sx={{ mb: 2 }} />
              <Typography variant="body1" paragraph>{selectedEvent.description}</Typography>
              <Stack spacing={1} sx={{ p: 2, bgcolor: '#F9FAFB', borderRadius: 2, mb: 2 }}>
                <Typography variant="subtitle2">🗓 Date: {selectedEvent.date} ({selectedEvent.time} - {selectedEvent.endTime || 'End'})</Typography>
                <Typography variant="subtitle2">📍 Location: {selectedEvent.location}</Typography>
                <Typography variant="subtitle2">👥 Registered: {selectedEvent.attendeeCount} / {selectedEvent.capacity}</Typography>
              </Stack>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: selectedEvent.organizer?.color }}>{selectedEvent.organizer?.name[0]}</Avatar>
                <Box>
                  <Typography variant="subtitle2">Organized by {selectedEvent.organizer?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{selectedEvent.organizer?.university}</Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                variant={selectedEvent.isRegistered ? 'outlined' : 'contained'}
                color={selectedEvent.isRegistered ? 'error' : 'primary'}
                onClick={() => {
                  toggleEventRegister(selectedEvent.id || selectedEvent._id);
                  setSelectedEvent({
                    ...selectedEvent,
                    isRegistered: !selectedEvent.isRegistered,
                    attendeeCount: selectedEvent.isRegistered ? selectedEvent.attendeeCount - 1 : selectedEvent.attendeeCount + 1
                  });
                }}
              >
                {selectedEvent.isRegistered ? 'Unregister' : 'Register Now'}
              </Button>
              <Button onClick={() => setSelectedEvent(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Event Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth disableRestoreFocus>
        <DialogTitle sx={{ fontWeight: 700 }}>Host a Campus Event</DialogTitle>
        <Box component="form" onSubmit={handleCreateSubmit}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Event Title" required fullWidth value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <TextField label="Description" multiline rows={3} required fullWidth value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Stack direction="row" spacing={2}>
              <TextField label="Date" type="date" required fullWidth InputLabelProps={{ shrink: true }} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <TextField label="Start Time" type="time" required fullWidth InputLabelProps={{ shrink: true }} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField label="Location" required fullWidth value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <TextField label="Capacity" type="number" required fullWidth value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
            </Stack>
            <TextField label="Cover Image URL" fullWidth value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create Event</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}