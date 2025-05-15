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
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const FormulaEditForm = () => {
  const { recipe_id } = useParams();
  const [recipe, setRecipe] = useState({
    name: "",
    code: "",
    description: "",
    version: "",
    no_of_materials: "",
    materials: [],
  });

  const [storageOptions, setStorageOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [materialNames, setMaterialNames] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaterialNames = async () => {
      const materialNamesObj = {};

      for (let material of recipe.materials) {
        if (material.material_id) {
          try {
            const response = await axios.get(
              `http://127.0.0.1:5000/api/materials/${material.material_id}`
            );
            materialNamesObj[material.material_id] = response.data.title;
          } catch (error) {
            console.error("Error fetching material name:", error);
          }
        }
      }

      setMaterialNames(materialNamesObj);
    };

    if (recipe.materials.length > 0) {
      fetchMaterialNames();
    }
  }, [recipe.materials]);

  useEffect(() => {
    const fetchStorageOptions = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:5000/api/materials?page=1&per_page=1000"
        );
        setStorageOptions(response.data.materials || []);
      } catch (error) {
        console.error("Error fetching material names:", error);
      }
    };
    fetchStorageOptions();
  }, []);

  useEffect(() => {
    const fetchRecipeAndMaterials = async () => {
      try {
        const recipeResponse = await axios.get(
          `http://127.0.0.1:5000/api/recipes/${recipe_id}`
        );
        const fetchedRecipe = recipeResponse.data;
        const noOfMaterials = fetchedRecipe.no_of_materials
          ? Number(fetchedRecipe.no_of_materials)
          : 0;

        setRecipe((prev) => ({
          ...prev,
          ...fetchedRecipe,
          no_of_materials: noOfMaterials,
        }));

        try {
          const materialsResponse = await axios.get(
            `http://127.0.0.1:5000/api/recipe_materials/${recipe_id}`
          );

          if (materialsResponse.data.materials.length > 0) {
            setRecipe((prev) => ({
              ...prev,
              materials: materialsResponse.data.materials,
            }));
          } else if (noOfMaterials > 0) {
            const emptyMaterials = Array.from(
              { length: noOfMaterials },
              (_, index) => ({
                recipe_material_id: `new-${index}`,
                material_id: "",
                bucket_id: null,
                storage: "",
                set_point: 0,
              })
            );
            setRecipe((prev) => ({ ...prev, materials: emptyMaterials }));
          }
        } catch (materialsError) {
          if (materialsError.response?.status === 404) {
            console.warn(`No materials found for Recipe ID ${recipe_id}`);
            const emptyMaterials = Array.from(
              { length: noOfMaterials },
              (_, index) => ({
                recipe_material_id: `new-${index}`,
                material_id: "",
                bucket_id: null,
                storage: "",
                set_point: 0,
              })
            );
            setRecipe((prev) => ({ ...prev, materials: emptyMaterials }));
          } else {
            console.error("Error fetching recipe materials:", materialsError);
          }
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeAndMaterials();
  }, [recipe_id]);

  const handleChange = (e) => {
    setRecipe({ ...recipe, [e.target.name]: e.target.value });
  };

  const moveRowUp = (index) => {
    if (index <= 0) return;
    const newMaterials = [...recipe.materials];
    [newMaterials[index - 1], newMaterials[index]] = [
      newMaterials[index],
      newMaterials[index - 1],
    ];
    setRecipe({ ...recipe, materials: newMaterials });
  };

  const moveRowDown = (index) => {
    if (index >= recipe.materials.length - 1) return;
    const newMaterials = [...recipe.materials];
    [newMaterials[index], newMaterials[index + 1]] = [
      newMaterials[index + 1],
      newMaterials[index],
    ];
    setRecipe({ ...recipe, materials: newMaterials });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const submissionPromises = recipe.materials.map((material) => {
        const { recipe_material_id, material_id, set_point, bucket_id,margin } =
          material;

        const payload = {
          recipe_id: parseInt(recipe_id, 10),
          material_id: parseInt(material_id, 10),
          set_point: parseFloat(set_point),
          actual: 0,
          margin: parseFloat(margin),
          status: "pending",
          use_scale: false,
          bucket_id: parseInt(bucket_id, 10),
        };
        const isNew = !recipe_material_id || isNaN(Number(recipe_material_id));

        if (isNew) {
          return axios.post(
            `http://127.0.0.1:5000/api/recipe_materials`,
            payload
          );
        }

        return axios.put(
          `http://127.0.0.1:5000/api/recipe_materials/${recipe_material_id}`,
          payload
        );
      });

      await Promise.all(submissionPromises);
      alert("Recipe materials saved successfully!");
      navigate(-1);
    } catch (error) {
      console.error(
        "Error saving materials:",
        error?.response?.data || error.message
      );
      alert("Failed to save some or all materials.");
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ maxWidth: 900, margin: "auto", mt: 4, p: 3 }}>
      <Box mt={4} p={3} sx={{ backgroundColor: "#f9f9f9", borderRadius: 2 }}>
        <Typography variant="h6" align="center" gutterBottom>
          Assign Materials to -{" "}
          <Box component="span" sx={{ fontWeight: "bold" }}>
            {recipe.name || "Recipe Details"}
          </Box>
        </Typography>
      </Box>

      {recipe.materials.length > 0 ? (
        <Table sx={{ mt: 2, border: "1px solid #ccc", borderRadius: 1 }}>
          <TableHead sx={{ backgroundColor: "#d6dce5" }}>
            <TableRow>
              <TableCell>
                <strong>Reorder</strong>
              </TableCell>
              <TableCell>
                <strong>Material</strong>
              </TableCell>
              <TableCell>
                <strong>Set Point</strong>
              </TableCell>
              <TableCell>
                <strong>Margin</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {recipe.materials
              .slice(
                0,
                Math.min(recipe.no_of_materials, recipe.materials.length)
              )
              .map((material, index) => (
                <TableRow key={material.recipe_material_id} hover>
                  <TableCell>
                    <Tooltip title="Move Up" arrow>
                      <span>
                        <IconButton
                          onClick={() => moveRowUp(index)}
                          disabled={index === 0}
                          size="small"
                          sx={{ color: "gray" }}
                        >
                          <ArrowUpwardIcon />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title="Move Down" arrow>
                      <span>
                        <IconButton
                          onClick={() => moveRowDown(index)}
                          disabled={index === recipe.materials.length - 1}
                          size="small"
                          sx={{ color: "gray" }}
                        >
                          <ArrowDownwardIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>

                  <TableCell>
                    <Select
                      fullWidth
                      value={material.material_id || ""}
                      onChange={(e) => {
                        const updatedMaterials = recipe.materials.map((mat) =>
                          mat.recipe_material_id === material.recipe_material_id
                            ? { ...mat, material_id: e.target.value }
                            : mat
                        );
                        setRecipe({ ...recipe, materials: updatedMaterials });
                      }}
                      size="small"
                    >
                      <MenuItem value="" disabled>
                        Select Material
                      </MenuItem>
                      {storageOptions.map((matOpt) => (
                        <MenuItem
                          key={matOpt.material_id}
                          value={matOpt.material_id}
                        >
                          {matOpt.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>

                  <TableCell>
                    <TextField
                      fullWidth
                      type="number"
                      variant="outlined"
                      size="small"
                      value={material.set_point}
                      onChange={(e) => {
                        const updatedMaterials = recipe.materials.map((mat) =>
                          mat.recipe_material_id === material.recipe_material_id
                            ? { ...mat, set_point: e.target.value }
                            : mat
                        );
                        setRecipe({ ...recipe, materials: updatedMaterials });
                      }}
                    />
                  </TableCell>
                  <TableCell>
                  <TextField
  label="Margin"
  variant="outlined"
  type="number"
  value={material.margin}
  onChange={(e) => {
    const updatedMaterials = recipe.materials.map((mat) =>
      mat.recipe_material_id === material.recipe_material_id
        ? { ...mat, margin: e.target.value }
        : mat
    );
    setRecipe({ ...recipe, materials: updatedMaterials });
  }}
  size="small"
  sx={{ width: 120 }}
/>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      ) : (
        <Typography>No materials available for this recipe.</Typography>
      )}

      <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          SAVE
        </Button>
        <Button variant="outlined" color="error" onClick={() => navigate(-1)}>
          CANCEL
        </Button>
      </Box>
    </Paper>
  );
};

export default FormulaEditForm;
