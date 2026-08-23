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
            <Route path="resources" element={<ResourcesPage />} />
            <Route path="food" element={<FoodPage />} />
            <Route path="blood" element={<BloodPage />} />
            <Route path="emergency" element={<EmergencyPage />} />
            <Route path="impact" element={<ImpactPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="verifications" element={<VerificationsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
