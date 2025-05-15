import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, Stack, Divider, TextField,
  Paper, Chip, Grid, InputAdornment
} from '@mui/material';
import { CheckCircle, AlternateEmail, Send, Add } from '@mui/icons-material';

const API_BASE = 'http://127.0.0.1:5000';

export default function SMTPSettings() {
  const [profiles, setProfiles] = useState([]);
  const [active, setActive] = useState('');
  const [newProfile, setNewProfile] = useState({
    name: '',
    host: '',
    port: '',
    username: '',
    password: '',
    sender: '',
    active: 0
  });
  const [testRecipient, setTestRecipient] = useState('');

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    const res = await axios.get(`${API_BASE}/api/settings/smtp-profiles`);
    setProfiles(res.data || []);  // Set profiles to the array directly
    const activeProfile = res.data.find(profile => profile.active);  // Find the active profile
    setActive(activeProfile ? activeProfile.name : '');  // Set the active profile name or empty string if none
  };
  

  const handleInput = (e) => {
    const { name, value } = e.target;
    setNewProfile(prev => ({ ...prev, [name]: value }));
  };

  const addProfile = async () => {
    if (!newProfile.name) return alert('Name is required');
    await axios.post(`${API_BASE}/api/settings/smtp-profiles`, newProfile);
    await loadProfiles();
    setNewProfile({ name: '', host: '', port: '', username: '', password: '', sender: '' });
  };

  const activateProfile = async (name) => {
    await axios.post(`${API_BASE}/api/settings/smtp-profiles/activate`, { name });
    setActive(name);
  };

  const sendTest = async () => {
    if (!testRecipient) return alert("Enter a recipient email");
    try {
      await axios.post(`${API_BASE}/api/settings/send-test-email`, { recipient: testRecipient });
      alert('Test email sent');
    } catch (err) {
      alert('Failed: ' + err.response?.data?.error || err.message);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>SMTP Profiles</Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
  <Typography variant="h6" gutterBottom>Available Profiles</Typography>
  {profiles.length === 0 ? (
    <Typography color="text.secondary">No profiles added yet.</Typography>
  ) : (
    profiles.map(profile => (
      <Stack direction="row" spacing={2} alignItems="center" key={profile.name} sx={{ mb: 1 }}>
        <Typography>{profile.username}</Typography>
        {active === profile.name ? (
          <Chip icon={<CheckCircle />} label="Active" color="success" size="small" />
        ) : (
          <Button variant="outlined" size="small" onClick={() => activateProfile(profile.name)}>
            Set Active
          </Button>
        )}
      </Stack>
    ))
  )}
</Paper>


      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Add New Profile</Typography>
        <Grid container spacing={2}>
          {['name', 'host', 'port', 'username', 'password', 'sender'].map(field => (
            <Grid gridsize={{ xs: 12, sm: 6 }} key={field}>
              <TextField
                fullWidth
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                name={field}
                type={field === 'password' ? 'password' : 'text'}
                value={newProfile[field]}
                onChange={handleInput}
              />
            </Grid>
          ))}
          <Grid gridsize={{ xs: 12}}>
            <Button
              onClick={addProfile}
              variant="contained"
              startIcon={<Add />}
              fullWidth
            >
              Add Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Send Test Email from Active Profile</Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Recipient Email"
            value={testRecipient}
            onChange={e => setTestRecipient(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start"><AlternateEmail /></InputAdornment>
            }}
          />
          <Button
            onClick={sendTest}
            variant="contained"
            endIcon={<Send />}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #ff8c00, #ff5722)',
              color: 'white',
              borderRadius: 2,
              boxShadow: 3,
              whiteSpace: 'nowrap',       // Prevents wrapping
              textTransform: 'none',      // Keeps normal casing
              fontSize: '1rem',           // Optional: tweak to fit
              '&:hover': {
                background: 'linear-gradient(to right, #ff7043, #f4511e)',
              },
            }}
          >
            Send Test Email
          </Button>


        </Stack>
      </Paper>
    </Box>
  );
}

