import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";

import Home from "./pages/Home";
import Services from "./pages/Services";
import Barbers from "./pages/Barbers";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Unauthorized from "./pages/Unauthorized";
import Appointments from "./pages/Appointments";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="services" element={<Services />} />
                <Route path="barbers" element={<Barbers />} />
                <Route path="signin" element={<SignIn />} />
                <Route path="signup" element={<SignUp />} />
                <Route path="unauthorized" element={<Unauthorized />} />

                {/* Приватные маршруты */}
                <Route element={<ProtectedRoute />}>
                    <Route path="appointments" element={<Appointments />} />
                    <Route path="profile" element={<Profile />} />
                </Route>

                {/* Только для админа */}
                <Route element={<ProtectedRoute role="admin" />}>
                    <Route path="admin" element={<AdminPanel />} />
                </Route>
            </Route>

            {/* Любой другой URL — на главную */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
