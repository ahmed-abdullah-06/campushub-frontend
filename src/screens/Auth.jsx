import React, { useState } from 'react';
import { Box, Card, Typography, Button, TextField, Stack, Alert, Tabs, Tab, Divider, Chip, CircularProgress } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useApp } from '../context/AppContext';

// Demo quick-logins are a development/evaluation convenience only.
// In a production build these buttons are not rendered at all, and even in dev
// they perform a REAL login against the API — they never fake a session.
const IS_DEV = Boolean(import.meta.env.DEV);
const DEMO_ACCOUNTS = [
  { label: 'Demo Student', email: 'alex.j@university.edu', password: 'password123', icon: <PersonIcon /> },
  { label: 'Demo Admin', email: 'admin@campushub.edu', password: 'admin123', icon: <AdminPanelSettingsIcon /> }
];

export default function Auth({ initialMode = 'login', onLogin, onBack }) {
  const { login, register, requestPasswordReset } = useApp();
  const [mode, setMode] = useState(initialMode === 'register' ? 'register' : 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);
    try {
      if (mode === 'register') {
        await register(name, email, password);
      } else if (mode === 'forgot') {
        const result = await requestPasswordReset(email);
        setNotice(result.message);
      } else {
        await login(email, password);
      }
      if (mode !== 'forgot' && onLogin) onLogin();
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (account) => {
    setError('');
    setNotice('');
    setSubmitting(true);
    try {
      await login(account.email, account.password);
      if (onLogin) onLogin();
    } catch (err) {
      const message = err.response?.data?.message || 'Could not reach the CampusHub API.';
      setError(
        message.includes('Invalid')
          ? `${message} — run "npm run seed:demo" in the backend folder to create the demo accounts.`
          : message
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F4F5FA', p: 2 }}>
      {onBack && (
        <Button
          onClick={onBack}
          startIcon={<SchoolIcon sx={{ fontSize: 16 }} />}
          sx={{ position: 'fixed', top: 16, left: 16, color: '#4B5563', fontWeight: 700 }}
        >
          CampusHub Home
        </Button>
      )}
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
          value={mode === 'forgot' ? false : mode}
          onChange={(e, val) => { setMode(val); setError(''); setNotice(''); }}
          variant="fullWidth"
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab value="login" label="Sign In" sx={{ fontWeight: 700 }} />
          <Tab value="register" label="Register" sx={{ fontWeight: 700 }} />
        </Tabs>

        {notice && <Alert severity="success" sx={{ mb: 2.5 }}>{notice}</Alert>}
        {!notice && error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

        {mode === 'forgot' ? (
          <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
            <Typography variant="body2" color="text.secondary">
              Enter your account email and we&apos;ll send you a link to choose a new password.
            </Typography>
            <TextField
              label="University Email"
              placeholder="student@university.edu"
              type="email"
              required
              fullWidth
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" variant="contained" fullWidth sx={{ py: 1.2, fontWeight: 700 }} disabled={submitting}>
              {submitting ? <CircularProgress size={20} color="inherit" /> : 'Send Reset Link'}
            </Button>
            <Button
              variant="text"
              fullWidth
              onClick={() => { setMode('login'); setError(''); setNotice(''); }}
            >
              Back to Sign In
            </Button>
          </Stack>
        ) : (
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
            helperText={mode === 'register' ? 'At least 6 characters' : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === 'login' && (
            <Box sx={{ textAlign: 'right', mt: -1.5 }}>
              <Button
                variant="text"
                size="small"
                onClick={() => { setMode('forgot'); setError(''); setNotice(''); }}
                sx={{ color: 'primary.main', fontSize: '0.78rem', p: 0, minWidth: 0 }}
              >
                Forgot password?
              </Button>
            </Box>
          )}
          <Button type="submit" variant="contained" fullWidth sx={{ py: 1.2, fontWeight: 700 }} disabled={submitting}>
            {submitting ? <CircularProgress size={20} color="inherit" /> : mode === 'register' ? 'Create Account' : 'Sign In'}
          </Button>
        </Stack>
        )}

        {IS_DEV && mode !== 'forgot' && (
          <>
            <Divider sx={{ my: 3 }}>
              <Chip label="Dev Quick Logins" size="small" sx={{ fontSize: '0.75rem', color: '#6B7280' }} />
            </Divider>
            <Stack direction="row" spacing={1.5}>
              {DEMO_ACCOUNTS.map((account) => (
                <Button
                  key={account.email}
                  variant="outlined"
                  fullWidth
                  size="small"
                  startIcon={account.icon}
                  onClick={() => handleDemoLogin(account)}
                  disabled={submitting}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  {account.label}
                </Button>
              ))}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, textAlign: 'center' }}>
              Real accounts — created with <b>npm run seed:demo</b> (backend)
            </Typography>
          </>
        )}
      </Card>
    </Box>
  );
}
