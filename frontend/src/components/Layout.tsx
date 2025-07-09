// src/components/Layout.tsx
import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
    AppBar,
    Box,
    CssBaseline,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemText,
    Toolbar,
    Typography,
    Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../contexts/AuthContext";

const drawerWidth = 240;

interface LinkConfig {
    to: string;
    label: string;
    public?: boolean;
    role?: "user" | "admin";
}

export default function Layout() {
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const toggleDrawer = () => setMobileOpen(open => !open);

    const links: LinkConfig[] = [
        { to: "/", label: "Главная", public: true },
        { to: "/services", label: "Услуги", public: true },
        { to: "/barbers", label: "Мастера", public: true },
        { to: "/appointments", label: "Мои записи", role: "user" },
        { to: "/profile", label: "Профиль", role: "user" },
        { to: "/admin", label: "Админ-панель", role: "admin" },
    ];

    const visibleLinks = links.filter(link => {
        if (link.public) return true;
        if (!user) return false;
        return link.role === "admin"
            ? user.role === "admin"
            : link.role === "user";
    });

    const drawer = (
        <Box onClick={toggleDrawer} sx={{ textAlign: "center" }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                BarberService
            </Typography>
            <Divider />
            <List>
                {visibleLinks.map(({ to, label }) => (
                    <ListItemButton
                        key={to}
                        component={NavLink}
                        to={to}
                        sx={{
                            "&.active .MuiListItemText-primary": {
                                color: "primary.main",
                                fontWeight: "bold",
                            },
                        }}
                    >
                        <ListItemText primary={label} />
                    </ListItemButton>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />

            <AppBar component="nav">
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={toggleDrawer}
                        sx={{ mr: 2, display: { md: "none" } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        BarberService
                    </Typography>

                    <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
                        {visibleLinks.map(({ to, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                style={({ isActive }) => ({
                                    margin: "0 12px",
                                    color: isActive ? "#fff" : "rgba(255,255,255,0.7)",
                                    textDecoration: "none",
                                })}
                            >
                                {label}
                            </NavLink>
                        ))}

                        {user && (
                            <Tooltip title="Выйти">
                                <IconButton color="inherit" onClick={logout}>
                                    <LogoutIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={toggleDrawer}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": { width: drawerWidth },
                }}
            >
                {drawer}
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                <Outlet />
            </Box>
        </Box>
    );
}
