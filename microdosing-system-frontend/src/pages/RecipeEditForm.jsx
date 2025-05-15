import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  Typography,
  Paper,
  IconButton,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

const RecipeEditForm = () => {
  const { recipe_id } = useParams();
  const [recipe, setRecipe] = useState({
    name: "",
    code: "",
    description: "",
    version: "",
    status: "draft",
    no_of_materials : ""
  });

const navigate = useNavigate()

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:5000/api/recipes/${recipe_id}`)
      .then((response) => {
        setRecipe(response.data);
      })
      .catch((error) => {
        console.error("Error fetching recipe:", error);
      });
  }, [recipe_id]);

  const handleChange = (e) => {
    setRecipe({ ...recipe, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedRecipe = { ...recipe };

    // If no_of_materials is an empty string, remove it from the updatedRecipe object
    if (updatedRecipe.no_of_materials === "") {
      delete updatedRecipe.no_of_materials;
    }
    axios
      .put(`http://127.0.0.1:5000/api/recipes/${recipe_id}`, recipe)
      .then(() => {
        alert("Recipe updated successfully");
        navigate('/recipes')
      })
      .catch((error) => {
        console.error("Error updating recipe:", error);
      });
  };

  const handleCancel = () => {
    navigate("/recipes"); // Navigate to the recipe list page or wherever you'd like
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 600, margin: "auto", mt: 4, p: 3 }}>
     <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Edit Formula</Typography>
        <IconButton
          onClick={handleCancel}
          sx={{
            border: '1px solid red',
            borderRadius: '50%',
            padding: '6px',
            height: '40px',
            width: '40px',
          }}
        >
          <CloseIcon sx={{ color: 'red' }} />
        </IconButton>
      </Box>
      <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={recipe.name}
          onChange={handleChange}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          label="Code"
          name="code"
          value={recipe.code}
          onChange={handleChange}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Description"
          name="description"
          value={recipe.description}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="No of Materials"
          name="no_of_materials"
          type="number"
          value={recipe.no_of_materials }
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Version"
          name="version"
          value={recipe.version}
          onChange={handleChange}
          required
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={recipe.status}
            onChange={handleChange}
            label="Status"
          >
            <MenuItem value="Released">Released</MenuItem>
            <MenuItem value="Unreleased">Unreleased</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" type="submit" fullWidth sx={{ mt: 2 }}>
          Update Recipe
        </Button>
        <Button
          variant="outlined"
          onClick={handleCancel}
          fullWidth
          sx={{ mt: 2, marginTop : '12px' }}
        >
          Back
        </Button>
      </Box>
    </Paper>
  );
};

export default RecipeEditForm;
