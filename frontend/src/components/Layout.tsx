import { useState } from "react";
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
import { useTheme } from "../contexts/ThemeContext";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

const drawerWidth = 240;

interface LinkConfig {
    to: string;
    label: string;
    public?: boolean;
    role?: "user" | "admin";
}

export default function Layout() {
    const { mode, toggleMode } = useTheme();
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const toggleDrawer = () => setMobileOpen((o) => !o);

    const links: LinkConfig[] = [
        { to: "/", label: "Главная", public: true },
        { to: "/profile", label: "Профиль", role: "user" },
    ];

    const visibleLinks = links.filter((link) => {
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
                {!user && (
                    <>
                        <ListItemButton component={NavLink} to="/signin">
                            <ListItemText primary="Войти" />
                        </ListItemButton>
                        <ListItemButton component={NavLink} to="/signup">
                            <ListItemText primary="Регистрация" />
                        </ListItemButton>
                    </>
                )}
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

                    <Typography
                        variant="h6"
                        component={NavLink}
                        to="/"
                        sx={{ flexGrow: 1, color: "inherit", textDecoration: "none" }}
                    >
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
                        {!user && (
                            <>
                                <NavLink
                                    to="/signin"
                                    style={{ margin: "0 12px", color: "#fff", textDecoration: "none" }}
                                >
                                    Войти
                                </NavLink>
                                <NavLink
                                    to="/signup"
                                    style={{ margin: "0 12px", color: "#fff", textDecoration: "none" }}
                                >
                                    Регистрация
                                </NavLink>
                            </>
                        )}
                        {user && (
                            <Tooltip title="Выйти">
                                <IconButton color="inherit" onClick={logout}>
                                    <LogoutIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                        <IconButton color="inherit" onClick={toggleMode}>
                            {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
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
