import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ResourcesPage from "./pages/ResourcesPage";
import FoodPage from "./pages/FoodPage";
import BloodPage from "./pages/BloodPage";
import EmergencyPage from "./pages/EmergencyPage";
import ImpactPage from "./pages/ImpactPage";
import ProfilePage from "./pages/ProfilePage";
import VerificationsPage from "./pages/VerificationsPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="resources" element={<ProtectedRoute section="resources"><ResourcesPage /></ProtectedRoute>} />
            <Route path="food" element={<ProtectedRoute section="food"><FoodPage /></ProtectedRoute>} />
            <Route path="blood" element={<ProtectedRoute section="blood"><BloodPage /></ProtectedRoute>} />
            <Route path="emergency" element={<ProtectedRoute section="emergency"><EmergencyPage /></ProtectedRoute>} />
            <Route path="impact" element={<ProtectedRoute section="impact"><ImpactPage /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute section="profile"><ProfilePage /></ProtectedRoute>} />
            <Route path="verifications" element={<ProtectedRoute section="verifications"><VerificationsPage /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
