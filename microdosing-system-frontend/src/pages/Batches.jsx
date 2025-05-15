import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
  });
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();

  const statusStyle = {
    Unreleased: { backgroundColor: "#fef08a", color: "#854d0e" },
    Released: { backgroundColor: "#bbf7d0", color: "#166534" },
  };



  const fetchUserRole = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData && userData.role) {
        setUserRole(userData.role);
      }
    } catch (error) {
      alert(`Error fetching user role: ${error}`);
    }
  };

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get("http://127.0.0.1:5000/api/batches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBatches(response.data);
      setFilteredBatches(response.data);
    } catch (error) {
      alert(`Error fetching batches: ${error}`);
      Swal.fire("Error", "Could not load batches.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRole();
    fetchBatches();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    let updatedBatches = [...batches];

    if (newFilters.status) {
      updatedBatches = updatedBatches.filter(
        (batch) => batch.status === newFilters.status
      );
    }

    if (newFilters.startDate) {
      updatedBatches = updatedBatches.filter((batch) =>
        batch.start_time?.startsWith(newFilters.startDate)
      );
    }

    if (newFilters.endDate) {
      updatedBatches = updatedBatches.filter((batch) => {
        if (!batch.start_time) return false;
        const batchDate = batch.start_time.split("T")[0];
        return batchDate <= newFilters.endDate;
      });
    }

    setFilteredBatches(updatedBatches);
  };

  const clearFilters = () => {
    setFilters({ status: "", startDate: "", endDate: "" });
    setFilteredBatches(batches);
  };

  const handleView = (batch) => {
    const batchDetails = `
      <div style="text-align: left;">
        <p><strong>Batch ID:</strong> ${batch.batch_id}</p>
        <p><strong>Batch Number:</strong> ${batch.batch_number}</p>
        <p><strong>Order ID:</strong> ${batch.order_id}</p>
        <p><strong>Status:</strong> ${batch.status}</p>
        <p><strong>Start Time:</strong> ${batch.start_time || "N/A"}</p>
        <p><strong>End Time:</strong> ${batch.end_time || "N/A"}</p>
        <p><strong>Operator ID:</strong> ${batch.operator_id}</p>
        <p><strong>Notes:</strong> ${batch.notes || "No notes"}</p>
        <p><strong>Created At:</strong> ${batch.created_at || "N/A"}</p>
      </div>
    `;

    Swal.fire({
      title: "Batch Details",
      html: batchDetails,
      width: "40%",
      confirmButtonText: "Close",
    });
  };

  const handleEdit = (batch) => {
    Swal.fire({
      title: `Edit Batch ${batch.batch_id}`,
      html: `
        <div style="text-align: left; width: 100%;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Batch Number</label>
            <input id="batch_number" value="${
              batch.batch_number || ""
            }" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Order ID</label>
            <input id="order_id" value="${
              batch.order_id || ""
            }" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Status</label>
            <select id="status" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
              <option value="Unreleased" ${
                batch.status === "Unreleased" ? "selected" : ""
              }>Unreleased</option>
              <option value="Released" ${
                batch.status === "Released" ? "selected" : ""
              }>Released</option>
            </select>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Operator ID</label>
            <input id="operator_id" value="${
              batch.operator_id || ""
            }" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Notes</label>
            <textarea id="notes" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; min-height: 100px;">${
              batch.notes || ""
            }</textarea>
          </div>
        </div>
      `,
      width: "600px",
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        return {
          batch_number: document.getElementById("batch_number").value,
          order_id: document.getElementById("order_id").value,
          status: document.getElementById("status").value,
          operator_id: document.getElementById("operator_id").value,
          notes: document.getElementById("notes").value,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        const updatedBatchData = result.value;
        axios
          .put(
            `http://127.0.0.1:5000/api/batches/${batch.batch_id}`,
            updatedBatchData,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
          .then((response) => {
            Swal.fire("Updated!", response.data.message, "success");
            setBatches(
              batches.map((b) =>
                b.batch_id === batch.batch_id
                  ? { ...b, ...updatedBatchData }
                  : b
              )
            );
            setFilteredBatches(
              filteredBatches.map((b) =>
                b.batch_id === batch.batch_id
                  ? { ...b, ...updatedBatchData }
                  : b
              )
            );
          })
          .catch((error) => {
            alert(`Error updating batch: ${error}`);
            Swal.fire(
              "Error!",
              "There was an issue updating the batch.",
              "error"
            );
          });
      }
    });
  };

  const handleDelete = async (batchId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete batch ${batchId}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://127.0.0.1:5000/api/batches/${batchId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Deleted!", "Batch has been deleted.", "success");
        fetchBatches();
      } catch (error) {
        alert(`Error deleting batch: ${error}`);
        Swal.fire("Error!", "Failed to delete batch", "error");
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          Batches
        </Typography>
        {userRole === "admin" && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/create-batch")}
          >
            Create New Batch
          </Button>
        )}
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid
            container
            spacing={2}
            alignItems="flex-end"
            wrap="wrap"
            sx={{ flexDirection: { xs: "column", sm: "row" } }}
          >
            <Grid gridsize={{ xs: 12, sm: 'auto' }}>

              <FormControl sx={{ minWidth: 200 }} fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={filters.status}
                  label="Status"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="Unreleased">Unreleased</MenuItem>
                  <MenuItem value="Released">Released</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid gridsize={{ xs: 12, sm: 'auto' }}>

              <TextField
                type="date"
                name="startDate"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                value={filters.startDate}
                onChange={handleFilterChange}
                fullWidth
                sx={{ minWidth: 200 }}
              />
            </Grid>
            <Grid gridsize={{ xs: 12, sm: 'auto' }}>

              <TextField
                type="date"
                name="endDate"
                label="End Date"
                InputLabelProps={{ shrink: true }}
                value={filters.endDate}
                onChange={handleFilterChange}
                fullWidth
                sx={{ minWidth: 200 }}
              />
            </Grid>
            <Grid gridsize={{ xs: 12, sm: 'auto' }}>

              <Button
                variant="contained"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                fullWidth
                sx={{ minWidth: 150, marginBottom: "10px" }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      ) : filteredBatches.length === 0 ? (
        <Typography variant="h6" textAlign="center" py={10}>
          No batches found
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow sx={{ "& > th": { border: "1px solid #ccc" } }}>
                <TableCell>Batch ID</TableCell>
                <TableCell>Batch Number</TableCell>
                <TableCell>Order ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBatches.map((batch) => (
                <TableRow
                  key={batch.batch_id}
                  sx={{ "& > td": { border: "1px solid #ccc" } }}
                >
                  <TableCell>{batch.batch_id}</TableCell>
                  <TableCell>{batch.batch_number}</TableCell>
                  <TableCell>{batch.order_id}</TableCell>
                  <TableCell>
                    <Chip
                      label={batch.status}
                      style={statusStyle[batch.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{batch.created_at || "N/A"}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View">
                        <IconButton
                          color="primary"
                          onClick={() => handleView(batch)}
                          sx={{
                            backgroundColor: "deepskyblue",
                            color: "#fff",
                            "&:hover": { backgroundColor: "deepskyblue" },
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {userRole === "admin" && (
                        <>
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() => handleEdit(batch)}
                              sx={{
                                backgroundColor: "#1976d2",
                                color: "#fff",
                                "&:hover": { backgroundColor: "#1565c0" },
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              onClick={() => handleDelete(batch.batch_id)}
                              sx={{
                                backgroundColor: "#d32f2f",
                                color: "#fff",
                                "&:hover": { backgroundColor: "#b71c1c" },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default Batches;
