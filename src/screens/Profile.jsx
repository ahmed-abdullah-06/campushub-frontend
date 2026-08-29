import React, { useState } from 'react';
import {
  Box, Card, Typography, Button, Avatar, Stack, TextField, Divider, Grid, Alert,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { useApp } from '../context/AppContext';

const ROLE_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'staff', label: 'Staff' },
  { value: 'alumni', label: 'Alumni' },
];

export default function Profile() {
  const { currentUser, updateProfile } = useApp();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const buildFormFromUser = () => ({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    role: ['student', 'faculty', 'staff', 'alumni'].includes(currentUser?.role) ? currentUser.role : 'student',
    university: currentUser?.university || '',
    major: currentUser?.major || '',
    year: currentUser?.year || '',
    bio: currentUser?.bio || '',
  });

  const [form, setForm] = useState(buildFormFromUser());

  const isAdmin = currentUser?.role === 'admin';
  const roleLabel = ROLE_OPTIONS.find(r => r.value === currentUser?.role)?.label
    || (isAdmin ? 'Admin' : currentUser?.role || 'Student');

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleEditToggle = () => {
    if (!editing) {
      setForm(buildFormFromUser());
      setError('');
      setSuccess(false);
    }
    setEditing(!editing);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    if (!form.email.trim()) {
      setError('Email cannot be empty.');
      return;
    }
    setSaving(true);
    setError('');
    const result = await updateProfile(form);
    setSaving(false);
    if (result.success) {
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } else {
      setError(result.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {success && <Alert severity="success" sx={{ mb: 2 }}>Profile updated.</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}>
              {(currentUser?.name || 'S')[0]}
            </Avatar>
            <Box>
              {editing ? (
                <TextField
                  variant="standard"
                  value={form.name}
                  onChange={handleChange('name')}
                  sx={{ mb: 0.5 }}
                  slotProps={{ input: { sx: { fontSize: '1.5rem', fontWeight: 700 } } }}
                />
              ) : (
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{currentUser?.name || 'Student User'}</Typography>
              )}
              <Typography variant="body2" color="text.secondary">{currentUser?.email}</Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            {editing && (
              <Button variant="outlined" color="inherit" startIcon={<CloseIcon />} onClick={() => setEditing(false)} disabled={saving}>
                Cancel
              </Button>
            )}
            <Button
              variant={editing ? 'contained' : 'outlined'}
              startIcon={editing ? <SaveIcon /> : <EditIcon />}
              onClick={editing ? handleSave : handleEditToggle}
              disabled={saving}
            >
              {saving ? 'Saving...' : editing ? 'Save' : 'Edit Profile'}
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {editing ? (
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={form.email}
                onChange={handleChange('email')}
                helperText="Changing this changes your login email too."
              />
              {isAdmin ? (
                <TextField label="Role" fullWidth value="Admin" disabled helperText="Admin role can only be changed by another admin." />
              ) : (
                <FormControl fullWidth>
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select labelId="role-label" label="Role" value={form.role} onChange={handleChange('role')}>
                    {ROLE_OPTIONS.map((r) => (
                      <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="University" fullWidth value={form.university} onChange={handleChange('university')} />
              <TextField
                label="Major / Department"
                fullWidth
                value={form.major}
                onChange={handleChange('major')}
                placeholder="e.g. Computer Science, or your department"
              />
            </Stack>

            <TextField
              label="Year / Position"
              fullWidth
              value={form.year}
              onChange={handleChange('year')}
              placeholder="e.g. Junior (Year 3), Professor, Lab Coordinator"
            />

            <TextField
              label="Bio"
              multiline
              rows={3}
              fullWidth
              value={form.bio}
              onChange={handleChange('bio')}
              helperText={`${form.bio.length}/500`}
            />
          </Stack>
        ) : (
          <>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {currentUser?.bio || 'No bio added yet.'}
            </Typography>
            <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
              {currentUser?.university && (
                <Typography variant="body2"><strong>University:</strong> {currentUser.university}</Typography>
              )}
              {currentUser?.major && (
                <Typography variant="body2"><strong>Major/Dept:</strong> {currentUser.major}</Typography>
              )}
              {currentUser?.year && (
                <Typography variant="body2"><strong>Year/Position:</strong> {currentUser.year}</Typography>
              )}
            </Stack>
          </>
        )}
      </Card>

      <Grid container spacing={2}>
        {[
          { label: 'Role', val: roleLabel },
          { label: 'Status', val: 'Active Member' },
          { label: 'University', val: currentUser?.university || '—' },
        ].map((item, idx) => (
          <Grid size={4} key={idx}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">{item.label}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{item.val}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}