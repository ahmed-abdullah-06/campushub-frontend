import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField, Select,
  MenuItem, Chip, Stack, Avatar, Dialog, DialogTitle, DialogContent, DialogActions,
  Rating, CircularProgress, Alert, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FlagIcon from '@mui/icons-material/Flag';
import DeleteIcon from '@mui/icons-material/Delete';
import { useApp } from '../context/AppContext';
import * as api from '../api';
import ReportDialog from '../components/common/ReportDialog';
import { timeAgo } from '../utils/format';

const SUBJECTS = ['Mathematics', 'Computer Science', 'Chemistry', 'Economics', 'Design', 'Physics', 'Biology', 'General'];

export default function Notes() {
  const {
    notes, addNote, downloadNote, rateNote, currentUser, dataLoading, refreshData
  } = useApp();

  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [selectedNote, setSelectedNote] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ title: '', courseCode: '', subject: 'Computer Science', description: '', pages: '' });
  const [noteFile, setNoteFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileError, setFileError] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null); // { fileUrl, fileName, fileSize }

  const myId = currentUser?._id || currentUser?.id;
  const isOwner = (note) => note && myId && (note.uploader?._id || note.uploader) === myId;

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNoteFile(file);
    setUploadingFile(true);
    setFileError('');
    try {
      const result = await api.uploadNoteFile(file);
      setUploadedFile(result);
    } catch (err) {
      setFileError(err.response?.data?.message || 'Upload failed. Use a smaller document.');
      setNoteFile(null);
      setUploadedFile(null);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const created = await addNote({
        title: form.title,
        courseCode: form.courseCode,
        department: form.subject,
        description: form.description,
        pages: form.pages ? Number(form.pages) : undefined,
        fileUrl: uploadedFile?.fileUrl || '',
        fileSize: uploadedFile?.fileSize || ''
      });
      setOpenCreate(false);
      setSelectedNote(created);
      setForm({ title: '', courseCode: '', subject: 'Computer Science', description: '', pages: '' });
      setNoteFile(null);
      setUploadedFile(null);
      setFileError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not publish your notes.');
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (!selectedNote) return;
    setBusy(true);
    try {
      const updated = await downloadNote(selectedNote.id);
      setSelectedNote(updated);
      if (updated.fileUrl) {
        window.open(updated.fileUrl, '_blank', 'noopener');
      } else {
        setError('This note has no attached file yet — only its summary is available.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Download failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleRate = async (value) => {
    if (!selectedNote) return;
    setBusy(true);
    try {
      setSelectedNote(await rateNote(selectedNote.id, value));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save your rating.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNote) return;
    setBusy(true);
    try {
      await api.deleteNote(selectedNote.id);
      setSelectedNote(null);
      await refreshData();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete the note.');
    } finally {
      setBusy(false);
    }
  };

  const filtered = notes.filter((n) => {
    const subj = n.department || 'General';
    const code = n.courseCode || '';
    if (subjectFilter !== 'All' && subj !== subjectFilter) return false;
    if (search && !n.title?.toLowerCase().includes(search.toLowerCase()) && !code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Study Notes</Typography>
          <Typography variant="body2" color="text.secondary">Share and download lecture notes with students</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
          Upload Notes
        </Button>
      </Box>

      {error && !selectedNote && !openCreate && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>
      )}

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
            {['All', ...SUBJECTS].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </Stack>
      </Card>

      {dataLoading && notes.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No notes shared yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {notes.length === 0 ? 'Be the first to upload your course notes for classmates.' : 'Try a different search.'}
          </Typography>
          <Button variant="outlined" onClick={() => { setSearch(''); setSubjectFilter('All'); }}>Clear Filters</Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((note) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={note.id}>
              <Card
                onClick={() => { setSelectedNote(note); setError(''); }}
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

                    <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
                      <Chip label={note.department || 'General'} size="small" color="primary" variant="outlined" />
                      <Chip label={`${note.pages || 5} pages`} size="small" />
                      {note.fileUrl && <Chip label="PDF/Doc" size="small" color="success" variant="outlined" />}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ height: 40, overflow: 'hidden', mb: 2 }}>
                      {note.description}
                    </Typography>
                  </Box>

                  <Box sx={{ pt: 1, borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Rating value={note.rating || 0} precision={0.5} size="small" readOnly />
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
      )}

      {/* ------------------------- Note details ------------------------- */}
      <Dialog open={Boolean(selectedNote)} onClose={() => setSelectedNote(null)} maxWidth="sm" fullWidth disableRestoreFocus>
        {selectedNote && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>{selectedNote.title}</DialogTitle>
            <DialogContent dividers>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
                <Chip label={selectedNote.courseCode} color="primary" />
                <Chip label={selectedNote.department || 'General'} variant="outlined" />
                <Chip label={`${selectedNote.pages || 5} Pages`} />
                {selectedNote.uploaderName && <Chip label={`by ${selectedNote.uploaderName}`} size="small" />}
              </Stack>
              <Typography variant="body1" paragraph>{selectedNote.description}</Typography>

              <Grid container spacing={2} sx={{ mb: 2, p: 2, bgcolor: '#F9FAFB', borderRadius: 2 }}>
                <Grid size={4} sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">File Size</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{selectedNote.fileSize || '—'}</Typography>
                </Grid>
                <Grid size={4} sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Downloads</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{selectedNote.downloads || 0}</Typography>
                </Grid>
                <Grid size={4} sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Rating</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {selectedNote.rating ? `⭐ ${selectedNote.rating}` : 'Not rated'}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 1.5 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Rate this note</Typography>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Rating
                  value={Number(selectedNote.rating) || 0}
                  precision={1}
                  disabled={busy}
                  onChange={(e, value) => value && handleRate(value)}
                />
                <Typography variant="caption" color="text.secondary">
                  {selectedNote.ratingCount ? `from ${selectedNote.ratingCount} student${selectedNote.ratingCount > 1 ? 's' : ''}` : 'Be the first to rate'}
                </Typography>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, flexWrap: 'wrap', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={busy ? <CircularProgress size={16} /> : <DownloadIcon />}
                color="primary"
                onClick={handleDownload}
                disabled={busy}
              >
                {selectedNote.fileUrl ? 'Download File' : 'No File Attached'}
              </Button>
              {isOwner(selectedNote) && (
                <Button color="error" startIcon={<DeleteIcon />} onClick={handleDelete} disabled={busy}>
                  Delete
                </Button>
              )}
              {!isOwner(selectedNote) && (
                <Button color="error" startIcon={<FlagIcon />} onClick={() => setReportTarget(selectedNote)}>
                  Report
                </Button>
              )}
              <Button onClick={() => setSelectedNote(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ------------------------- Upload notes ------------------------- */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth disableRestoreFocus>
        <DialogTitle sx={{ fontWeight: 700 }}>Upload Study Notes</DialogTitle>
        <Box component="form" onSubmit={handleCreateSubmit}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Title" required fullWidth value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Stack direction="row" spacing={2}>
              <TextField label="Course Code" required fullWidth value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} placeholder="CS 201" />
              <Select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} sx={{ minWidth: 180 }}>
                {SUBJECTS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </Stack>
            <TextField label="Pages" type="number" fullWidth value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })} inputProps={{ min: 1 }} />
            <TextField label="Description" multiline rows={3} required fullWidth value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

            <Box>
              <Button
                component="label"
                variant="outlined"
                startIcon={uploadingFile ? <CircularProgress size={16} /> : <UploadFileIcon />}
                disabled={uploadingFile}
                fullWidth
              >
                {uploadingFile ? 'Uploading file...' : noteFile ? `Attached: ${noteFile.name}` : 'Attach a file (PDF/DOC/PPT/TXT, max 10MB)'}
                <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip" hidden onChange={handleFileSelect} />
              </Button>
              {fileError && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>{fileError}</Typography>
              )}
              {uploadedFile && (
                <Alert severity="success" sx={{ mt: 1 }}>
                  {uploadedFile.fileName} ({uploadedFile.fileSize}) attached
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenCreate(false)} disabled={busy || uploadingFile}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={busy || uploadingFile}>
              {busy ? <CircularProgress size={18} /> : 'Publish Notes'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ReportDialog
        open={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        targetType="Note"
        targetId={reportTarget?.id}
        targetLabel={reportTarget?.title}
      />
    </Box>
  );
}
