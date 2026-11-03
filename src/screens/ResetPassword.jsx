import React, { useState } from 'react';
import { Box, Card, Typography, Button, TextField, Stack, Alert, CircularProgress } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useApp } from '../context/AppContext';

// ---------------------------------------------------------------------------
// Reached from the emailed link: /#/reset-password?token=<token>
// Sets a new password; on success the API logs the user straight in.
// ---------------------------------------------------------------------------
export default function ResetPassword({ token, onDone }) {
  const { completePasswordReset } = useApp();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await completePasswordReset(token, password);
      if (onDone) onDone(); // navigates to the dashboard (session is stored)
    } catch (err) {
      setError(err.response?.data?.message
        || 'This reset link is invalid or has expired. Please request a new one.');
    } finally {
      setSubmitting(false);
    }
  };

  const tokenMissing = !token;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F4F5FA', p: 2 }}>
      <Card sx={{ maxWidth: 430, width: '100%', p: 4, borderRadius: 3, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: 3, bgcolor: 'primary.main', color: 'white', mb: 1.5 }}>
            <LockResetIcon fontSize="large" />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
            Choose a new password
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your reset link is single-use and expires 30 minutes after it was sent.
          </Typography>
        </Box>

        {tokenMissing ? (
          <>
            <Alert severity="error" sx={{ mb: 2.5 }}>
              This reset link is missing its token. Please open the latest email and use the link inside it.
            </Alert>
            <Button variant="outlined" fullWidth onClick={() => window.location.hash = '#/'}>
              Back to CampusHub
            </Button>
          </>
        ) : (
          <>
            {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}
            <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
              <TextField
                label="New Password"
                type="password"
                required
                fullWidth
                autoFocus
                helperText="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                label="Confirm New Password"
                type="password"
                required
                fullWidth
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <Button type="submit" variant="contained" fullWidth sx={{ py: 1.2, fontWeight: 700 }} disabled={submitting}>
                {submitting ? <CircularProgress size={20} color="inherit" /> : 'Update Password'}
              </Button>
            </Stack>
          </>
        )}
      </Card>
    </Box>
  );
}
