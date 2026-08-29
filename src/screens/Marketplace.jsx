import React, { useState } from 'react';
import { 
  Box, Grid, Card, CardMedia, CardContent, Typography, Button, 
  TextField, Select, MenuItem, Chip, Stack, Avatar, Dialog, 
  DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useApp } from '../context/AppContext';

export default function Marketplace() {
  const { marketplaceItems, addMarketplaceItem, markMarketplaceSold, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [msgSent, setMsgSent] = useState(false);

  const [form, setForm] = useState({ title: '', price: '', category: 'Electronics', condition: 'Good', description: '', image: '' });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const created = addMarketplaceItem(form);
    setOpenCreate(false);
    setSelectedItem(created);
    setForm({ title: '', price: '', category: 'Electronics', condition: 'Good', description: '', image: '' });
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Student Marketplace</Typography>
          <Typography variant="body2" color="text.secondary">Buy and sell goods with students on campus</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
          List New Item
        </Button>
      </Box>

      <Card sx={{ p: 2, mb: 4 }}>
        <TextField 
          fullWidth 
          size="small" 
          placeholder="Search marketplace by item name..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ color: '#9CA3AF', mr: 1 }} /> }} 
        />
      </Card>

      <Grid container spacing={3}>
        {marketplaceItems.filter((i) => i.title.toLowerCase().includes(search.toLowerCase())).map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id || item._id}>
            <Card onClick={() => { setSelectedItem(item); setMsgSent(false); }} sx={{ cursor: 'pointer', height: '100%' }}>
              <Box sx={{ position: 'relative' }}>
                <CardMedia component="img" height="180" image={item.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500'} />
                <Chip label={item.condition || 'Good'} size="small" color="success" sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 700 }} />
                {item.status === 'sold' && (
                  <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 800 }}>SOLD</Typography>
                  </Box>
                )}
              </Box>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{item.title}</Typography>
                <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700, my: 1 }}>${item.price}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>{item.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Item Details Dialog */}
      <Dialog open={Boolean(selectedItem)} onClose={() => setSelectedItem(null)} maxWidth="sm" fullWidth disableRestoreFocus>
        {selectedItem && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>{selectedItem.title}</DialogTitle>
            <DialogContent dividers>
              <Box component="img" src={selectedItem.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500'} sx={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 2, mb: 2 }} />
              <Typography variant="h4" color="primary" sx={{ fontWeight: 800, mb: 1 }}>${selectedItem.price}</Typography>
              <Typography variant="body1" paragraph>{selectedItem.description}</Typography>
              <Chip label={`Condition: ${selectedItem.condition || 'Good'}`} color="success" size="small" sx={{ mb: 2 }} />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              {(selectedItem.seller?.id === currentUser?.id || selectedItem.seller?._id === currentUser?._id) ? (
                <Button variant="contained" color="success" onClick={() => { markMarketplaceSold(selectedItem.id || selectedItem._id); setSelectedItem(null); }}>
                  Mark as Sold
                </Button>
              ) : (
                <Button variant="contained" startIcon={<ShoppingBagIcon />} onClick={() => setMsgSent(true)}>
                  {msgSent ? 'Message Sent to Seller!' : 'Contact Seller'}
                </Button>
              )}
              <Button onClick={() => setSelectedItem(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Item Creation Modal */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth disableRestoreFocus>
        <DialogTitle sx={{ fontWeight: 700 }}>List an Item for Sale</DialogTitle>
        <Box component="form" onSubmit={handleCreateSubmit}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Title" required fullWidth value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <TextField label="Price ($)" type="number" required fullWidth value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <TextField label="Description" multiline rows={3} required fullWidth value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <TextField label="Image URL" fullWidth value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Publish Listing</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}