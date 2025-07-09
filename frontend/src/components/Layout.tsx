// src/components/Layout.tsx
import { NavLink, Outlet } from "react-router-dom";
import {
    AppBar,
    Box,
    CssBaseline,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Toolbar,
    Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import LogoutIcon from "@mui/icons-material/Logout";
import Tooltip from "@mui/material/Tooltip";

const drawerWidth = 240;

export default function Layout() {
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const toggle = () => setMobileOpen(v => !v);

    const links = [
        { to: "/", label: "Dashboard", public: true },
        { to: "/services", label: "Services", public: true },
        { to: "/barbers", label: "Barbers", public: true },
        { to: "/appointments", label: "Appointments", role: "user" },
        { to: "/profile", label: "Profile", role: "user" },
        { to: "/admin", label: "Admin Panel", role: "admin" },
    ];

    const visibleLinks = links.filter(link => {
        if (link.public) return true;
        if (!user) return false;
        if (link.role === "user") return true;
        if (link.role === "admin") return user.role === "admin";
        return false;
    });

    const drawer = (
        <Box onClick={toggle} sx={{ textAlign: "center" }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                BarberService
            </Typography>
            <Divider />
            <List>
                {visibleLinks.map(({ to, label }) => (
                    <ListItem key={to} disablePadding>
                        <ListItemButton
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
                    </ListItem>
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
                        onClick={toggle}
                        sx={{ mr: 2, display: { md: "none" } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        BarberService
                    </Typography>
                    <Box sx={{ display: { xs: "none", md: "block" } }}>
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
                    </Box>
                    {user && (
                        <Tooltip title="Выйти">
                            <IconButton color="inherit" onClick={logout}>
                                <LogoutIcon />
                            </IconButton>
                        </Tooltip>
                    )}

                </Toolbar>
            </AppBar>
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={toggle}
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
