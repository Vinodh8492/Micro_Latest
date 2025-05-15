import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, IconButton } from '@mui/material';  // Importing required Material UI components
import CloseIcon from '@mui/icons-material/Close';

const ViewOrder = () => {
  const { order_id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState({
    order_number: '',
    recipe_id: '',
    batch_size: '',
    scheduled_date: '',
    status: '',
    created_by: ''
  });

  useEffect(() => {
    axios.get(`http://127.0.0.1:5000/api/production_orders/${order_id}`)
      .then((response) => {
        setOrder(response.data);
      })
      .catch((error) => console.error('Error fetching order:', error));
  }, [order_id]);

  console.log("order :", order)

  return (
    <div className="container mx-auto p-6">
     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          View Order
        </Typography>
        <IconButton
          onClick={() => navigate(-1)}  // Navigate to the previous page
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

      <div className="space-y-4">

      <div className="mt-6 p-4 border rounded bg-gray-50 space-y-4">
  <div>
    <strong>Order Number:</strong> {order.order_number}
  </div>
  <div>
    <strong>Recipe ID:</strong> {order.recipe_id}
  </div>
  <div>
    <strong>Batch Size:</strong> {order.batch_size}
  </div>
  <div>
    <strong>Scheduled Date:</strong> {order.scheduled_date}
  </div>
  <div>
    <strong>Status:</strong> {order.status}
  </div>
  <div>
    <strong>Created By:</strong> {order.created_by}
  </div>
</div>


        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={() => navigate('/activeorders')}
        >
          Back to Orders
        </button>
      </div>
    </div>
  );
};

export default ViewOrder;
