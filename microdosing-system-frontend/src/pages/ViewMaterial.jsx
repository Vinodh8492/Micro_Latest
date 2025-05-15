import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ViewMaterial = () => {
  const { material_id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState({
    material_id: '',
    title: '',
    barcode_id: '',
    location_barcode_id: '',
    plant_area_location: '',
    description: ''
  });

  useEffect(() => {
    axios.get(`http://127.0.0.1:5000/api/materials/${material_id}`)
      .then((response) => {
        setMaterial(response.data);
      })
      .catch((error) => console.error('Error fetching material:', error));
  }, [material_id]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">View Material</h1>
      <div className="space-y-4">

        <input
          type="text"
          name="material_id"
          value={material.material_id}
          disabled
          className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
        />

        <input
          type="text"
          name="title"
          value={material.title}
          disabled
          className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
        />

        <input
          type="text"
          name="barcode_id"
          value={material.barcode_id}
          disabled
          className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
        />

        <input
          type="text"
          name="location_barcode_id"
          value={material.location_barcode_id}
          disabled
          className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
        />

        <input
          type="text"
          name="plant_area_location"
          value={material.plant_area_location}
          disabled
          className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
        />

        <textarea
          name="description"
          value={material.description}
          disabled
          rows={4}
          className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed resize-none"
        />

        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={() => navigate(-1)}
        >
          Back to Materials
        </button>
      </div>
    </div>
  );
};

export default ViewMaterial;
