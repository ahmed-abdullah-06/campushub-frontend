import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField, Select,
  MenuItem, Chip, Stack, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Rating
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useApp } from '../context/AppContext';

export default function Notes() {
  const { notes, addNote } = useApp();
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [selectedNote, setSelectedNote] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const [form, setForm] = useState({ title: '', course: '', courseCode: '', subject: 'Mathematics', description: '', pages: '' });

  const subjects = ['All', 'Mathematics', 'Computer Science', 'Chemistry', 'Economics', 'Design', 'Physics', 'Biology'];

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const created = addNote(form);
    setOpenCreate(false);
    setSelectedNote(created);
    setForm({ title: '', course: '', courseCode: '', subject: 'Mathematics', description: '', pages: '' });
  };

  const filtered = notes.filter((n) => {
    const subj = n.subject || n.department || 'General';
    const code = n.courseCode || '';
    if (subjectFilter !== 'All' && subj !== subjectFilter) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Study Notes</Typography>
          <Typography variant="body2" color="text.secondary">Share and download lecture notes with students</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
          Upload Notes
        </Button>
      </Box>

      <Card sx={{ p: 2, mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            placeholder="Search notes by course title or code..."
            size="small"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ color: '#9CA3AF', mr: 1 }} /> }}
          />
          <Select size="small" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} sx={{ minWidth: 180 }}>
            {subjects.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </Stack>
      </Card>

      <Grid container spacing={3}>
        {filtered.map((note) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={note.id || note._id}>
            <Card
              onClick={() => { setSelectedNote(note); setDownloaded(false); }}
              sx={{
                height: '100%',
                cursor: 'pointer',
                p: 1,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#EEF2FF', color: 'primary.main', borderRadius: 2 }}>
                      <MenuBookIcon />
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>{note.title}</Typography>
                      <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>{note.courseCode}</Typography>
                    </Box>
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                    <Chip label={note.subject || note.department || 'General'} size="small" color="primary" variant="outlined" />
                    <Chip label={`${note.pages || 5} pages`} size="small" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ height: 40, overflow: 'hidden', mb: 2 }}>
                    {note.description}
                  </Typography>
                </Box>

                <Box sx={{ pt: 1, borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Rating value={note.rating || 5} precision={0.5} size="small" readOnly />
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <DownloadIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">{note.downloads || 0}</Typography>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Note Details Dialog */}
      <Dialog open={Boolean(selectedNote)} onClose={() => setSelectedNote(null)} maxWidth="sm" fullWidth disableRestoreFocus>
        {selectedNote && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>{selectedNote.title}</DialogTitle>
            <DialogContent dividers>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip label={selectedNote.courseCode} color="primary" />
                <Chip label={selectedNote.subject || selectedNote.department || 'General'} variant="outlined" />
                <Chip label={`${selectedNote.pages || 5} Pages`} />
              </Stack>
              <Typography variant="body1" paragraph>{selectedNote.description}</Typography>
              <Grid container spacing={2} sx={{ mb: 2, p: 2, bgcolor: '#F9FAFB', borderRadius: 2 }}>
                <Grid size={4} sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">File Size</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{selectedNote.fileSize || '2.5 MB'}</Typography>
                </Grid>
                <Grid size={4} sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Downloads</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{selectedNote.downloads || 0}</Typography>
                </Grid>
                <Grid size={4} sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Rating</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>⭐ {selectedNote.rating || 5}</Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                color={downloaded ? 'success' : 'primary'}
                onClick={() => setDownloaded(true)}
              >
                {downloaded ? 'Downloaded ✓' : 'Download PDF'}
              </Button>
              <Button onClick={() => setSelectedNote(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Note Creation Modal */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth disableRestoreFocus>
        <DialogTitle sx={{ fontWeight: 700 }}>Upload Study Notes</DialogTitle>
        <Box component="form" onSubmit={handleCreateSubmit}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Title" required fullWidth value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Stack direction="row" spacing={2}>
              <TextField label="Course Name" required fullWidth value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} />
              <TextField label="Course Code" required fullWidth value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} />
            </Stack>
            <TextField label="Pages" type="number" required fullWidth value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })} />
            <TextField label="Description" multiline rows={3} required fullWidth value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Publish Notes</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}