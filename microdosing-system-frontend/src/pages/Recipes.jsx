import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  IconButton,
  Avatar,
  Tooltip,
  TableFooter,
  TablePagination,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";


const Recipes = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    version: "",
    status: "Unreleased",
    created_by: 1,
    created_at: "",
    materials: [],
    no_of_materials: "",
  });

  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [barcodeImage, setBarcodeImage] = useState(null);
  const MySwal = withReactContent(Swal);
  const [openDialog, setOpenDialog] = useState(false);

  const fetchRecipes = async (page = 1, pageSize = rowsPerPage) => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/api/recipes", {
        params: {
          page,
          per_page: pageSize,   // ✅ correct param name
        },
      });
  
      const data = response.data || {};
  
      setRecipes(data.recipes || []);
      setTotalRecipes(data.total || 0);
    } catch (error) {
      console.error("Error fetching formulas:", error);
      MySwal.fire({
        title: "Error",
        text: `Failed to fetch formulas. ${error.response?.data?.error || "Server not responding."}`,
        icon: "error",
      });
    }
  };
  

  useEffect(() => {
    fetchRecipes(page + 1);
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.code || !formData.barcode_id || !formData.version ) {
      alert("Please fill in all required fields (Name, Code, Barcode ID, Version).");
      return;
    }

    const no_of_materials = formData.no_of_materials ? parseInt(formData.no_of_materials, 10) : 0;
    if (isNaN(no_of_materials) || no_of_materials < 0) {
      alert("Please enter a valid number for the number of materials.");
      return;
    }

    const recipeData = {
      name: formData.name.trim(),
      code: formData.code.trim(),
      description: formData.description.trim(),
      version: formData.version.trim(),
      status: formData.status || "Unreleased",
      created_by: formData.created_by || 1,
      barcode_id: formData.barcode_id.trim(),
      no_of_materials,
    };

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/recipes",
        recipeData
      );

      MySwal.fire({
        title: `<span style="color: #4caf50;"> Formula Created Successfully!</span>`,
        html: `
          <div style="font-size: 16px; text-align: left;">
            <p><strong> Name:</strong> ${recipeData.name}</p>
            <p><strong>Code:</strong> ${recipeData.code}</p>
            <p><strong> Barcode ID:</strong> ${recipeData.barcode_id}</p>
          </div>
        `,
        background: "#f0fff0",
        icon: "success",
        showClass: {
          popup: "animate__animated animate__zoomIn",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
        confirmButtonColor: "#4caf50",
        confirmButtonText: "Done",
      });

      fetchRecipes(page + 1, rowsPerPage);
      handleCloseDialog();
    } catch (error) {
      alert(
        `Failed to create recipe. ${error.response?.data?.error || "Please check input values."
        }`
      );
    }
  };

  const handleDelete = async (recipe_id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      customClass: {
        popup: "relative",
      },
      didOpen: () => {
        const swal = Swal.getPopup();
  
        // Create the close icon
        const closeBtn = document.createElement("button");
        closeBtn.innerHTML = "&times;";
        closeBtn.style.position = "absolute";
        closeBtn.style.top = "10px";
        closeBtn.style.right = "10px";
        closeBtn.style.background = "#fff";
        closeBtn.style.color = "#f44336";
        closeBtn.style.border = "2px solid #f44336";
        closeBtn.style.borderRadius = "50%";
        closeBtn.style.width = "30px";
        closeBtn.style.height = "30px";
        closeBtn.style.cursor = "pointer";
        closeBtn.style.fontSize = "18px";
        closeBtn.style.lineHeight = "0";
        closeBtn.style.display = "flex";
        closeBtn.style.justifyContent = "center";
        closeBtn.style.alignItems = "center";
  
        // Close on click
        closeBtn.onclick = () => {
          Swal.close();
        };
  
        swal.appendChild(closeBtn);
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://127.0.0.1:5000/api/recipes/${recipe_id}`);
          fetchRecipes(page + 1, rowsPerPage); // Refresh list
          Swal.fire("Deleted!", "The Formula has been deleted.", "success");
        } catch (error) {
          Swal.fire("Error!", "Failed to delete the recipe.", "error");
        }
      }
    });
  };
  

  const generateBarcodeId = () => {
    const newBarcode = `RC-${Date.now()}`;
    setFormData({
      ...formData,
      barcode_id: newBarcode,
    });

    const generatedImage = `https://barcode.tec-it.com/barcode.ashx?data=${newBarcode}&code=Code128&translate-esc=true`;
    setBarcodeImage(generatedImage);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      name: "",
      code: "",
      description: "",
      version: "",
      status: "Unreleased",
      created_by: 1,
      no_of_materials: "",
      barcode_id: "",       // ✅ reset barcode too
      materials: [],
    });
    setBarcodeImage(null);
  };

  const moveRowUp = (index) => {
    if (index <= 0) return;
    const newRecipes = [...recipes];
    [newRecipes[index - 1], newRecipes[index]] = [newRecipes[index], newRecipes[index - 1]];
    setRecipes(newRecipes);
  };

  const moveRowDown = (index) => {
    if (index >= recipes.length - 1) return;
    const newRecipes = [...recipes];
    [newRecipes[index], newRecipes[index + 1]] = [newRecipes[index + 1], newRecipes[index]];
    setRecipes(newRecipes);
  };

  return (
    <Container maxWidth="x2" sx={{ py: 4, height: "auto" }} component={Paper}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Formulas
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenDialog}
          startIcon={<AddCircleOutlineIcon />}
        >
          Add Formula
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table
          sx={{
            border: "1px solid",
            borderColor: "#000",
            borderCollapse: "collapse",
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: "grey.100" }}>
              {[
                "ID",
                "Name",
                "User Name",
                "No Of Materials",
                "Status",
                "Actions",
              ].map((header) => (
                <TableCell
                  key={header}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    fontWeight: 600,
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {recipes.map((recipe, index) => (
              <TableRow key={recipe.recipe_id}>
                <TableCell sx={{ border: "1px solid", borderColor: "divider" }}>
                  {recipe.recipe_id}
                </TableCell>
                <TableCell sx={{ border: "1px solid", borderColor: "divider" }}>
                  <Typography
                    color="primary"
                    sx={{ cursor: "pointer", fontWeight: "medium" }}
                    onClick={() => navigate(`/recipes/view/${recipe.recipe_id}`)}
                  >
                    {recipe.name}
                  </Typography>
                </TableCell>
                <TableCell sx={{ border: "1px solid", borderColor: "divider" }}>
                  {recipe.created_by}
                </TableCell>
                <TableCell sx={{ border: "1px solid", borderColor: "divider" }}>
                  {recipe.no_of_materials}
                </TableCell>
                <TableCell sx={{ border: "1px solid", borderColor: "divider" }}>
                  <Chip
                    label={recipe.status}
                    color={recipe.status === "Active" ? "success" : "error"}
                    size="medium"
                    sx={{
                      backgroundColor: recipe.status === "released" ? "lightgreen" : "lightyellow",
                      color: recipe.status === "released" ? "green" : "black",
                    }}
                  />
                </TableCell>

                <TableCell sx={{ border: "1px solid", borderColor: "divider" }}>
                  {/* <Tooltip title="View" arrow>
                    <IconButton
                      sx={{
                        backgroundColor: "deepskyblue",
                        color: "white",
                        mr: 1,
                      }}
                      size="medium"
                      onClick={() => navigate(`/recipes/view/${recipe.recipe_id}`)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip> */}

                  <Tooltip title="Edit" arrow>
                    <IconButton
                      sx={{
                        backgroundColor: "dodgerblue",
                        color: "white",
                        mr: 1,
                      }}
                      size="medium"
                      onClick={() =>
                        navigate(`/formula-details/edit/${recipe.recipe_id}`)
                      }
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete" arrow>
                    <IconButton
                      sx={{ backgroundColor: "red", color: "white" }}
                      size="medium"
                      onClick={() => handleDelete(recipe.recipe_id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
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
                        disabled={index === recipes.length - 1}
                        size="small"
                        sx={{ color: "gray" }}
                      >
                        <ArrowDownwardIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                colSpan={6}
                count={totalRecipes}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth={false}
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Create New Formula</Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ width: "730px", maxWidth: "100%" }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>

                <Typography variant="subtitle2" gutterBottom>
                  Formula Name *
                </Typography>
                <TextField
                  fullWidth
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>

                <Typography variant="subtitle2" gutterBottom>
                  Formula Code *
                </Typography>
                <TextField
                  fullWidth
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>

                <Typography variant="subtitle2" gutterBottom>
                  Version *
                </Typography>
                <TextField
                  fullWidth
                  name="version"
                  value={formData.version}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>

                <Typography variant="subtitle2" gutterBottom>
                  Status
                </Typography>
                <FormControl sx={{ minWidth: "250px" }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value="Unreleased">Unreleased</MenuItem>
                    <MenuItem value="Released">Released</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

             <Grid sx={{ gridColumn: 'span 12' }}>

                <Typography variant="subtitle2" gutterBottom>
                  Number of Materials
                </Typography>
                <TextField
                  fullWidth
                  name="no_of_materials"
                  type="number"
                  value={formData.no_of_materials}
                  onChange={handleChange}
                  sx={{ minWidth: "350px", height: "50px" }}
                />
              </Grid>

             <Grid sx={{ gridColumn: 'span 12' }}>

                <Typography variant="subtitle2" gutterBottom>
                  Description
                </Typography>
                <TextField
                  fullWidth
                  name="description"
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={handleChange}
                  sx={{ minWidth: "630px" }}
                />
              </Grid>

              <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>

                <Typography variant="h6" gutterBottom>
                  Barcode Information
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Barcode ID *
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    fullWidth
                    value={formData.barcode_id || ""}
                    InputProps={{ readOnly: true }}
                    sx={{ minWidth: "250px" }}
                  />
                  <Button
                    variant="contained"
                    color="success"
                    onClick={generateBarcodeId}
                  >
                    Generate
                  </Button>
                </Box>
              </Grid>

              <Grid sx={{ marginTop: "40px", gridColumn: { xs: 'span 12', md: 'span 6' } }}>

                <Typography variant="subtitle2" gutterBottom>
                  Barcode Preview
                </Typography>
                <Box
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    p: 2,
                    height: 50,
                    width: 250,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  {barcodeImage ? (
                    <Avatar
                      variant="square"
                      src={barcodeImage}
                      sx={{ width: "100%", height: "100%", minWidth: "200px" }}
                    />
                  ) : (
                    <Typography color="text.secondary">
                      No barcode generated
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            variant="contained"
            color="primary"
          >
            Create Formula
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Recipes;