import React, { useState } from 'react';
import {
  Box, Card, Typography, Switch, FormControlLabel, Divider, Stack,
  TextField, Button, Alert, Select, MenuItem, FormControl, InputLabel,
  CircularProgress
} from '@mui/material';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const { currentUser, logout, saveSettings } = useApp();

  const saved = currentUser?.settings || {};
  const [emailNotifs, setEmailNotifs] = useState(saved.emailNotifs ?? true);
  const [pushNotifs, setPushNotifs] = useState(saved.pushNotifs ?? true);
  const [profileVisible, setProfileVisible] = useState(saved.profileVisible ?? true);
  const [language, setLanguage] = useState(saved.language ?? 'en');

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // { type, text }

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    // Persisted server-side on the account (PUT /api/users/settings),
    // so the preferences follow the student to any device.
    const result = await saveSettings({ emailNotifs, pushNotifs, profileVisible, language });
    setSaving(false);
    setStatus(
      result.success
        ? { type: 'success', text: 'Settings saved to your account.' }
        : { type: 'error', text: result.message }
    );
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Settings</Typography>

      {status && <Alert severity={status.type} sx={{ mb: 2 }}>{status.text}</Alert>}

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Account</Typography>
        <Stack spacing={2}>
          <TextField label="Full Name" value={currentUser?.name || ''} disabled fullWidth />
          <TextField label="Email" value={currentUser?.email || ''} disabled fullWidth />
          <TextField label="Role" value={currentUser?.role || 'student'} disabled fullWidth />
          <Typography variant="caption" color="text.secondary">
            To change your name, email or role, go to <b>My Profile</b>.
          </Typography>
        </Stack>
      </Card>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Notifications</Typography>
        <FormControlLabel
          control={<Switch checked={emailNotifs} onChange={(e) => setEmailNotifs(e.target.checked)} />}
          label="Email notifications"
        />
        <br />
        <FormControlLabel
          control={<Switch checked={pushNotifs} onChange={(e) => setPushNotifs(e.target.checked)} />}
          label="Push / in-app notifications"
        />
      </Card>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Privacy</Typography>
        <FormControlLabel
          control={<Switch checked={profileVisible} onChange={(e) => setProfileVisible(e.target.checked)} />}
          label="Make my profile visible to other students"
        />
      </Card>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Preferences</Typography>
        <FormControl fullWidth>
          <InputLabel id="lang-label">Language</InputLabel>
          <Select
            labelId="lang-label"
            value={language}
            label="Language"
            onChange={(e) => setLanguage(e.target.value)}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="ur">Urdu</MenuItem>
          </Select>
        </FormControl>
      </Card>

      <Divider sx={{ mb: 2 }} />

      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? <CircularProgress size={18} /> : 'Save Changes'}
        </Button>
        <Button variant="outlined" color="error" onClick={logout}>Sign Out</Button>
      </Stack>
    </Box>
  );
}
