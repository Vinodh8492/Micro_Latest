import React, { useState, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LogoContext } from "./context/LogoContext";
import { DosingProvider } from "./pages/DosingContext";

import Sidebar from "./components/Sidebar";
import ThemeToggle from "./pages/ThemeToggle";

// Lazy-loaded pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const MaterialDetails = lazy(() => import("./pages/MaterialDetails"));
const MaterialForm = lazy(() => import("./pages/MaterialForm"));
const EditMaterial = lazy(() => import("./pages/EditMaterial"));
const ViewMaterial = lazy(() => import("./pages/ViewMaterial"));
const MaterialTransactionPage = lazy(() => import("./pages/MaterialTransactionForm"));
const Recipes = lazy(() => import("./pages/Recipes"));
const RecipeEditForm = lazy(() => import("./pages/RecipeEditForm"));
const FormulaEditForm = lazy(() => import("./pages/FormulaDetailsEdit"));
const FormulaViewDetails = lazy(() => import("./pages/FormulaViewDetails"));
const Batches = lazy(() => import("./pages/Batches"));
const CreateBatch = lazy(() => import("./pages/CreateBatch"));
const Bucket_Batches = lazy(() => import("./pages/Bucket_Batches"));
const CreateStorageBucketForm = lazy(() => import("./pages/CreateStorageBucketForm"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const History = lazy(() => import("./pages/History"));
const ActiveOrders = lazy(() => import("./pages/ActiveOrders"));
const ViewOrder = lazy(() => import("./pages/ViewOrder"));
const Topbar = lazy(() => import("./pages/Topbar"));
const SettingsPage = lazy(()=> import('./pages/SettingsPage'))

function Layout({ children }) {
  const location = useLocation();
  const hideForRoutes = ["/login"];
  const shouldHideTopbar = hideForRoutes.includes(location.pathname);

  return (
    <div className="flex h-screen">
      {!shouldHideTopbar && <Sidebar />}
      <div
        className="flex-1 p-6 overflow-auto relative"
        style={{ background: "transparent", transition: "background 0.4s ease" }}
      >
        {!shouldHideTopbar && <Topbar />}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        {children}
      </div>
    </div>
  );
}

function AppRoutes() {
  const [materials, setMaterials] = useState([]);
  const [logoUrl, setLogoUrl] = useState('');

  return (
    <DosingProvider>
      <LogoContext.Provider value={{ logoUrl, setLogoUrl }}>
        <Layout>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/material" element={<MaterialDetails />} />
              <Route path="/material/create" element={<MaterialForm setMaterials={setMaterials} />} />
              <Route path="/material/:material_id" element={<EditMaterial />} />
              <Route path="/material/view/:material_id" element={<ViewMaterial />} />
              <Route path="/material-transactions" element={<MaterialTransactionPage />} />
              <Route path="/orders/:order_id" element={<ViewOrder />} />
              <Route path="/activeorders" element={<ActiveOrders />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/recipes/edit/:recipe_id" element={<RecipeEditForm />} />
              <Route path="/formula-details/edit/:recipe_id" element={<FormulaEditForm />} />
              <Route path="/recipes/view/:recipe_id" element={<FormulaViewDetails />} />
              <Route path="/batches" element={<Batches />} />
              <Route path="/create-batch" element={<CreateBatch />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/storage" element={<Bucket_Batches />} />
              <Route path="/login" element={<Login />} />
              <Route path="/create-storage" element={<CreateStorageBucketForm />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<AdminPage />} />
            </Routes>
          </Suspense>
        </Layout>
      </LogoContext.Provider>
    </DosingProvider>
  );
}

function AppContent() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}