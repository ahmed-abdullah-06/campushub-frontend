import React, { useState } from 'react';
import {
  Box, Card, Typography, Switch, FormControlLabel, Divider, Stack,
  TextField, Button, Alert, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const { currentUser, logout } = useApp();

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);
  const [language, setLanguage] = useState('en');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // No backend "settings" endpoint exists yet, so this persists locally for now.
    // Once you add a PATCH /api/users/settings route, swap this for an api.js call.
    localStorage.setItem('campushub_settings', JSON.stringify({
      emailNotifs, pushNotifs, profileVisible, language
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Settings</Typography>

      {saved && <Alert severity="success" sx={{ mb: 2 }}>Settings saved.</Alert>}

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Account</Typography>
        <Stack spacing={2}>
          <TextField label="Full Name" value={currentUser?.name || ''} disabled fullWidth />
          <TextField label="Email" value={currentUser?.email || ''} disabled fullWidth />
          <Typography variant="caption" color="text.secondary">
            To change your name or email, go to My Profile.
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

      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={handleSave}>Save Changes</Button>
        <Button variant="outlined" color="error" onClick={logout}>Sign Out</Button>
      </Stack>
    </Box>
  );
}