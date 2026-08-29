import React, { useState } from 'react';
import {
  Box, Grid, Card, Typography, Button, TextField,
  Chip, Stack, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Rating
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import SendIcon from '@mui/icons-material/Send';
import { useApp } from '../context/AppContext';

export default function Skills() {
  const { skills, sendSkillRequest, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [targetUser, setTargetUser] = useState(null);
  const [msg, setMsg] = useState('');
  const [offered, setOffered] = useState('');
  const [wanted, setWanted] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSend = () => {
    if (!targetUser || !msg) return;
    const targetName = targetUser.userName || targetUser.user?.name || 'Student';
    sendSkillRequest(targetName, offered || 'Python', wanted || (targetUser.offeredSkills?.[0] || targetUser.offering?.[0] || 'Skill'), msg);
    setTargetUser(null);
    setMsg('');
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3000);
  };

  const filteredSkills = skills.filter((s) => {
    const name = s.userName || s.user?.name || '';
    const off = s.offeredSkills || s.offering || [];
    const des = s.wantedSkills || s.seeking || [];
    const searchLow = search.toLowerCase();
    if (currentUser && (s.user?.id === currentUser.id || s.userName === currentUser.name)) return false;
    if (search && !name.toLowerCase().includes(searchLow) && !off.some(k => k.toLowerCase().includes(searchLow)) && !des.some(k => k.toLowerCase().includes(searchLow))) {
      return false;
    }
    return true;
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Skill Exchange</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Trade skills with fellow students — teach what you know, learn what you want
      </Typography>

      {sentSuccess && (
        <Card sx={{ p: 2, mb: 3, bgcolor: '#ECFDF5', borderColor: '#A7F3D0' }}>
          <Typography color="success.dark" sx={{ fontWeight: 600 }}>✓ Skill Exchange request sent successfully!</Typography>
        </Card>
      )}

      <Card sx={{ p: 2, mb: 4 }}>
        <TextField
          placeholder="Search by skill name (e.g. Python, Figma, Spanish)..."
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      <Grid container spacing={3}>
        {filteredSkills.map((prof) => {
          const name = prof.userName || prof.user?.name || 'Campus Member';
          const uni = prof.university || prof.user?.university || 'State University';
          const offering = prof.offeredSkills || prof.offering || ['General Skills'];
          const seeking = prof.wantedSkills || prof.seeking || ['Learning'];

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={prof.id || prof._id}>
              <Card sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>{name[0]}</Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{name}</Typography>
                      <Typography variant="caption" color="text.secondary">{uni}</Typography>
                      <Rating value={prof.rating || 4.8} precision={0.5} size="small" readOnly display="block" />
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>{prof.bio}</Typography>

                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }} display="block" gutterBottom>
                    CAN TEACH:
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                    {offering.map((sk) => (
                      <Chip key={sk} label={sk} size="small" color="primary" sx={{ mb: 0.5 }} />
                    ))}
                  </Stack>

                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }} display="block" gutterBottom>
                    WANTS TO LEARN:
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                    {seeking.map((sk) => (
                      <Chip key={sk} label={sk} size="small" variant="outlined" sx={{ mb: 0.5 }} />
                    ))}
                  </Stack>
                </Box>

                <Button variant="contained" fullWidth startIcon={<SendIcon />} onClick={() => setTargetUser(prof)}>
                  Request Exchange
                </Button>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Skill Request Dialog */}
      <Dialog open={Boolean(targetUser)} onClose={() => setTargetUser(null)} maxWidth="sm" fullWidth disableRestoreFocus>
        {targetUser && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>Send Skill Request to {targetUser.userName || targetUser.user?.name || 'Student'}</DialogTitle>
            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Skill You Offer" fullWidth value={offered} onChange={(e) => setOffered(e.target.value)} placeholder="e.g. Python" />
              <TextField label="Skill You Want" fullWidth value={wanted} onChange={(e) => setWanted(e.target.value)} placeholder={(targetUser.offeredSkills?.[0] || targetUser.offering?.[0] || '')} />
              <TextField label="Message" multiline rows={3} required fullWidth value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Introduce yourself and propose a time to connect..." />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setTargetUser(null)}>Cancel</Button>
              <Button variant="contained" startIcon={<BoltIcon />} onClick={handleSend} disabled={!msg}>Send Request</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}