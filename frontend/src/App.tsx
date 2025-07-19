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
import BarbershopForm from './pages/admin/barbershops/BarbershopForm';
import AdminBarbershopList from './pages/admin/barbershops/AdminBarbershopList';
import AdminBarberList from './pages/admin/barbers/AdminBarberList';
import BarberForm from './pages/admin/barbers/BarberForm';
import AdminServiceList from './pages/admin/services/AdminServiceList';
import ServiceForm from './pages/admin/services/ServiceForm';
import AdminAppointmentList from './pages/admin/appointments/AdminAppointmentList';
import AppointmentForm from './pages/admin/appointments/AppointmentForm';

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

                    {/* Приватные маршруты */}
                    <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN, Role.USER]} />}>
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
                            <Route path="barbershops" element={<AdminBarbershopList />} />
                            <Route path="barbershops/new" element={<BarbershopForm />} />
                            <Route path="barbershops/:id" element={<BarbershopForm />} />
                            <Route path="barbers" element={<AdminBarberList />} />
                            <Route path="barbers/new" element={<BarberForm />} />
                            <Route path="barbers/:id" element={<BarberForm />} />
                            <Route path="services" element={<AdminServiceList />} />
                            <Route path="services/new" element={<ServiceForm />} />
                            <Route path="services/:id" element={<ServiceForm />} />
                            <Route path="appointments" element={<AdminAppointmentList />} />
                            <Route path="appointments/new" element={<AppointmentForm />} />
                            <Route path="appointments/:id" element={<AppointmentForm />} />
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