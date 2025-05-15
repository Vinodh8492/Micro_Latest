import React, { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Tooltip, IconButton, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

const Bucket_Batches = () => {
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(true);
  const barcodeRefs = useRef({});
  const navigate = useNavigate();

  const [materials, setMaterials] = useState([]);

useEffect(() => {
  const fetchMaterials = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/materials');
      setMaterials(response.data);
    } catch (error) {
      alert(`Error fetching materials: ${error}`);
    }
  };
  fetchMaterials();
}, []);

  useEffect(() => {
    const fetchBuckets = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/storage");
        const bucketData = response.data;

        const enrichedBuckets = await Promise.all(
          bucketData.map(async (bucket) => {
            try {
              const matRes = await axios.get(
                `http://127.0.0.1:5000/api/materials/${bucket.material_id}`
              );
              return { ...bucket, material: matRes.data };
            } catch (err) {
              alert(`Failed to fetch material ${bucket.material_id} : ${err}`);
              return { ...bucket, material: null };
            }
          })
        );

        setBuckets(enrichedBuckets);
      } catch (error) {
        alert(`Error fetching buckets: ${error} `);
      } finally {
        setLoading(false);
      }
    };

    fetchBuckets();
  }, []);


  useEffect(() => {
    buckets.forEach((bucket) => {
      const el = barcodeRefs.current[bucket.barcode];
      if (bucket.barcode && el) {
        JsBarcode(el, bucket.barcode, {
          format: "CODE128",
          width: 2,
          height: 40,
          displayValue: true,
          lineColor: "black",
          background: "transparent",
        });
      }
    });
  }, [buckets]);

  const handleDelete = async (bucket_id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",customClass: {
        popup: 'relative', // for positioning
      },
      didOpen: () => {
        const swal = Swal.getPopup();
    
        // Create the close icon (cross icon)
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '10px';
        closeBtn.style.background = '#fff'; // White background
        closeBtn.style.color = '#f44336'; // Red color for the cross
        closeBtn.style.border = '2px solid #f44336'; // Red border
        closeBtn.style.borderRadius = '50%'; // Round corners
        closeBtn.style.width = '30px';
        closeBtn.style.height = '30px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.fontSize = '18px';
        closeBtn.style.lineHeight = '0'; // To ensure the cross is centered vertically
        closeBtn.style.display = 'flex';
        closeBtn.style.justifyContent = 'center'; // Centers horizontally
        closeBtn.style.alignItems = 'center';
    
        // Add cancel functionality to the cross icon
        closeBtn.onclick = () => {
          Swal.close(); // Close the modal on click
        };
    
        // Append the close button to the Swal popup
        swal.appendChild(closeBtn);
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://127.0.0.1:5000/api/storage/delete/${bucket_id}`);
          setBuckets(buckets.filter((b) => b.bucket_id !== bucket_id));
          Swal.fire("Deleted!", "The storage bucket has been deleted.", "success");
        } catch (error) {
          Swal.fire("Error!", "Failed to delete the storage bucket.", "error");
        }
      }
    });
  };

  const handleEdit = async (bucket) => {
    const uniqueLocationIds = [...new Set(materials.map(b => b.plant_area_location))];
  
    const locationOptions = uniqueLocationIds.map((id) => {
      const selected = String(id) === String(bucket.location_id) ? 'selected' : '';
      return `<option value="${id}" ${selected}>${id}</option>`;
    }).join('');
  
    const container = document.createElement('div');
  
    const form = document.createElement('div');
    form.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 15px; padding: 20px; width: 100%; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column;">
          <label for="swal-location" style="font-weight: bold; margin-bottom: 5px;">Location ID</label>
          <select id="swal-location" class="swal2-input" style=" background-color : white; padding: 10px; font-size: 14px; border-radius: 5px; border: 1px solid #ccc;">
            <option value="">Select Location</option>
            ${locationOptions}
          </select>
        </div>
        <div style="display: flex; flex-direction: column;">
          <label for="swal-barcode" style="font-weight: bold; margin-bottom: 5px;">Barcode</label>
          <input id="swal-barcode" class="swal2-input" value="${bucket.barcode || ""}" readonly style="padding: 10px; font-size: 14px; border-radius: 5px; border: 1px solid #ccc;">
          <button id="generate-barcode" style="margin-top: 10px; padding: 10px; font-size: 14px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Generate Barcode</button>
          <canvas id="barcode-canvas" style="margin-top: 10px;"></canvas>
        </div>
      </div>
    `;
    container.appendChild(form);
  
    const { value: formValues } = await Swal.fire({
      title: "Edit Bucket",
      html: container,
      focusConfirm: false,
      showConfirmButton: true,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      showCancelButton: true,
      preConfirm: () => {
        const location = document.getElementById("swal-location").value;
        const barcode = document.getElementById("swal-barcode").value;
        if (!location || !barcode) {
          Swal.showValidationMessage("Both fields are required.");
          return null;
        }
        return { location, barcode };
      },
      didOpen: () => {
        // ✅ Inject close button in top-right of title
        const swalTitle = document.querySelector('.swal2-title');
        if (swalTitle) {
          const closeButton = document.createElement('button');
          closeButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24">
              <path fill="red" d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.89 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4Z"/>
            </svg>
          `;
          closeButton.style.border = '1px solid red';
          closeButton.style.borderRadius = '50%';
          closeButton.style.padding = '6px';
          closeButton.style.width = '40px';
          closeButton.style.height = '40px';
          closeButton.style.backgroundColor = 'white';
          closeButton.style.cursor = 'pointer';
          closeButton.style.position = 'absolute';
          closeButton.style.right = '10px';
          closeButton.style.top = '10px';
  
          closeButton.addEventListener('click', () => {
            Swal.close();
          });
  
          // Ensure popup is relatively positioned
          const swalPopup = document.querySelector('.swal2-popup');
          if (swalPopup) {
            swalPopup.style.position = 'relative';
          }
  
          swalTitle.parentNode.appendChild(closeButton);
        }
  
        // ✅ Barcode generator logic
        document.getElementById('generate-barcode').addEventListener('click', () => {
          const newBarcode = generateBarcode();
          const canvas = document.getElementById('barcode-canvas');
          JsBarcode(canvas, newBarcode, {
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
          document.getElementById('swal-barcode').value = newBarcode;
        });
      }
    });
  
    if (formValues) {
      try {
        await axios.put(`http://127.0.0.1:5000/api/storage/update/${bucket.bucket_id}`, {
          location_id: formValues.location,
          barcode: formValues.barcode,
        });
  
        setBuckets((prev) =>
          prev.map((b) =>
            b.bucket_id === bucket.bucket_id
              ? { ...b, location_id: formValues.location, barcode: formValues.barcode }
              : b
          )
        );
  
        Swal.fire("Updated!", "Bucket details have been updated.", "success");
      } catch (error) {
        Swal.fire("Error!", "Failed to update the bucket.", "error");
      }
    }
  };
  
  
  
  // Function to generate a random barcode
  function generateBarcode() {
    const prefix = '7'; // Barcode starts with 7
    const firstPart = Math.floor(100000 + Math.random() * 900000);
    const secondPart = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}${firstPart}${secondPart}`;
  }
  
  

  
  const handleView = async (barcode) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/storage/${barcode}`);
      const data = response.data;

      const materialId = data.material_id;

    // Initialize materialTitle with a default value
    let materialTitle = "-";
    let updatedAt = "-"

    // If materialId exists, make a second API call to get material details
    if (materialId) {
      try {
        const materialResponse = await axios.get(`http://127.0.0.1:5000/api/materials/${materialId}`);
        materialTitle = materialResponse.data.title || "-";
        updatedAt = materialResponse.data.updated_at || "-"
      } catch (materialError) {
        alert(`Error fetching material data: ${materialError}`);
      }
    }



    Swal.fire({
      title: `<strong>Bucket Details</strong>`,
      html: `
        <div style="text-align: left;">
          <p><strong>Bucket ID:</strong> ${data.bucket_id}</p>
          <p><strong>Material ID:</strong> ${data.material_id}</p>
          <p><strong>Material Name:</strong> ${materialTitle || "-"}</p>
          <p><strong>Location ID:</strong> ${data.location_id || "-"}</p>
          <p><strong>Barcode:</strong> ${data.barcode}</p>
          <p><strong>Created At:</strong> ${data.created_at || "-"}</p>
          <p><strong>Updated At:</strong> ${updatedAt || "-"}</p>
        </div>
      `,
      didOpen: () => {
        const swalContainer = Swal.getPopup();
        const closeBtn = document.createElement('button');
    
        closeBtn.innerHTML = '&times;'; // × character
        closeBtn.setAttribute('aria-label', 'Close');
    
        closeBtn.style.cssText = `
          position: absolute;
          top: 10px;
          right: 15px;
          height: 40px;
          width: 40px;
          border-radius: 50%;
          border: 1px solid red;
          background: transparent;
          color: red;
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1001;
        `;
    
        closeBtn.onclick = () => Swal.close();
        swalContainer.appendChild(closeBtn);
      },
      confirmButtonText: 'Close',
      width: 500
    });
    
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || "Failed to fetch bucket data",
      });
    }
  };

  const handleReset = () => {
    Swal.fire("Reset", "Reset action performed.", "info");
  };
  
  const handleReassign = () => {
    // Add your reassign logic here, for example, reassigning buckets or materials
    Swal.fire("Reassign", "Reassign action performed.", "info");
  };


  const groupedByLocation = buckets.reduce((acc, bucket) => {
    const location = bucket.location_id || "Unknown";
    if (!acc[location]) acc[location] = [];
    acc[location].push(bucket);
    return acc;
  }, {});

  if (loading) return <p>Loading...</p>;

  return (
    <div className="px-4 sm:px-6 md:px-8 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: {
                xs: "1rem",
                sm: "1.25rem",
                md: "1.5rem",
                lg: "2rem",
              },
            }}
          >
            Storage Assignment
          </Typography>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate("/create-storage")}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Assign bucket
          </button>

          <button
            onClick={handleReset}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Reset
          </button>

          <button
            onClick={handleReassign}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Reassign
          </button>

        </div>
      </div>

      {Object.entries(groupedByLocation).map(([location, bucketList]) => (
        <div key={location} className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <Typography sx={{
              fontWeight: "bold",
               fontSize:"25px"
            }}>{location}</Typography>
          </div>

          <div className="w-full overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-white border border-gray-200 text-center">
              <thead className="bg-gray-100 text-xs font-semibold text-gray-700">
                <tr>
                  <th className="p-3 border-b">Bucket ID</th>
                  <th className="p-3 border-b">Material ID</th>
                  <th className="p-3 border-b">Material Name</th>
                  <th className="p-3 border-b">Bucket Location</th>
                  <th className="p-3 border-b">Barcode</th>
                  <th className="p-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-800">
                {bucketList.map((bucket) => (
                  <tr key={bucket.bucket_id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3">{bucket.bucket_id}</td>
                    <td className="p-3">{bucket.material_id}</td>
                    <td className="p-3">{bucket.material?.title || "-"}</td>
                    <td className="p-3">{bucket.location_id || "-"}</td>
                    <td className="p-3">
                      <svg
                        className="h-10 w-auto mx-auto"
                        ref={(el) => (barcodeRefs.current[bucket.barcode] = el)}
                      ></svg>
                    </td>
                    <td className="p-3">
                    <Tooltip title="View">
                        <IconButton
                          onClick={() => handleView(bucket.barcode)}
                          sx={{
                            backgroundColor: "#6a1b9a",
                            color: "#fff",
                            "&:hover": { backgroundColor: "#4a148c" },
                            mr: 1,
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => handleEdit(bucket)}
                          sx={{
                            backgroundColor: "#1976d2",
                            color: "#fff",
                            "&:hover": { backgroundColor: "#1565c0" },
                            mr: 1,
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleDelete(bucket.bucket_id)}
                          sx={{
                            backgroundColor: "#d32f2f",
                            color: "#fff",
                            "&:hover": { backgroundColor: "#b71c1c" },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Bucket_Batches;