import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
} from '@mui/material';
import { UploadFile, Image, AdminPanelSettings } from '@mui/icons-material';
import { LogoContext } from '../context/LogoContext';
import SMTPSettings from './SMTPSettings';
import ReportScheduler from './ReportScheduler';

// ✅ Correct backend base URL
const API_BASE = 'http://127.0.0.1:5000';

const SettingsPage = () => {
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploadedLogo, setUploadedLogo] = useState('');
  const { logoUrl, setLogoUrl } = useContext(LogoContext);

  // Fetch the current logo on page load
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/logo`, { 
          responseType: 'blob',
          timeout: 5000 // Add timeout
        });
        
        if (res.status === 200 && res.data) {
          const imageUrl = URL.createObjectURL(res.data);
          setUploadedLogo(imageUrl);
          setLogoUrl(imageUrl);
        } else {
          console.error('Received unexpected response:', res);
        }
      } catch (err) {
        console.error('Failed to load logo:', {
          message: err.message,
          config: err.config,
          response: err.response
        });
        // Set default/fallback logo
        setUploadedLogo('/default-logo.png');
      }
    };
  
    loadLogo();
  }, [setLogoUrl]);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setLogo(file);
    setPreview(URL.createObjectURL(file)); // Preview the selected logo
  };

  // Handle logo upload
  const handleUpload = async () => {
    if (!logo) return;

    const formData = new FormData();
    formData.append('logo', logo);

    try {
      const res = await axios.post(`${API_BASE}/api/logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.logoUrl) {
        const fullUrl = `${API_BASE}${res.data.logoUrl}`;
        setUploadedLogo(fullUrl);
        setLogoUrl(fullUrl);
      }
      setLogo(null);
      setPreview('');
    } catch (err) {
      console.error("Upload failed:", err);
    }
};

  return (
    <Box sx={{ width: '100%', px: 4, py: 4 }}>
      <Card sx={{ p: 4, boxShadow: 4 }}>
        <CardContent>
          {/* Admin Panel Header */}
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Avatar>
              <AdminPanelSettings />
            </Avatar>
            <Typography variant="h5" fontWeight={600}>
              Admin Panel - Upload Logo
            </Typography>
          </Stack>

          {/* Upload Logo Section */}
          <Box mb={2}>
            <input
              accept="image/*"
              id="upload-logo"
              type="file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="upload-logo">
              <Button
                variant="contained"
                color="primary"
                component="span"
                startIcon={<Image />}
              >
                Choose File
              </Button>
            </label>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {logo ? logo.name : 'No file chosen'}
            </Typography>
          </Box>

          {/* Preview Section */}
          {preview && (
            <Box mb={2}>
              <Typography variant="subtitle2">Preview:</Typography>
              <Box
                component="img"
                src={preview}
                alt="Preview"
                sx={{ width: 150, height: 'auto', borderRadius: 1, boxShadow: 2 }}
              />
            </Box>
          )}

          {/* Upload Button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<UploadFile />}
            onClick={handleUpload}
            disabled={!logo}
            sx={{
              mb: 3,
              px: 2,
              py: 1,
              fontSize: '0.85rem',
              borderRadius: 1,
              minWidth: 160,
            }}
          >
            Upload Logo
          </Button>

          {/* Display Current Logo */}
          {uploadedLogo && (
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Current Logo:
              </Typography>
              <Box mt={1}>
                <Box
                  component="img"
                  src={uploadedLogo}
                  alt="Current Logo"
                  sx={{ width: 150, height: 'auto', borderRadius: 1, boxShadow: 2 }}
                />
              </Box>
            </Box>
          )}

          {/* Divider Section */}
          <Box sx={{ my: 4 }}>
            <Typography variant="h6" fontWeight={600}>
              Email Configuration
            </Typography>
          </Box>

          {/* SMTP + Scheduler in a row */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 4,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <SMTPSettings />
            </Box>
            <Box sx={{ flex: 1 }}>
              <ReportScheduler />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage;
