import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, IconButton } from '@mui/material';   // Importing IconButton
import CloseIcon from '@mui/icons-material/Close';

const ViewRecipe = () => {
  const { recipe_id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState({
    order_number: '',
    recipe_id: '',
    batch_size: '',
    scheduled_date: '',
    status: '',
    created_by: ''
  });

  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Fetch order data
  useEffect(() => {
    axios.get(`http://127.0.0.1:5000/api/recipes/${recipe_id}`)
      .then((response) => {
        setOrder(response.data);
      })
      .catch((error) => console.error('Error fetching order:', error));
  }, [recipe_id]);

  // Fetch recipes and match with current order
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/recipes");
        const allRecipes = response.data;
        setRecipes(allRecipes);
        console.log("recipes :", allRecipes)

        // Match recipe_id from order
        const matched = allRecipes.find(r => r.recipe_id === Number(order.recipe_id));
        setSelectedRecipe(matched || null);

      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };
    fetchRecipes();
  }, [order.recipe_id]); // Re-run if recipe_id changes

  return (
    <div className="container mx-auto p-6">
     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          View Recipe
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


        {/* Render Recipe Details if Found */}
        {selectedRecipe && (
          <div className="mt-6 p-4 border rounded bg-gray-50">
            <h2 className="text-xl font-semibold mb-2">Recipe Details</h2>

            <div className="mb-2">
              <strong>Name:</strong> {selectedRecipe.name}
            </div>

            <div className="mb-2">
              <strong>Code:</strong> {selectedRecipe.code}
            </div>

            <div className="mb-2">
              <strong>Description:</strong> {selectedRecipe.description}
            </div>

            <div className="mb-2">
              <strong>Status:</strong> {selectedRecipe.status}
            </div>

            <div className="mb-2">
              <strong>Version:</strong> {selectedRecipe.version}
            </div>
          </div>
        )}

        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={() => navigate('/recipes')}
        >
          Back to Recipes
        </button>
      </div>
    </div>
  );
};

export default ViewRecipe;
