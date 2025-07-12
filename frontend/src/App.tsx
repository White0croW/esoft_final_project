import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

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

                {/* Публичные маршруты */}
                <Route element={<PublicRoute />}>
                    <Route path="signin" element={<SignIn />} />
                    <Route path="signup" element={<SignUp />} />
                </Route>

                {/* Приватные маршруты */}
                <Route element={<ProtectedRoute />}>
                    <Route path="profile" element={<Profile />} />
                </Route>

                {/* Страница ошибки */}
                <Route path="unauthorized" element={<Unauthorized />} />

                {/* Любой другой URL — на главную */}
                <Route path="*" element={<Navigate to="/" replace />} />

            </Route>


        </Routes>
    );
}
