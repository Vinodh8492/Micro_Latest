import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import JsBarcode from "jsbarcode";
import Swal from "sweetalert2";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { TablePagination } from "@mui/material";

// Material UI
import {
  Box,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const MaterialDetails = () => {
  const barcodeRefs = useRef({});
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 
  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false);
  const [selectedBarcodeId, setSelectedBarcodeId] = useState(null);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const updatedMaterials = Array.from(materials);
    const [movedItem] = updatedMaterials.splice(result.source.index, 1);
    updatedMaterials.splice(result.destination.index, 0, movedItem);

    setMaterials(updatedMaterials); // make sure materials is state
  };

 
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20); // You can adjust per page
  const [total, setTotal] = useState(0);
  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true); // Set loading to true before the fetch
  
      try {
        const response = await axios.get(
          `http://127.0.0.1:5000/api/materials?page=${page}&limit=${limit}`
        );
        const { materials: fetchedMaterials, total: totalCount } = response.data;
  
        const savedOrder = JSON.parse(localStorage.getItem("materialOrder"));
        if (savedOrder) {
          fetchedMaterials.sort(
            (a, b) => savedOrder.indexOf(a.material_id) - savedOrder.indexOf(b.material_id)
          );
        }
  
        setMaterials(fetchedMaterials);
        setTotal(totalCount);
      } catch (error) {
        alert(`error fecthing materials : ${error}`)
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };
  
    fetchMaterials();
  }, [page, limit]);
  
  

  // Save order to localStorage
  const saveOrderToLocalStorage = (materialsList) => {
    const materialIds = materialsList.map((mat) => mat.material_id);
    localStorage.setItem("materialOrder", JSON.stringify(materialIds));
  };

  useEffect(() => {
    if (materials.length > 0) {
      materials.forEach((material) => {
        const barcodeElement = barcodeRefs.current[material.barcode_id];
        if (material?.barcode_id && barcodeElement) {
          JsBarcode(barcodeElement, material.barcode_id, {
            format: "CODE128",
            width: 2,
            height: 40,
            displayValue: true,
            lineColor: "black",
            background: "transparent",
          });
        }
      });
    }
  }, [materials]);

  const handleEdit = (material_id) => {
    navigate(`/material/${material_id}`);
  };

  const handleDelete = async (material_id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      customClass: {
        popup: "relative", // for positioning
      },
      didOpen: () => {
        const swal = Swal.getPopup();

        // Create the close icon
        const closeBtn = document.createElement("button");
        closeBtn.innerHTML = "&times;";
        closeBtn.style.position = "absolute";
        closeBtn.style.top = "10px";
        closeBtn.style.right = "10px";
        closeBtn.style.background = "#fff"; // White background
        closeBtn.style.color = "#f44336"; // Red color for the cross
        closeBtn.style.border = "2px solid #f44336"; // Red border
        closeBtn.style.borderRadius = "50%"; // Round corners
        closeBtn.style.width = "30px";
        closeBtn.style.height = "30px";
        closeBtn.style.cursor = "pointer";
        closeBtn.style.fontSize = "18px";
        closeBtn.style.lineHeight = "0"; // This is to ensure the cross is centered vertically
        closeBtn.style.display = "flex";
        closeBtn.style.justifyContent = "center"; // Centers horizontally
        closeBtn.style.alignItems = "center";

        // Add cancel functionality
        closeBtn.onclick = () => {
          Swal.close(); // same as pressing "Cancel"
        };

        swal.appendChild(closeBtn);
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `http://127.0.0.1:5000/api/materials/${material_id}`
          );
          setMaterials(materials.filter((m) => m.material_id !== material_id));
          Swal.fire("Deleted!", "The material has been deleted.", "success");
        } catch (error) {
          Swal.fire("Error!", "Failed to delete the material.", "error");
        }
      }
    });
  };

  const handleBarcodeClick = (barcodeId) => {
    setSelectedBarcodeId(barcodeId);
    setBarcodeDialogOpen(true);
  };

  const handlePrint = (material_id) => {
    const material = materials.find((m) => m.material_id === material_id);
    if (!material?.barcode_id) return;
  
    const canvas = document.createElement("canvas");
  
    JsBarcode(canvas, material.barcode_id, {
      format: "CODE128",
      width: 2,
      height: 60,
      displayValue: true,
      lineColor: "black",
    });
  
    const barcodeImageUrl = canvas.toDataURL("image/png");
  
    const printWindow = window.open("", "_blank", "width=600,height=400");
  
    if (!printWindow) {
      alert("Popup blocked. Please allow popups for this site.");
      return;
    }
  
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcode</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              margin-top: 50px;
            }
            img {
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <h3>Material Barcode</h3>
          <img src="${barcodeImageUrl}" alt="Barcode" />
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.onafterprint = () => window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
  
    printWindow.document.close();
  };
  
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newOrder = [...materials];
    [newOrder[index - 1], newOrder[index]] = [
      newOrder[index],
      newOrder[index - 1],
    ];
    setMaterials(newOrder);
    saveOrderToLocalStorage(newOrder);
  };

  const handleMoveDown = (index) => {
    if (index === materials.length - 1) return;
    const newOrder = [...materials];
    [newOrder[index + 1], newOrder[index]] = [
      newOrder[index],
      newOrder[index + 1],
    ];
    setMaterials(newOrder);
    saveOrderToLocalStorage(newOrder);
  };

  const handleNavigateToCreateForm = () => {
    try {
      navigate("/material/create");
    } catch (err) {
      console.error("Navigation error:", err);
    }
  };

  if (loading)
    return <CircularProgress sx={{ margin: "2rem auto", display: "block" }} />;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Material Details
      </Typography>

      <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNavigateToCreateForm}
        >
          <AddCircleOutlineIcon sx={{ mr: 1 }} />
          Add Material
        </Button>
        <Button variant="contained" color="warning">
          Export CSV
        </Button>
      </Box>

      {/* Barcode Preview Dialog */}
      <Dialog
        open={barcodeDialogOpen}
        onClose={() => setBarcodeDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Barcode Preview
          <IconButton
            onClick={() => setBarcodeDialogOpen(false)}
            sx={{ color: "#000" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {selectedBarcodeId && (
            <svg
              ref={(el) => {
                if (el) {
                  JsBarcode(el, selectedBarcodeId, {
                    format: "CODE128",
                    width: 2,
                    height: 60,
                    displayValue: true,
                    lineColor: "#000",
                    background: "transparent",
                  });
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Materials Table */}
      <TableContainer component={Paper}>
  <Table sx={{ border: "1px solid #ccc" }}>
    <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
      <TableRow sx={{ "& > th": { border: "1px solid #ccc" } }}>
        <TableCell>Reorder</TableCell>
        <TableCell>Material</TableCell>
        <TableCell>UOM</TableCell>
        <TableCell>Storage</TableCell>
        <TableCell>Barcode</TableCell>
        <TableCell>Actions</TableCell>
      </TableRow>
    </TableHead>

    <TableBody sx={{ "& > tr": { border: "1px solid #ccc" } }}>
      {materials.map((material, index) => (
        <TableRow
          key={material.material_id}
          sx={{ "& > td": { border: "1px solid #ccc" } }}
        >
          <TableCell>
            <IconButton
              onClick={() => handleMoveUp(index)}
              disabled={index === 0}
            >
              <ArrowUpwardIcon />
            </IconButton>
            <IconButton
              onClick={() => handleMoveDown(index)}
              disabled={index === materials.length - 1}
            >
              <ArrowDownwardIcon />
            </IconButton>
          </TableCell>
          <TableCell>{material.title}</TableCell>
          <TableCell>{material.unit_of_measure}</TableCell>
          <TableCell>{material.plant_area_location}</TableCell>
          <TableCell>
            {material.barcode_id ? (
              <svg
                onClick={() => handleBarcodeClick(material.barcode_id)}
                style={{ cursor: "pointer" }}
                ref={(el) =>
                  (barcodeRefs.current[material.barcode_id] = el)
                }
              />
            ) : (
              "No Barcode"
            )}
          </TableCell>

          <TableCell>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                gap: "10px",
              }}
            >
              <Tooltip title="Edit">
                <IconButton
                  onClick={() => handleEdit(material.material_id)}
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
                  onClick={() => handleDelete(material.material_id)}
                  sx={{
                    backgroundColor: "#d32f2f",
                    color: "#fff",
                    "&:hover": { backgroundColor: "#b71c1c" },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Print">
                <IconButton
                  onClick={() => handlePrint(material.material_id)}
                  sx={{
                    backgroundColor: "#6a1b9a",
                    color: "#fff",
                    "&:hover": { backgroundColor: "#4a148c" },
                  }}
                >
                  <PrintIcon />
                </IconButton>
              </Tooltip>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>

  {/* Pagination Component */}
  <TablePagination
    component="div"
    count={total}                // total items from your backend
    page={page - 1}              // MUI uses 0-based, your state is 1-based
    onPageChange={(event, newPage) => setPage(newPage + 1)}
    rowsPerPage={limit}          // items per page from your state
    onRowsPerPageChange={(event) => {
      setPage(1);                // reset to page 1
      setLimit(parseInt(event.target.value, 10));
    }}
    rowsPerPageOptions={[10, 20, 50, 100]} // you can customize this
  />
</TableContainer>

    </Box>
  );
};

export default MaterialDetails;