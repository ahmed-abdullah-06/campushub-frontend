import React, { useState } from 'react';
import {
  Box, Grid, Card, CardMedia, CardContent, Typography, Button,
  TextField, Select, MenuItem, Chip, Stack, Avatar, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  CircularProgress, Alert, Divider, List, ListItem, ListItemText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import MailIcon from '@mui/icons-material/MailOutlineOutlined';
import UploadIcon from '@mui/icons-material/CloudUpload';
import FlagIcon from '@mui/icons-material/Flag';
import DeleteIcon from '@mui/icons-material/Delete';
import { useApp } from '../context/AppContext';
import * as api from '../api';
import ReportDialog from '../components/common/ReportDialog';
import { timeAgo } from '../utils/format';

const CATEGORIES = ['Books', 'Electronics', 'Furniture', 'Clothing', 'Kitchen', 'Sports', 'Other'];
const CONDITIONS = ['Like New', 'Good', 'Fair', 'Poor'];

export default function Marketplace() {
  const {
    marketplaceItems, addMarketplaceItem, markMarketplaceSold,
    contactSeller, currentUser, dataLoading, refreshData
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);

  // Contact flow
  const [contactOpen, setContactOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactResult, setContactResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '', price: '', category: 'Electronics', condition: 'Good', description: '', image: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const myId = currentUser?._id || currentUser?.id;
  const isOwner = (item) => item && myId && (item.seller?._id || item.seller) === myId;

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
      const created = await addMarketplaceItem(form);
      setOpenCreate(false);
      setSelectedItem(created);
      setForm({ title: '', price: '', category: 'Electronics', condition: 'Good', description: '', image: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not publish your listing.');
    } finally {
      setBusy(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    setBusy(true);
    setError('');
    try {
      const result = await contactSeller(selectedItem.id, contactMessage);
      setContactResult(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the seller.');
    } finally {
      setBusy(false);
    }
  };

  const closeContact = () => {
    setContactOpen(false);
    setContactMessage('');
    setContactResult(null);
    setError('');
  };

  const handleMarkSold = async () => {
    if (!selectedItem) return;
    setBusy(true);
    setError('');
    try {
      setSelectedItem(await markMarketplaceSold(selectedItem.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update the listing.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    setBusy(true);
    try {
      await api.deleteMarketplaceItem(selectedItem.id);
      setSelectedItem(null);
      await refreshData();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete the listing.');
    } finally {
      setBusy(false);
    }
  };

  const filtered = marketplaceItems.filter((i) => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    if (search && !i.title?.toLowerCase().includes(search.toLowerCase()) && !i.description?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Student Marketplace</Typography>
          <Typography variant="body2" color="text.secondary">Buy and sell goods with students on campus</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
          List New Item
        </Button>
      </Box>

      {error && !selectedItem && !openCreate && !contactOpen && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>
      )}

      <Card sx={{ p: 2, mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search marketplace by item name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ color: '#9CA3AF', mr: 1 }} /> }}
          />
          <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 160 }}>
            <MenuItem value="all">Any Status</MenuItem>
            <MenuItem value="available">Available</MenuItem>
            <MenuItem value="sold">Sold</MenuItem>
          </Select>
        </Stack>
      </Card>

      {dataLoading && marketplaceItems.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Nothing for sale right now</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {marketplaceItems.length === 0
              ? 'Be the first student to list something on the marketplace.'
              : 'Try a different search or clear the filters.'}
          </Typography>
          <Button variant="outlined" onClick={() => { setSearch(''); setStatusFilter('all'); }}>Clear Filters</Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id || item._id}>
              <Card onClick={() => { setSelectedItem(item); setError(''); }} sx={{ cursor: 'pointer', height: '100%' }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia component="img" height="180" image={item.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500'} alt={item.title} />
                  <Chip label={item.condition || 'Good'} size="small" color="success" sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 700 }} />
                  <Chip label={item.category || 'Other'} size="small" sx={{ position: 'absolute', top: 12, left: 12, bgcolor: 'white', fontWeight: 700 }} />
                  {item.status === 'sold' && (
                    <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 800 }}>SOLD</Typography>
                    </Box>
                  )}
                </Box>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap>{item.title}</Typography>
                  <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700, my: 1 }}>${item.price}</Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>{item.description}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {item.seller?.name || 'Student'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{timeAgo(item.createdAt)}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ------------------------- Item details ------------------------- */}
      <Dialog open={Boolean(selectedItem)} onClose={() => setSelectedItem(null)} maxWidth="sm" fullWidth disableRestoreFocus>
        {selectedItem && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>{selectedItem.title}</DialogTitle>
            <DialogContent dividers>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Box component="img" src={selectedItem.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500'} alt={selectedItem.title} sx={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 2, mb: 2 }} />
              <Typography variant="h4" color="primary" sx={{ fontWeight: 800, mb: 1 }}>${selectedItem.price}</Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Chip label={`Condition: ${selectedItem.condition || 'Good'}`} color="success" size="small" />
                <Chip label={selectedItem.category || 'Other'} variant="outlined" size="small" />
                <Chip label={selectedItem.status === 'sold' ? 'Sold' : 'Available'} color={selectedItem.status === 'sold' ? 'default' : 'primary'} size="small" />
              </Stack>
              <Typography variant="body1" paragraph>{selectedItem.description}</Typography>

              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>{(selectedItem.seller?.name || 'S')[0]}</Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {selectedItem.seller?.name || 'Student'} {isOwner(selectedItem) && '(you)'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedItem.seller?.university || 'State University'}
                    {selectedItem.createdAt ? ` · listed ${timeAgo(selectedItem.createdAt)}` : ''}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, flexWrap: 'wrap', gap: 1 }}>
              {isOwner(selectedItem) ? (
                <>
                  {selectedItem.status !== 'sold' && (
                    <Button variant="contained" color="success" onClick={handleMarkSold} disabled={busy}>
                      Mark as Sold
                    </Button>
                  )}
                  <Button color="error" startIcon={<DeleteIcon />} onClick={handleDelete} disabled={busy}>
                    Delete
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<MailIcon />}
                  onClick={() => { setError(''); setContactOpen(true); }}
                  disabled={selectedItem.status === 'sold'}
                >
                  Contact Seller
                </Button>
              )}
              {!isOwner(selectedItem) && (
                <Button color="error" startIcon={<FlagIcon />} onClick={() => setReportTarget(selectedItem)}>
                  Report
                </Button>
              )}
              <Button onClick={() => setSelectedItem(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ------------------------- Contact seller ------------------------- */}
      <Dialog open={contactOpen} onClose={closeContact} maxWidth="sm" fullWidth disableRestoreFocus>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Contact {selectedItem?.seller?.name || 'the seller'}
        </DialogTitle>
        <Box component="form" onSubmit={handleContactSubmit}>
          <DialogContent dividers>
            {contactResult ? (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>{contactResult.message}</Alert>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Seller details</Typography>
                <List dense sx={{ bgcolor: '#F9FAFB', borderRadius: 2 }}>
                  <ListItem>
                    <ListItemText primary={contactResult.seller?.name} secondary={contactResult.seller?.university} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={contactResult.seller?.email} secondary="Email address" />
                  </ListItem>
                </List>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  The seller also received your message as an in-app notification.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Your message is delivered to <b>{selectedItem?.seller?.name}</b> as an in-app
                  notification, and their contact email is shown after sending.
                </Typography>
                <TextField
                  label="Message"
                  multiline
                  rows={3}
                  required
                  fullWidth
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  inputProps={{ maxLength: 500 }}
                  placeholder="Hi! Is this still available? When could I pick it up?"
                  helperText={`${contactMessage.length}/500`}
                />
                {error && <Alert severity="error">{error}</Alert>}
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            {contactResult ? (
              <Button variant="contained" onClick={closeContact}>Done</Button>
            ) : (
              <>
                <Button onClick={closeContact} disabled={busy}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={busy || !contactMessage.trim()}>
                  {busy ? <CircularProgress size={18} /> : 'Send Message'}
                </Button>
              </>
            )}
          </DialogActions>
        </Box>
      </Dialog>

      {/* ------------------------- Create listing ------------------------- */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth disableRestoreFocus>
        <DialogTitle sx={{ fontWeight: 700 }}>List an Item for Sale</DialogTitle>
        <Box component="form" onSubmit={handleCreateSubmit}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Title" required fullWidth value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Stack direction="row" spacing={2}>
              <TextField label="Price ($)" type="number" required fullWidth value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} inputProps={{ min: 0, step: '0.01' }} />
              <FormControl fullWidth>
                <InputLabel>Condition</InputLabel>
                <Select label="Condition" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                  {CONDITIONS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Description" multiline rows={3} required fullWidth value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Box>
              <Button
                component="label"
                variant="outlined"
                startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />}
                disabled={uploading}
                fullWidth
              >
                {uploading ? 'Uploading...' : form.image ? 'Change Photo' : 'Add a Photo (Optional)'}
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
              {busy ? <CircularProgress size={18} /> : 'Publish Listing'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ReportDialog
        open={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        targetType="Marketplace"
        targetId={reportTarget?.id}
        targetLabel={reportTarget ? `${reportTarget.title} ($${reportTarget.price})` : ''}
      />
    </Box>
  );
}
