import React, { useState } from 'react';
import {
  Box, Grid, Card, CardMedia, CardContent, Typography, Button,
  TextField, Select, MenuItem, Chip, Stack, Avatar, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  CircularProgress, Alert, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UploadIcon from '@mui/icons-material/CloudUpload';
import HandshakeIcon from '@mui/icons-material/Handshake';
import FlagIcon from '@mui/icons-material/Flag';
import DeleteIcon from '@mui/icons-material/Delete';
import { useApp } from '../context/AppContext';
import * as api from '../api';
import ReportDialog from '../components/common/ReportDialog';
import { timeAgo, formatDate } from '../utils/format';

const STATUS_STYLES = {
  open: { label: '🟢 Open', color: 'primary' },
  claimed: { label: '🟡 Claimed', color: 'warning' },
  resolved: { label: 'Resolved', color: 'default' }
};

export default function LostFound() {
  const {
    lostItems, addLostItem, toggleLostStatus, claimLostItem,
    releaseLostClaim, currentUser, dataLoading, refreshData
  } = useApp();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [claimDialog, setClaimDialog] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  const [reportTarget, setReportTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '', type: 'lost', category: 'Electronics', location: '', description: '', image: '', dateLost: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const myId = currentUser?._id || currentUser?.id;

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
      const created = await addLostItem(form);
      setOpenCreate(false);
      setSelectedItem(created);
      setForm({ title: '', type: 'lost', category: 'Electronics', location: '', description: '', image: '', dateLost: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not publish your post.');
    } finally {
      setBusy(false);
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    setBusy(true);
    setError('');
    try {
      const updated = await claimLostItem(selectedItem.id, claimMessage);
      setSelectedItem(updated);
      setClaimDialog(false);
      setClaimMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place your claim.');
    } finally {
      setBusy(false);
    }
  };

  const handleRelease = async () => {
    if (!selectedItem) return;
    setBusy(true);
    setError('');
    try {
      setSelectedItem(await releaseLostClaim(selectedItem.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not release the claim.');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedItem) return;
    setBusy(true);
    setError('');
    try {
      const next = selectedItem.status === 'resolved' ? 'open' : 'resolved';
      setSelectedItem(await toggleLostStatus(selectedItem.id, next));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update the post.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    setBusy(true);
    try {
      await api.deleteLostFoundItem(selectedItem.id);
      setSelectedItem(null);
      await refreshData(); // reload every list from the server
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete the post.');
    } finally {
      setBusy(false);
    }
  };

  const filtered = lostItems.filter((i) => {
    if (typeFilter !== 'all' && i.type !== typeFilter) return false;
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!i.title?.toLowerCase().includes(s) && !i.description?.toLowerCase().includes(s) && !i.location?.toLowerCase().includes(s)) {
        return false;
      }
    }
    return true;
  });

  const isOwner = (item) => item && myId && (item.user?._id || item.user) === myId;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Lost & Found Hub</Typography>
          <Typography variant="body2" color="text.secondary">Reunite students with their belongings on campus</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
          Report Item
        </Button>
      </Box>

      {error && !selectedItem && !openCreate && !claimDialog && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>
      )}

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
          <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
            <MenuItem value="all">Any Status</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="claimed">Claimed</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
          </Select>
        </Stack>
      </Card>

      {dataLoading && lostItems.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No items match your search</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {lostItems.length === 0
              ? 'Be the first to report a lost or found item on campus.'
              : 'Try a different keyword or clear the filters.'}
          </Typography>
          <Button variant="outlined" onClick={() => { setSearch(''); setTypeFilter('all'); setStatusFilter('all'); }}>
            Clear Filters
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((item) => {
            const posterName = item.postedBy?.name || item.user?.name || 'Student';
            const status = STATUS_STYLES[item.status] || STATUS_STYLES.open;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id || item._id}>
                <Card
                  onClick={() => { setSelectedItem(item); setError(''); }}
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
                      <Chip label={status.label} size="small" color={status.color} sx={{ bgcolor: 'white', fontWeight: 700 }} />
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
                      <Typography variant="caption" color="text.secondary">{timeAgo(item.postedAt)}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ------------------------- Details dialog ------------------------- */}
      <Dialog open={Boolean(selectedItem)} onClose={() => setSelectedItem(null)} maxWidth="sm" fullWidth disableRestoreFocus>
        {selectedItem && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>{selectedItem.title}</DialogTitle>
            <DialogContent dividers>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {selectedItem.image && (
                <Box component="img" src={selectedItem.image} sx={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 2, mb: 2 }} />
              )}
              <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Chip label={(selectedItem.type || 'lost').toUpperCase()} color={selectedItem.type === 'lost' ? 'error' : 'success'} size="small" />
                <Chip label={selectedItem.category || 'General'} variant="outlined" size="small" />
                <Chip
                  label={(STATUS_STYLES[selectedItem.status] || STATUS_STYLES.open).label}
                  color={(STATUS_STYLES[selectedItem.status] || STATUS_STYLES.open).color}
                  size="small"
                />
                {selectedItem.dateLost && <Chip label={`📅 ${formatDate(selectedItem.dateLost)}`} size="small" variant="outlined" />}
              </Stack>
              <Typography variant="body1" paragraph>{selectedItem.description}</Typography>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
                📍 Location: {selectedItem.location}
              </Typography>

              <Box sx={{ p: 2, bgcolor: '#F9FAFB', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>{(selectedItem.postedBy?.name || 'S')[0]}</Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {selectedItem.postedBy?.name || 'Student'} {isOwner(selectedItem) && '(you)'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedItem.postedBy?.university || 'Campus Community'}
                    {selectedItem.postedAt ? ` · posted ${timeAgo(selectedItem.postedAt)}` : ''}
                  </Typography>
                </Box>
              </Box>

              {/* Claim status block */}
              {selectedItem.status === 'claimed' && selectedItem.claimedBy && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ p: 2, bgcolor: '#FFFBEB', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                      🟡 Claimed by {(selectedItem.claimedBy.name || 'another student')}
                      {selectedItem.claimedBy._id === myId ? ' (you)' : ''}
                    </Typography>
                    {selectedItem.claimNote && (
                      <Typography variant="body2" color="text.secondary">“{selectedItem.claimNote}”</Typography>
                    )}
                    {selectedItem.claimedAt && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        {timeAgo(selectedItem.claimedAt)}
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2, flexWrap: 'wrap', gap: 1 }}>
              {/* Claim controls */}
              {selectedItem.status === 'open' && !isOwner(selectedItem) && (
                <Button
                  variant="contained"
                  startIcon={<HandshakeIcon />}
                  onClick={() => { setError(''); setClaimDialog(true); }}
                >
                  Claim This Item
                </Button>
              )}
              {selectedItem.claimedBy?._id === myId && (
                <Button variant="outlined" color="warning" onClick={handleRelease} disabled={busy}>
                  Release My Claim
                </Button>
              )}

              {/* Owner controls */}
              {isOwner(selectedItem) && (
                <>
                  <Button
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                    onClick={handleToggleStatus}
                    disabled={busy}
                  >
                    {selectedItem.status === 'resolved' ? 'Reopen Post' : 'Mark as Resolved'}
                  </Button>
                  <Button color="error" startIcon={<DeleteIcon />} onClick={handleDelete} disabled={busy}>
                    Delete
                  </Button>
                </>
              )}

              {/* Everyone else can flag the post */}
              {!isOwner(selectedItem) && (
                <Button
                  color="error"
                  startIcon={<FlagIcon />}
                  onClick={() => setReportTarget(selectedItem)}
                >
                  Report
                </Button>
              )}

              <Button onClick={() => setSelectedItem(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ------------------------- Claim dialog ------------------------- */}
      <Dialog open={claimDialog} onClose={() => setClaimDialog(false)} maxWidth="sm" fullWidth disableRestoreFocus>
        <DialogTitle sx={{ fontWeight: 700 }}>Claim “{selectedItem?.title}”</DialogTitle>
        <Box component="form" onSubmit={handleClaimSubmit}>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Tell the poster why this item is yours (or what you found). They will be notified instantly.
            </Typography>
            <TextField
              label="Proof / message"
              multiline
              rows={3}
              fullWidth
              required
              value={claimMessage}
              onChange={(e) => setClaimMessage(e.target.value)}
              inputProps={{ maxLength: 500 }}
              helperText={`${claimMessage.length}/500`}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setClaimDialog(false)} disabled={busy}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={busy || !claimMessage.trim()}>
              {busy ? <CircularProgress size={18} /> : 'Submit Claim'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ------------------------- Create dialog ------------------------- */}
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
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={form.category} label="Category" onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {['Electronics', 'Bags', 'Keys', 'Books', 'Clothing', 'ID / Cards', 'Other'].map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Location"
                required
                fullWidth
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
              <TextField
                label="Date lost / found"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.dateLost}
                onChange={(e) => setForm({ ...form, dateLost: e.target.value })}
              />
            </Stack>
            <TextField
              label="Description"
              multiline
              rows={3}
              required
              fullWidth
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
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
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {uploadError}
                </Typography>
              )}
              {form.image && (
                <Box
                  component="img"
                  src={api.resolveFileUrl(form.image)}
                  alt="Preview"
                  sx={{ mt: 1, width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 1 }}
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenCreate(false)} disabled={busy}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={busy}>
              {busy ? <CircularProgress size={18} /> : 'Submit & View Post'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ReportDialog
        open={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        targetType="LostFound"
        targetId={reportTarget?.id}
        targetLabel={reportTarget?.title}
      />
    </Box>
  );
}
