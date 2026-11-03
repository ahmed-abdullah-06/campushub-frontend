import React, { useState } from 'react';
import {
  Box, Grid, Card, Typography, Button, TextField,
  Chip, Stack, Avatar, Dialog, DialogTitle, DialogContent, DialogActions,
  Rating, Tabs, Tab, Alert, CircularProgress, Badge, Divider, IconButton
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import SendIcon from '@mui/icons-material/Send';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import FlagIcon from '@mui/icons-material/Flag';
import { useApp } from '../context/AppContext';
import ReportDialog from '../components/common/ReportDialog';
import { timeAgo } from '../utils/format';

const parseSkillInput = (value) =>
  value.split(',').map((s) => s.trim()).filter(Boolean);

export default function Skills() {
  const {
    skills, skillRequests, sendSkillRequest, respondSkillRequest,
    saveMySkillProfile, currentUser, dataLoading
  } = useApp();

  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(0);
  const [targetUser, setTargetUser] = useState(null);
  const [msg, setMsg] = useState('');
  const [offered, setOffered] = useState('');
  const [wanted, setWanted] = useState('');
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', text }
  const [busy, setBusy] = useState(false);

  // "My skill profile" editor
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ offered: '', wanted: '', bio: '' });
  const [profileError, setProfileError] = useState('');

  const [reportTarget, setReportTarget] = useState(null);

  const myId = currentUser?._id || currentUser?.id;
  const myProfile = skills.find((s) => (s.user?._id || s.user) === myId);

  const openProfileEditor = () => {
    setProfileForm({
      offered: (myProfile?.offeredSkills || []).join(', '),
      wanted: (myProfile?.wantedSkills || []).join(', '),
      bio: myProfile?.bio || ''
    });
    setProfileError('');
    setProfileOpen(true);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const offeredSkills = parseSkillInput(profileForm.offered);
    const wantedSkills = parseSkillInput(profileForm.wanted);
    if (offeredSkills.length === 0 && wantedSkills.length === 0) {
      setProfileError('Add at least one skill you can teach or want to learn.');
      return;
    }
    setBusy(true);
    setProfileError('');
    try {
      await saveMySkillProfile({ offeredSkills, wantedSkills, bio: profileForm.bio });
      setProfileOpen(false);
      setFeedback({ type: 'success', text: 'Your skill profile is live on the exchange board!' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Could not save your skill profile.');
    } finally {
      setBusy(false);
    }
  };

  const handleSend = async () => {
    if (!targetUser || !msg) return;
    const targetId = targetUser.user?._id || targetUser.user;
    if (!targetId) {
      setFeedback({ type: 'error', text: 'That student has no linked account to receive requests.' });
      setTargetUser(null);
      return;
    }
    setBusy(true);
    try {
      await sendSkillRequest(
        targetId,
        offered || (targetUser.wantedSkills?.[0] || ''),
        wanted || (targetUser.offeredSkills?.[0] || ''),
        msg
      );
      setTargetUser(null);
      setMsg('');
      setOffered('');
      setWanted('');
      setFeedback({ type: 'success', text: '✓ Skill Exchange request sent successfully!' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Could not send the request.' });
    } finally {
      setBusy(false);
    }
  };

  const handleRespond = async (requestId, status) => {
    setBusy(true);
    try {
      await respondSkillRequest(requestId, status);
      setFeedback({
        type: 'success',
        text: status === 'accepted' ? 'Request accepted — arrange your session!' : 'Request declined.'
      });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Could not respond to the request.' });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setBusy(false);
    }
  };

  const otherProfiles = skills.filter((s) => (s.user?._id || s.user) !== myId);
  const incoming = skillRequests.filter((r) => (r.toUser?._id || r.toUser) === myId);
  const outgoing = skillRequests.filter((r) => (r.fromUser?._id || r.fromUser) === myId);
  const pendingIncoming = incoming.filter((r) => r.status === 'pending');

  const filteredSkills = otherProfiles.filter((s) => {
    const name = s.userName || s.user?.name || '';
    const off = s.offeredSkills || [];
    const des = s.wantedSkills || [];
    const q = search.toLowerCase();
    if (!search) return true;
    return (
      name.toLowerCase().includes(q) ||
      off.some((k) => k.toLowerCase().includes(q)) ||
      des.some((k) => k.toLowerCase().includes(q))
    );
  });

  const renderRequestCard = (req, direction) => {
    const other = direction === 'in' ? req.fromUser : req.toUser;
    const statusColor = req.status === 'accepted' ? 'success' : req.status === 'rejected' ? 'error' : 'warning';
    return (
      <Card key={req.id} sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>{(other?.name || '?')[0]}</Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {direction === 'in' ? `${other?.name || 'Student'} → you` : `You → ${other?.name || 'Student'}`}
              </Typography>
              <Chip label={req.status} size="small" color={statusColor} />
              <Typography variant="caption" color="text.secondary">{timeAgo(req.createdAt || req.sentAt)}</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <b>{req.skillOffered}</b> ⇄ <b>{req.skillWanted}</b>
            </Typography>
            {req.message && (
              <Typography variant="body2" sx={{ bgcolor: '#F9FAFB', p: 1.25, borderRadius: 1.5 }}>
                “{req.message}”
              </Typography>
            )}
          </Box>
          {direction === 'in' && req.status === 'pending' && (
            <Stack direction="row" spacing={1}>
              <IconButton
                color="success"
                size="small"
                title="Accept"
                onClick={() => handleRespond(req.id, 'accepted')}
                disabled={busy}
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                color="error"
                size="small"
                title="Decline"
                onClick={() => handleRespond(req.id, 'rejected')}
                disabled={busy}
              >
                <CloseIcon />
              </IconButton>
            </Stack>
          )}
        </Stack>
      </Card>
    );
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Skill Exchange</Typography>
          <Typography variant="body2" color="text.secondary">
            Trade skills with fellow students — teach what you know, learn what you want
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddCircleIcon />} onClick={openProfileEditor}>
          {myProfile ? 'Edit My Skill Profile' : 'Create My Skill Profile'}
        </Button>
      </Box>

      {feedback && (
        <Alert severity={feedback.type} sx={{ mb: 3 }} onClose={() => setFeedback(null)}>
          {feedback.text}
        </Alert>
      )}

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Browse Students" />
        <Tab
          label={
            <Badge badgeContent={pendingIncoming.length} color="error" sx={{ mr: 1 }}>
              My Requests
            </Badge>
          }
        />
      </Tabs>

      {tab === 0 && (
        <>
          <Card sx={{ p: 2, mb: 4 }}>
            <TextField
              placeholder="Search by skill name (e.g. Python, Figma, Spanish)..."
              size="small"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Card>

          {!myProfile && (
            <Alert severity="info" sx={{ mb: 3 }}>
              You haven’t published your skills yet — students can’t send you requests until you do.
              <Button size="small" sx={{ ml: 1, fontWeight: 700 }} onClick={openProfileEditor}>
                Create it now
              </Button>
            </Alert>
          )}

          {dataLoading && skills.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
          ) : filteredSkills.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No students found</Typography>
              <Typography variant="body2" color="text.secondary">
                {skills.length === 0
                  ? 'No one has published a skill profile yet — you could be the first.'
                  : 'Try a different skill keyword.'}
              </Typography>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {filteredSkills.map((prof) => {
                const name = prof.userName || prof.user?.name || 'Campus Member';
                const uni = prof.university || prof.user?.university || 'State University';
                const offering = prof.offeredSkills || [];
                const seeking = prof.wantedSkills || [];

                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={prof.id}>
                    <Card sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>{name[0]}</Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{name}</Typography>
                            <Typography variant="caption" color="text.secondary" display="block">{uni}</Typography>
                            {prof.major && <Typography variant="caption" color="text.secondary" display="block">{prof.major}</Typography>}
                            <Rating value={prof.rating || 0} precision={0.5} size="small" readOnly />
                          </Box>
                        </Box>

                        {prof.bio && <Typography variant="body2" color="text.secondary" paragraph>{prof.bio}</Typography>}

                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }} display="block" gutterBottom>
                          CAN TEACH:
                        </Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                          {offering.length > 0
                            ? offering.map((sk) => <Chip key={sk} label={sk} size="small" color="primary" sx={{ mb: 0.5 }} />)
                            : <Typography variant="caption" color="text.secondary">—</Typography>}
                        </Stack>

                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }} display="block" gutterBottom>
                          WANTS TO LEARN:
                        </Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                          {seeking.length > 0
                            ? seeking.map((sk) => <Chip key={sk} label={sk} size="small" variant="outlined" sx={{ mb: 0.5 }} />)
                            : <Typography variant="caption" color="text.secondary">—</Typography>}
                        </Stack>
                      </Box>

                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<SendIcon />}
                          onClick={() => { setTargetUser(prof); setMsg(''); }}
                        >
                          Request Exchange
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => setReportTarget(prof)}
                          title="Report this profile"
                          sx={{ minWidth: 44, px: 0 }}
                        >
                          <FlagIcon fontSize="small" />
                        </Button>
                      </Stack>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </>
      )}

      {tab === 1 && (
        <Stack spacing={4}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Incoming Requests</Typography>
            <Stack spacing={2}>
              {incoming.length === 0 ? (
                <Card sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No incoming requests yet. Publish your skills so classmates can reach you.
                  </Typography>
                </Card>
              ) : (
                incoming.map((r) => renderRequestCard(r, 'in'))
              )}
            </Stack>
          </Box>

          <Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Sent by Me</Typography>
            <Stack spacing={2}>
              {outgoing.length === 0 ? (
                <Card sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    You haven’t sent any exchange requests yet.
                  </Typography>
                </Card>
              ) : (
                outgoing.map((r) => renderRequestCard(r, 'out'))
              )}
            </Stack>
          </Box>
        </Stack>
      )}

      {/* ------------------------- Send request dialog ------------------------- */}
      <Dialog open={Boolean(targetUser)} onClose={() => setTargetUser(null)} maxWidth="sm" fullWidth disableRestoreFocus>
        {targetUser && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>
              Send Skill Request to {targetUser.userName || targetUser.user?.name || 'Student'}
            </DialogTitle>
            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Skill You Offer"
                fullWidth
                value={offered}
                onChange={(e) => setOffered(e.target.value)}
                placeholder="e.g. Python"
              />
              <TextField
                label="Skill You Want"
                fullWidth
                value={wanted}
                onChange={(e) => setWanted(e.target.value)}
                placeholder={targetUser.offeredSkills?.[0] || ''}
              />
              <TextField
                label="Message"
                multiline
                rows={3}
                required
                fullWidth
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Introduce yourself and propose a time to connect..."
                inputProps={{ maxLength: 500 }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setTargetUser(null)} disabled={busy}>Cancel</Button>
              <Button
                variant="contained"
                startIcon={busy ? <CircularProgress size={16} /> : <BoltIcon />}
                onClick={handleSend}
                disabled={!msg.trim() || busy}
              >
                Send Request
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ------------------------- My skill profile ------------------------- */}
      <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} maxWidth="sm" fullWidth disableRestoreFocus>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {myProfile ? 'Update My Skill Profile' : 'Create My Skill Profile'}
        </DialogTitle>
        <Box component="form" onSubmit={handleProfileSave}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info" variant="outlined">
              Separating skills with commas lets students search for them — e.g. “React, Node.js, Python”.
            </Alert>
            <TextField
              label="Skills I can teach"
              fullWidth
              required
              value={profileForm.offered}
              onChange={(e) => setProfileForm({ ...profileForm, offered: e.target.value })}
              placeholder="React, Node.js, Python"
            />
            <TextField
              label="Skills I want to learn"
              fullWidth
              required
              value={profileForm.wanted}
              onChange={(e) => setProfileForm({ ...profileForm, wanted: e.target.value })}
              placeholder="UI/UX Design, Figma"
            />
            <TextField
              label="Short bio"
              multiline
              rows={3}
              fullWidth
              value={profileForm.bio}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              inputProps={{ maxLength: 500 }}
              helperText={`${profileForm.bio.length}/500`}
            />
            {profileError && <Alert severity="error">{profileError}</Alert>}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setProfileOpen(false)} disabled={busy}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={busy}>
              {busy ? <CircularProgress size={18} /> : 'Save Profile'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ReportDialog
        open={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        targetType="Skill"
        targetId={reportTarget?.id}
        targetLabel={reportTarget?.userName}
      />
    </Box>
  );
}
