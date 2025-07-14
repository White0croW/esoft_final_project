import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoadingSpinner from "./components/LoadingSpinner";
import AdminLayout from './pages/admin/AdminLayout';
import UserList from './pages/admin/users/UserList';
import UserForm from './pages/admin/users/UserForm';


// Статический импорт для главной страницы
import Home from "./pages/Home";
import { Role } from './types';

// Lazy-импорт остальных страниц
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const Profile = lazy(() => import("./pages/Profile"));
const BarbershopsList = lazy(() => import("./pages/BarbershopsList"));
const BarbershopDetail = lazy(() => import("./pages/BarbershopDetail"));
const BarberDetail = lazy(() => import("./pages/BarberDetail"));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));

const queryClient = new QueryClient();

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Routes>
                <Route element={<Layout />}>
                    <Route index element={<Home />} />

                    {/* Публичные маршруты */}
                    <Route element={<PublicRoute />}>
                        <Route path="signin" element={
                            <Suspense fallback={<LoadingSpinner />}>
                                <SignIn />
                            </Suspense>
                        } />
                        <Route path="signup" element={
                            <Suspense fallback={<LoadingSpinner />}>
                                <SignUp />
                            </Suspense>
                        } />
                    </Route>

                    <Route path="barbershops" element={
                        <Suspense fallback={<LoadingSpinner />}>
                            <BarbershopsList />
                        </Suspense>
                    } />
                    <Route path="barbershops/:id" element={
                        <Suspense fallback={<LoadingSpinner />}>
                            <BarbershopDetail />
                        </Suspense>
                    } />
                    <Route path="barbers/:id" element={
                        <Suspense fallback={<LoadingSpinner />}>
                            <BarberDetail />
                        </Suspense>
                    } />

                    {/* Приватные маршруты */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="profile" element={
                            <Suspense fallback={<LoadingSpinner />}>
                                <Profile />
                            </Suspense>
                        } />
                    </Route>

                    {/* Админские роуты */}
                    <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN]} />}>
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={
                                <Suspense fallback={<LoadingSpinner />}>
                                    <Dashboard />
                                </Suspense>
                            } />
                            <Route path="users" element={<UserList />} />
                            <Route path="users/new" element={<UserForm />} />
                            <Route path="users/:id" element={<UserForm />} />
                            {/* Добавим остальные сущности позже */}
                        </Route>
                    </Route>

                    {/* Страница ошибки */}
                    <Route path="unauthorized" element={
                        <Suspense fallback={<LoadingSpinner />}>
                            <Unauthorized />
                        </Suspense>
                    } />

                    {/* Любой другой URL — на главную */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </QueryClientProvider>
    );
}