import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Stack, TextField, Switch, FormControlLabel,
  FormGroup, Checkbox, Paper, Divider
} from '@mui/material';
import { Settings, Email } from '@mui/icons-material';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:5000';

export default function ReportScheduler() {
  const [enabled, setEnabled] = useState(false);
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [time, setTime] = useState('09:00');
  const [selectedItems, setSelectedItems] = useState({
    kpis: true,
    charts: true,
    table: true,
  });



  const fetchConfig = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/settings/report-config`);
      console.log("res :", res)
      const data = res.data;
      setEnabled(data.enabled || false);
      setSender(data.sender || '');
      setRecipient(data.recipient || '');
      setTime(data.time || '09:00');
      setSelectedItems(data.include || { kpis: true, charts: true, table: true });
    } catch (err) {
      console.error('Failed to fetch config:', err);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleToggle = (e) => setEnabled(e.target.checked);

  const handleCheckboxChange = (e) => {
    setSelectedItems(prev => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const handleSave = async () => {
    const config = {
      enabled,
      sender,
      recipient,
      time,
      include: selectedItems
    };

    try {
      await axios.post(`${API_BASE}/api/settings/report-config`, config);
      alert("Schedule saved successfully");
    } catch (err) {
      alert("Failed to save schedule");
      console.error(err);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <Settings color="primary" />
        <Typography variant="h6" fontWeight={600}>Email Report Scheduler</Typography>
      </Stack>

      <FormControlLabel
        control={<Switch checked={enabled} onChange={handleToggle} color="primary" />}
        label="Enable Daily Email Reports"
      />

      <Stack spacing={2} mt={2}>
        <TextField
          label="Sender Email"
          placeholder="sender@example.com"
          value={sender}
          onChange={(e) => setSender(e.target.value)}
          fullWidth
          InputProps={{ startAdornment: <Email sx={{ mr: 1 }} /> }}
        />
        <TextField
          label="Recipient Email"
          placeholder="recipient@example.com"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          fullWidth
          InputProps={{ startAdornment: <Email sx={{ mr: 1 }} /> }}
        />
        <TextField
          label="Time to Send (24h format)"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ step: 300 }}
        />
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        What to include in the report:
      </Typography>
      <FormGroup>
        <FormControlLabel
          control={<Checkbox checked={selectedItems.kpis} onChange={handleCheckboxChange} name="kpis" />}
          label="KPIs (Total Batches, Unique Products, etc.)"
        />
        <FormControlLabel
          control={<Checkbox checked={selectedItems.charts} onChange={handleCheckboxChange} name="charts" />}
          label="Charts (Line, Bar, Doughnut)"
        />
        <FormControlLabel
          control={<Checkbox checked={selectedItems.table} onChange={handleCheckboxChange} name="table" />}
          label="Data Table"
        />
      </FormGroup>

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={handleSave}
      >
        Save Schedule
      </Button>
    </Paper>
  );
}