import React, { useState } from 'react';
import { Box, Card, Typography, Button, TextField, Stack, Alert, Tabs, Tab, Divider, Chip } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useApp } from '../context/AppContext';

export default function Auth({ initialMode = 'login', onLogin }) {
  const { login, register } = useApp();
  const [mode, setMode] = useState(initialMode === 'register' ? 'register' : 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'register') {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      if (onLogin) onLogin();
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials and try again.');
    }
  };

  const handleDemoStudentLogin = async () => {
    setError('');
    await login('alex.j@university.edu', 'password123');
    if (onLogin) onLogin();
  };

  const handleDemoAdminLogin = async () => {
    setError('');
    await login('admin@campushub.edu', 'admin123');
    if (onLogin) onLogin();
  };

  return (
    <Box sx={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F4F5FA', p: 2 }}>
      <Card sx={{ maxWidth: 450, width: '100%', p: 4, borderRadius: 3, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: 3, bgcolor: 'primary.main', color: 'white', mb: 1.5 }}>
            <SchoolIcon fontSize="large" />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
            CampusHub
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your all-in-one student campus community
          </Typography>
        </Box>

        <Tabs 
          value={mode} 
          onChange={(e, val) => { setMode(val); setError(''); }} 
          variant="fullWidth" 
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab value="login" label="Sign In" sx={{ fontWeight: 700 }} />
          <Tab value="register" label="Register" sx={{ fontWeight: 700 }} />
        </Tabs>

        {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

        <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <TextField 
              label="Full Name" 
              placeholder="e.g. Alex Johnson"
              required 
              fullWidth 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <TextField 
            label="University Email" 
            placeholder="student@university.edu"
            type="email" 
            required 
            fullWidth 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField 
            label="Password" 
            type="password" 
            required 
            fullWidth 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" fullWidth size="large" sx={{ py: 1.2, fontWeight: 700 }}>
            {mode === 'register' ? 'Create Account' : 'Sign In'}
          </Button>
        </Stack>

        <Divider sx={{ my: 3 }}>
          <Chip label="Quick Evaluation Logins" size="small" sx={{ fontSize: '0.75rem', color: '#6B7280' }} />
        </Divider>

        <Stack direction="row" spacing={1.5}>
          <Button 
            variant="outlined" 
            fullWidth 
            size="small" 
            startIcon={<PersonIcon />}
            onClick={handleDemoStudentLogin}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Demo Student
          </Button>
          <Button 
            variant="outlined" 
            color="secondary" 
            fullWidth 
            size="small" 
            startIcon={<AdminPanelSettingsIcon />}
            onClick={handleDemoAdminLogin}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Demo Admin
          </Button>
        </Stack>
      </Card>
    </Box>
  );
}