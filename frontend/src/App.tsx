import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";

import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Unauthorized from "./pages/Unauthorized";
import Profile from "./pages/Profile";

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="signin" element={<SignIn />} />
                <Route path="signup" element={<SignUp />} />
                <Route path="unauthorized" element={<Unauthorized />} />

                {/* Приватные маршруты */}
                <Route element={<ProtectedRoute />}>
                    <Route path="profile" element={<Profile />} />
                </Route>

            </Route>

            {/* Любой другой URL — на главную */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
