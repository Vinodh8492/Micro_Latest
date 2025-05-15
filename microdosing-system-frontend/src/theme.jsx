// src/Theme.jsx
import React from "react";
import { FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import CircleIcon from '@mui/icons-material/Circle';

// 🎨 Color List with names (used internally only, not shown in UI)
export const colorList = [
  { name: "Grey", hex: "#607D8B", text: "#FFFFFF" },
  { name: "Dark Blue", hex: "#003F5C", text: "#FFFFFF" },
  { name: "Green", hex: "#74B030"},
  { name: "Indigo", hex: "#2F4B7C", text: "#FFFFFF" },
  { name: "Electric Blue", hex: "#42A5F5", text: "#FFFFFF" },
  { name: "Slate Blue", hex: "#3F51B5", text: "#FFFFFF" },
  { name: "Orange", hex: "#C5CAE9", text: "#000000" },
  { name: "Steel Blue", hex: "#4682B4", text: "#FFFFFF" },
  { name: "Mint", hex: "#90EE90", text: "#000000" },
];

// 🌈 Generate Light/Dark Shades
export const generateShades = (hexColor, count = 5) => {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return Array.from({ length: count * 2 + 1 }, (_, i) => {
    const position = i - count;
    if (position === 0) return { name: "Base", hex: hexColor, type: "base" };

    const factor = Math.abs(position) / (count + 1);
    const newR = position < 0 ? Math.round(r + (255 - r) * factor) : Math.round(r * (1 - factor));
    const newG = position < 0 ? Math.round(g + (255 - g) * factor) : Math.round(g * (1 - factor));
    const newB = position < 0 ? Math.round(b + (255 - b) * factor) : Math.round(b * (1 - factor));

    return {
      name: position < 0 ? `Tint ${Math.abs(position)}` : `Shade ${position}`,
      hex: `#${newR.toString(16).padStart(2, "0")}${newG
        .toString(16)
        .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`,
      type: position < 0 ? "lighter" : "darker",
    };
  });
};

// 🌐 Theme Selector with colored circles and names
export const ThemeSelector = ({ selectedColor, handleColorChange }) => (
  <FormControl size="small" sx={{ minWidth: 120 }}>
    <InputLabel>Theme</InputLabel>
    <Select
      value={selectedColor.hex}
      label="Theme"
      onChange={handleColorChange}
      renderValue={(value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircleIcon sx={{ color: value }} />
        </Box>
      )}
    >
      {colorList.map((color) => (
        <MenuItem key={color.hex} value={color.hex}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircleIcon sx={{ color: color.hex }} />
            {color.name}
          </Box>
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);