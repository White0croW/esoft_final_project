// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";

import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Unauthorized from "./pages/Unauthorized";

import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import ServicesPage from "./pages/Services";
import Barbers from "./pages/Barbers";
import Appointments from "./pages/Appointments";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";

export default function App() {
    return (
        <Routes>
            {/* публичные */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* приватные: сначала ProtectedRoute, внутри него Layout */}
            <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="services" element={<ServicesPage />} />
                    <Route path="barbers" element={<Barbers />} />
                    <Route path="appointments" element={<Appointments />} />
                    <Route path="profile" element={<Profile />} />
                </Route>
            </Route>

            {/* только для админа */}
            <Route element={<ProtectedRoute role="admin" />}>
                <Route element={<Layout />}>
                    <Route path="admin" element={<AdminPanel />} />
                </Route>
            </Route>

            {/* всё остальное — кидаем на /signin */}
            <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
    );
}
