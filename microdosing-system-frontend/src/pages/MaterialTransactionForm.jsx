import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const MaterialTransactionForm = () => {
  const [materials, setMaterials] = useState([]);
  const [transaction, setTransaction] = useState({
    material_id: "",
    transaction_type: "addition",
    quantity: "",
    description: "",
  });

  const navigate = useNavigate();

  // Fetch materials for dropdown
  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/api/materials?page=1&per_page=1000")
      .then((response) => {
        console.log("API Response:", response.data);

        let materialsArray = [];

        // Try multiple keys in case your API returns a different structure
        if (Array.isArray(response.data.data)) {
          materialsArray = response.data.data;
        } else if (Array.isArray(response.data.materials)) {
          materialsArray = response.data.materials;
        } else if (Array.isArray(response.data.results)) {
          materialsArray = response.data.results;
        } else if (Array.isArray(response.data)) {
          materialsArray = response.data;
        }

        console.log("Parsed Materials:", materialsArray);
        setMaterials(materialsArray);
      })
      .catch((error) => {
        console.error("Error fetching materials:", error);
        setMaterials([]);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransaction((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateQuantity = async (type) => {
    const { material_id, quantity } = transaction;
    const amount = parseFloat(quantity);
    if (!amount || isNaN(amount)) return alert("Invalid quantity.");

    const updated = [...materials];
    const material = updated.find((m) => m.material_id === material_id);
    if (!material) return;

    const current = parseFloat(material.current_quantity);
    const min = parseFloat(material.minimum_quantity);
    const max = parseFloat(material.maximum_quantity);

    let newQty = current;

    if (type === "addition") {
      newQty = current + amount;
      if (newQty > max) return alert("Cannot exceed maximum quantity.");
    } else if (type === "removal") {
      newQty = current - amount;
      if (newQty < min) return alert("Cannot go below minimum quantity.");
    }

    try {
      await axios.put(`http://127.0.0.1:5000/api/materials/${material_id}`, {
        current_quantity: newQty.toFixed(2),
      });
      alert("Quantity updated successfully!");
    } catch (err) {
      console.error("Failed to update quantity:", err);
      alert("Failed to update quantity.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { material_id, transaction_type } = transaction;

    if (!material_id || isNaN(parseFloat(transaction.quantity))) {
      return alert("Please select a material and enter a valid quantity.");
    }

    try {
      await handleUpdateQuantity(transaction_type);
      await axios.post("http://127.0.0.1:5000/api/material-transactions", transaction);
      navigate("/material");
    } catch (err) {
      console.error("Transaction error:", err);
      alert("Failed to complete transaction.");
    }
  };

  const handleCancel = () => {
    setTransaction({
      material_id: "",
      transaction_type: "addition",
      quantity: "",
      description: "",
    });
  };

  return (
    <Box className="flex justify-center items-center min-h-screen bg-gray-50">
      <Paper elevation={3} className="p-6 w-full max-w-lg">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" gutterBottom>
            Add Material Transaction
          </Typography>
          <IconButton onClick={() => navigate("/material")}>
            <CloseIcon color="error" />
          </IconButton>
        </Box>

        <form onSubmit={handleSubmit}>
          {/* Material Dropdown */}
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="material-label">Material</InputLabel>
            <Select
              labelId="material-label"
              name="material_id"
              value={transaction.material_id}
              onChange={handleChange}
            >
              <MenuItem value="">
                <em>Select a material</em>
              </MenuItem>
              {materials.length > 0 ? (
                materials.map((mat) => (
                  <MenuItem key={mat.material_id} value={mat.material_id}>
                    {mat.title}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value="">
                  No materials found
                </MenuItem>
              )}
            </Select>
          </FormControl>

          {/* Transaction Type Dropdown */}
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="transaction-type-label">Transaction Type</InputLabel>
            <Select
              labelId="transaction-type-label"
              name="transaction_type"
              value={transaction.transaction_type}
              onChange={handleChange}
            >
              <MenuItem value="addition">Addition</MenuItem>
              <MenuItem value="removal">Removal</MenuItem>
            </Select>
          </FormControl>

          {/* Quantity Field */}
          <TextField
            label="Quantity"
            name="quantity"
            type="number"
            value={transaction.quantity}
            onChange={handleChange}
            inputProps={{ step: "0.01", min: "0" }}
            fullWidth
            margin="normal"
            required
          />

          {/* Description Field */}
          <TextField
            label="Description"
            name="description"
            value={transaction.description}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
            margin="normal"
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate("/material")}>
              Back
            </Button>
            <Button variant="outlined" color="error" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Add Transaction
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default MaterialTransactionForm;
