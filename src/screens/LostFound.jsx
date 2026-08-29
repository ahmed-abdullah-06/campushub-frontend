import React, { useState } from 'react';
import { 
  Box, Grid, Card, CardMedia, CardContent, Typography, Button, 
  TextField, Select, MenuItem, Chip, Stack, Avatar, Dialog, 
  DialogTitle, DialogContent, DialogActions, FormControl, InputLabel 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useApp } from '../context/AppContext';

export default function LostFound() {
  const { lostItems, addLostItem, toggleLostStatus } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);

  const [form, setForm] = useState({
    title: '', type: 'lost', category: 'Electronics', location: '', description: '', image: ''
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const created = addLostItem(form);
    setOpenCreate(false);
    setSelectedItem(created);
    setForm({ title: '', type: 'lost', category: 'Electronics', location: '', description: '', image: '' });
  };

  const filtered = lostItems.filter((i) => {
    if (typeFilter !== 'all' && i.type !== typeFilter) return false;
    if (search && !i.title?.toLowerCase().includes(search.toLowerCase()) && !i.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Lost & Found Hub</Typography>
          <Typography variant="body2" color="text.secondary">Reunite students with their belongings on campus</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
          Report Item
        </Button>
      </Box>

      <Card sx={{ p: 2, mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            placeholder="Search items by keyword..."
            size="small"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ color: '#9CA3AF', mr: 1 }} /> }}
          />
          <Select size="small" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} sx={{ minWidth: 150 }}>
            <MenuItem value="all">All Items</MenuItem>
            <MenuItem value="lost">🔴 Lost Only</MenuItem>
            <MenuItem value="found">🟢 Found Only</MenuItem>
          </Select>
        </Stack>
      </Card>

      <Grid container spacing={3}>
        {filtered.map((item) => {
          const posterName = item.postedBy?.name || item.user?.name || 'Student';
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id || item._id}>
              <Card 
                onClick={() => setSelectedItem(item)}
                sx={{ 
                  height: '100%', 
                  cursor: 'pointer', 
                  transition: 'transform 0.2s, box-shadow 0.2s', 
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } 
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia 
                    component="img" 
                    height="180" 
                    image={item.image || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500'} 
                    alt={item.title} 
                  />
                  <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 12, left: 12 }}>
                    <Chip 
                      label={item.type === 'lost' ? '🔴 Lost' : '🟢 Found'} 
                      size="small" 
                      sx={{ bgcolor: 'white', fontWeight: 700 }} 
                    />
                    {item.status === 'resolved' && <Chip label="Resolved" size="small" color="default" sx={{ bgcolor: 'rgba(0,0,0,0.7)', color: 'white' }} />}
                  </Stack>
                </Box>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }} noWrap>{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>{item.description}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', mb: 2 }}>
                    <LocationOnIcon fontSize="small" color="primary" />
                    <Typography variant="caption" noWrap>{item.location}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #F3F4F6' }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                        {posterName[0]}
                      </Avatar>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>{posterName}</Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">{item.status || 'Active'}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={Boolean(selectedItem)} onClose={() => setSelectedItem(null)} maxWidth="sm" fullWidth disableRestoreFocus>
        {selectedItem && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>{selectedItem.title}</DialogTitle>
            <DialogContent dividers>
              {selectedItem.image && (
                <Box component="img" src={selectedItem.image} sx={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 2, mb: 2 }} />
              )}
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip label={(selectedItem.type || 'lost').toUpperCase()} color={selectedItem.type === 'lost' ? 'error' : 'success'} size="small" />
                <Chip label={selectedItem.category || 'General'} variant="outlined" size="small" />
                <Chip label={selectedItem.status || 'active'} color={selectedItem.status === 'active' ? 'primary' : 'default'} size="small" />
              </Stack>
              <Typography variant="body1" paragraph>{selectedItem.description}</Typography>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
                📍 Location: {selectedItem.location}
              </Typography>
              <Box sx={{ p: 2, bgcolor: '#F9FAFB', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>{(selectedItem.postedBy?.name || selectedItem.user?.name || 'S')[0]}</Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{selectedItem.postedBy?.name || selectedItem.user?.name || 'Student'}</Typography>
                  <Typography variant="caption" color="text.secondary">{selectedItem.postedBy?.university || 'Campus Community'}</Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button 
                variant="contained" 
                startIcon={<CheckCircleIcon />}
                onClick={() => {
                  toggleLostStatus(selectedItem.id || selectedItem._id);
                  setSelectedItem({ ...selectedItem, status: selectedItem.status === 'active' ? 'resolved' : 'active' });
                }}
              >
                {selectedItem.status === 'active' ? 'Mark as Resolved' : 'Reopen Post'}
              </Button>
              <Button onClick={() => setSelectedItem(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth disableRestoreFocus>
        <DialogTitle sx={{ fontWeight: 700 }}>Report Lost or Found Item</DialogTitle>
        <Box component="form" onSubmit={handleCreateSubmit}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField 
              label="Title" 
              required 
              fullWidth 
              value={form.title} 
              onChange={(e) => setForm({ ...form, title: e.target.value })} 
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select value={form.type} label="Type" onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <MenuItem value="lost">Lost Item</MenuItem>
                <MenuItem value="found">Found Item</MenuItem>
              </Select>
            </FormControl>
            <TextField 
              label="Location" 
              required 
              fullWidth 
              value={form.location} 
              onChange={(e) => setForm({ ...form, location: e.target.value })} 
            />
            <TextField 
              label="Description" 
              multiline 
              rows={3} 
              required 
              fullWidth 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
            />
            <TextField 
              label="Image URL (Optional)" 
              fullWidth 
              value={form.image} 
              onChange={(e) => setForm({ ...form, image: e.target.value })} 
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Submit & View Post</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}