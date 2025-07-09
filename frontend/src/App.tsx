// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";

import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Unauthorized from "./pages/Unauthorized";

import Layout from "./components/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";

import Home from "./pages/Home";          // <- нужно создать
import Services from "./pages/Services";
import Barbers from "./pages/Barbers";
import Appointments from "./pages/Appointments";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";

export default function App() {
    return (
        <Routes>
            {/* ПУБЛИЧНЫЕ СТРАНИЦЫ */}
            <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="services" element={<Services />} />
                <Route path="barbers" element={<Barbers />} />
            </Route>

            {/* АУТЕНТИФИКАЦИЯ */}
            <Route path="signin" element={<SignIn />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="unauthorized" element={<Unauthorized />} />

            {/* ЗАЩИЩЁННЫЕ ДЛЯ ЛЮБЫХ АВТОРИЗОВАННЫХ */}
            <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                    <Route path="appointments" element={<Appointments />} />
                    <Route path="profile" element={<Profile />} />
                </Route>
            </Route>

            {/* ТОЛЬКО ДЛЯ АДМИНА */}
            <Route element={<ProtectedRoute role="admin" />}>
                <Route element={<Layout />}>
                    <Route path="admin" element={<AdminPanel />} />
                </Route>
            </Route>

            {/* ВСЁ ОСТАЛЬНОЕ → /signin */}
            <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
    );
}
