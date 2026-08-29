import React, { useState } from 'react';
import { Box, Card, Typography, Button, Avatar, Stack, TextField, Divider, Grid } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useApp } from '../context/AppContext';

export default function Profile() {
  const { currentUser } = useApp();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(currentUser?.bio || 'Computer Science Student passionate about software and UI design.');

  const name = currentUser?.name || 'Student User';
  const email = currentUser?.email || 'student@university.edu';
  const university = currentUser?.university || 'State University';
  const role = currentUser?.role || 'student';

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Card sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
          <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}>
              {name[0]}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{name}</Typography>
              <Typography variant="body2" color="text.secondary">{email}</Typography>
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>{university}</Typography>
            </Box>
          </Stack>
          <Button
            variant={editing ? 'contained' : 'outlined'}
            startIcon={editing ? <SaveIcon /> : <EditIcon />}
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Save' : 'Edit Profile'}
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {editing ? (
          <TextField
            label="Bio"
            multiline
            rows={3}
            fullWidth
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        ) : (
          <Typography variant="body1" color="text.secondary">{bio}</Typography>
        )}
      </Card>

      <Grid container spacing={2}>
        {[
          { label: 'Role', val: role },
          { label: 'Status', val: 'Active Member' },
          { label: 'University', val: university },
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