import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import JsBarcode from "jsbarcode";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Paper,
  FormHelperText,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const MaterialForm = () => {
  const navigate = useNavigate();
  const [material, setMaterial] = useState({
    title: "",
    description: "",
    unit_of_measure: "",
    current_quantity: 0,
    minimum_quantity: 0,
    maximum_quantity: 100, // Always set maximum quantity to 100
    plant_area_location: "",
    barcode_id: "",
    status: "Unreleased",
  });

  const [errors, setErrors] = useState({});
  const [barcodeImage, setBarcodeImage] = useState("");

  const generateBarcodeId = () => {
    if (!material.title) {
      setErrors({
        ...errors,
        title: "Material name is required to generate barcode",
      });
      return;
    }

    const randomNum = Math.floor(Math.random() * 9000000000000) + 1000000000000;
    const barcodeId = randomNum.toString();

    const canvas = document.createElement("canvas");
    try {
      JsBarcode(canvas, barcodeId, {
        format: "CODE128",
        width: 2,
        height: 50,
        displayValue: true,
        fontSize: 12,
        background: "#2D3748",
        lineColor: "#FFFFFF",
        margin: 10,
        font: "monospace",
      });
      const barcodeUrl = canvas.toDataURL();
      setBarcodeImage(barcodeUrl);
      setMaterial({ ...material, barcode_id: barcodeId });
    } catch (error) {
      setErrors({
        ...errors,
        barcode_id: "Error generating barcode. Please try again.",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "current_quantity" && value > material.maximum_quantity) {
      // Prevent setting current_quantity higher than maximum_quantity (100)
      setErrors({
        ...errors,
        current_quantity: "Current quantity cannot exceed maximum quantity",
      });
      return;
    } else {
      setErrors({
        ...errors,
        current_quantity: "", // Reset the error if value is valid
      });
    }

    setMaterial({ ...material, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:5000/api/materials", material);
     

      Swal.fire({
        icon: "success",
        title: "Material Created",
        text: "The material has been added successfully!",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/material");
      });
    } catch (error) {
      alert(`Error adding material: ${error}`);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Add New Material
          </Typography>
          <IconButton
            onClick={() => navigate("/material")}
            sx={{
              border: "1px solid red",
              borderRadius: "50%",
              padding: "6px",
              height: "40px",
              width: "40px",
            }}
          >
            <CloseIcon sx={{ color: "red" }} />
          </IconButton>
        </Box>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
          <Grid container spacing={2}>
            <Grid gridsize={{ xs: 12, md: 6 }}>

              <TextField
                required
                fullWidth
                label="Material Name"
                name="title"
                value={material.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
              />
            </Grid>
            <Grid gridsize={{ xs: 12, md: 6 }}>

              <TextField
                fullWidth
                multiline
                required
                rows={3}
                label="Description"
                name="description"
                value={material.description}
                onChange={handleChange}
              />
            </Grid>
            <Grid gridsize={{ xs: 12, md: 6 }}>

              <FormControl fullWidth required sx={{ minWidth: "200px" }}>
                <InputLabel>Unit of Measure</InputLabel>
                <Select
                  name="unit_of_measure"
                  value={material.unit_of_measure}
                  onChange={handleChange}
                >
                  <MenuItem value="Kilogram (kg)">Kilogram (kg)</MenuItem>
                  <MenuItem value="Gram (g)">Gram (g)</MenuItem>
                  <MenuItem value="Milligram (mg)">Milligram (mg)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid gridsize={{ xs: 12, md: 6 }}>

              <TextField
                fullWidth
                required
                label="Location"
                name="plant_area_location"
                value={material.plant_area_location}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          {/* Quantity Information */}
          <Typography variant="h6" mt={4} gutterBottom>
            Quantity Information
          </Typography>
          <Grid container spacing={2}>
          <Grid gridsize={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                required
                type="number"
                label="Current Quantity"
                name="current_quantity"
                value={material.current_quantity}
                onChange={handleChange}
                error={!!errors.current_quantity}
                helperText={errors.current_quantity}
              />
            </Grid>
            <Grid gridsize={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                required
                type="number"
                label="Minimum Quantity"
                name="minimum_quantity"
                value={material.minimum_quantity}
                onChange={handleChange}
              />
            </Grid>
            <Grid gridsize={{ xs: 12, md: 4 }}>
  <TextField
    fullWidth
    required
    type="number"
    label="Maximum Quantity"
    name="maximum_quantity"
    value={100}  // Always set value to 100
    onChange={handleChange}  // This can still be used if you want to handle other logic
  />
</Grid>
          </Grid>

           {/* Status */}
           <Typography variant="h6" mt={4} gutterBottom>
            Status
          </Typography>
          <Grid container spacing={2}>
            <Grid gridsize={{ xs: 12, md: 6 }}>

              <FormControl sx={{ minWidth: "200px" }}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={material.status}
                  onChange={handleChange}
                >
                  <MenuItem value="Released">Released</MenuItem>
                  <MenuItem value="Unreleased">Un-released</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>


          {/* Barcode */}
          <Typography variant="h6" mt={4} gutterBottom>
            Barcode Information
          </Typography>
          <Grid container spacing={2}>
            <Grid gridsize={{ xs: 12, md: 6 }}>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {barcodeImage ? (
                  <Box
                    component="img"
                    src={barcodeImage}
                    alt="Barcode"
                    sx={{ height: 60 }}
                  />
                ) : (
                  <Typography>No barcode generated</Typography>
                )}
                <Button variant="contained" onClick={generateBarcodeId}>
                  Generate Barcode
                </Button>
              </Box>
              {errors.barcode_id && (
                <FormHelperText error>{errors.barcode_id}</FormHelperText>
              )}
            </Grid>
          </Grid>

         
          {/* Actions */}
          <Box
            sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "flex-end" }}
          >
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/material")}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Create Material
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default MaterialForm;
