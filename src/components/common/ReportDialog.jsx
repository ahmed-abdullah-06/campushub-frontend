import React, { useState } from 'react';
import {
  Box, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Typography, Alert, Stack, CircularProgress
} from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import { useApp } from '../../context/AppContext';

const REASONS = [
  'Inappropriate or offensive content',
  'Scam or misleading listing',
  'Spam or duplicate post',
  'Item no longer relevant'
];

/**
 * Shared "Report this content" dialog used by Lost & Found, Marketplace,
 * Events, Notes and Skill profiles. Posts a real report to /api/reports,
 * which notifies every admin.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} props.targetType - LostFound | Marketplace | Event | Note | Skill | User
 * @param {string} props.targetId - id of the reported document
 * @param {string} props.targetLabel - shown in the heading, e.g. the item title
 */
export default function ReportDialog({ open, onClose, targetType, targetId, targetLabel }) {
  const { submitReport } = useApp();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleClose = () => {
    setReason('');
    setDetails('');
    setError('');
    setDone(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullReason = reason === 'Other' ? details.trim() : reason;
    if (!fullReason) {
      setError('Please choose or write a reason.');
      return;
    }
    setSending(true);
    setError('');
    try {
      await submitReport({ targetType, targetId, reason: fullReason });
      setDone(true);
      setTimeout(handleClose, 1600);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send the report. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth disableRestoreFocus>
      <DialogTitle sx={{ fontWeight: 700 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <FlagIcon color="error" />
          <span>Report Content</span>
        </Stack>
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers>
          {done ? (
            <Alert severity="success">
              Thanks! Your report was sent to the campus admins for review.
            </Alert>
          ) : (
            <Stack spacing={2}>
              {targetLabel && (
                <Typography variant="body2" color="text.secondary">
                  You are reporting: <b>{targetLabel}</b>
                </Typography>
              )}
              <TextField
                select
                SelectProps={{ native: true }}
                label="Reason"
                value={reason}
                onChange={(e) => { setReason(e.target.value); setError(''); }}
                required
                fullWidth
              >
                <option value="">Select a reason…</option>
                {REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
                <option value="Other">Other (describe below)</option>
              </TextField>

              {reason === 'Other' && (
                <TextField
                  label="Describe the problem"
                  multiline
                  rows={3}
                  required
                  fullWidth
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              )}

              {error && <Alert severity="error">{error}</Alert>}
            </Stack>
          )}
        </DialogContent>
        {!done && (
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose} disabled={sending}>Cancel</Button>
            <Button type="submit" variant="contained" color="error" disabled={sending}>
              {sending ? <CircularProgress size={18} /> : 'Send Report'}
            </Button>
          </DialogActions>
        )}
      </Box>
    </Dialog>
  );
}
