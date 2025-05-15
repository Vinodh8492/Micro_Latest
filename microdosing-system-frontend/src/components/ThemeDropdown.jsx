import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import themeColors from '../utils/themeColors';
import { MenuItem, Select, Typography, Box, FormControl, InputLabel } from '@mui/material';

const ThemeDropdown = () => {
  const { themeColor, setThemeColor } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(document.body.classList.contains("dark-mode"));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.body.classList.contains("dark-mode"));
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"]
    });

    return () => observer.disconnect();
  }, []);

  return (
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <InputLabel
        id="theme-color-label"
        sx={{ color: isDarkMode ? '#e0f7ff' : '#1d4ed8' }}
      >
        Card Background
      </InputLabel>
      <Select
        labelId="theme-color-label"
        value={themeColor}
        onChange={(e) => {
          const selected = e.target.value;
          setThemeColor(selected);
          localStorage.setItem('themeColor', selected);
        }}
        label="Card Background"
        sx={{
          borderRadius: 2,
          color: isDarkMode ? '#ffffff' : '#000000', // ✅ Text color
          '.MuiSelect-icon': {
            color: isDarkMode ? '#e0f7ff' : 'inherit'
          },
        }}
      >
        {themeColors.map((color) => (
          <MenuItem key={color.hex} value={color.hex}>
            <Box
              sx={{
                width: 12,
                height: 12,
                backgroundColor: color.hex,
                borderRadius: '50%',
                display: 'inline-block',
                marginRight: 1
              }}
            />
            {color.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ThemeDropdown;
