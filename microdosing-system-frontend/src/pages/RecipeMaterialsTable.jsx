import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip
} from '@mui/material';

const RecipeMaterialsTable = () => {
  const [recipeMaterials, setRecipeMaterials] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/recipes");
        console.log("Fetched Recipes:", response.data);
        // Adjust if API returns an object
        setRecipes(Array.isArray(response.data) ? response.data : response.data.recipes || []);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    const fetchMaterials = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/materials");
        console.log("Fetched Materials:", response.data);
        // Adjust if API returns an object
        setMaterials(Array.isArray(response.data) ? response.data : response.data.materials || []);
      } catch (error) {
        console.error("Error fetching materials:", error);
      }
    };

    const fetchRecipeMaterials = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/recipe_materials");
        console.log("Fetched Recipe Materials:", response.data);
        setRecipeMaterials(Array.isArray(response.data) ? response.data : response.data.recipe_materials || []);
      } catch (error) {
        console.error("Error fetching recipe materials:", error);
      }
    };

    fetchRecipes();
    fetchMaterials();
    fetchRecipeMaterials();
  }, []);

  const getRecipeName = (recipe_id) => {
    const recipe = recipes.find((rec) => rec.recipe_id === recipe_id);
    return recipe ? recipe.name : 'Unknown Recipe';
  };

  const getMaterialName = (material_id) => {
    const material = materials.find((mat) => mat.material_id === material_id);
    return material ? material.title : 'Unknown Material';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }} component={Paper}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Formula Details
        </Typography>
      </Box>

      <Table sx={{ border: "1px solid", borderColor: "#000", borderCollapse: "collapse" }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "grey.100" }}>
            {["Recipe Name", "Material Name", "Set Point", "Actual", "Status"].map((header) => (
              <TableCell
                key={header}
                sx={{ border: "1px solid", borderColor: "divider", fontWeight: 600 }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {recipeMaterials.length > 0 ? (
            recipeMaterials.map((material) => (
              <TableRow key={material.recipe_material_id}>
                <TableCell sx={{ border: "1px solid", borderColor: "divider" }}>
                  {getRecipeName(material.recipe_id)}
                </TableCell>
                <TableCell sx={{ border: "1px solid", borderColor: "divider" }}>
                  {getMaterialName(material.material_id)}
                </TableCell>
                <TableCell sx={{ border: "1px solid", borderColor: "divider" }}>
                  {material.set_point}
                </TableCell>
                <TableCell sx={{ border: "1px solid", borderColor: "divider" }}>
                  {material.actual}
                </TableCell>
                <TableCell sx={{ border: "1px solid", borderColor: "divider" }}>
                  <Chip
                    label={material.status}
                    color={material.status === "Active" ? "success" : "error"}
                    size="medium"
                    sx={{
                      backgroundColor: material.status === "Active" ? "lightgreen" : "lightyellow",
                      color: material.status === "Active" ? "green" : "black"
                    }}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ border: "1px solid", borderColor: "divider" }}>
                No data available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Container>
  );
};

export default RecipeMaterialsTable;
