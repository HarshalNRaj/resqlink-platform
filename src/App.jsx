import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
import VerificationsPage from "./pages/VerificationsPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/app" element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="resources" element={<ProtectedRoute section="resources"><ResourcesPage /></ProtectedRoute>} />
            <Route path="food" element={<ProtectedRoute section="food"><FoodPage /></ProtectedRoute>} />
            <Route path="blood" element={<ProtectedRoute section="blood"><BloodPage /></ProtectedRoute>} />
            <Route path="emergency" element={<ProtectedRoute section="emergency"><EmergencyPage /></ProtectedRoute>} />
            <Route path="impact" element={<ImpactPage />} />
            <Route path="verifications" element={<ProtectedRoute section="verifications"><VerificationsPage /></ProtectedRoute>} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
