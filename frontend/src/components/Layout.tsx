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

const drawerWidth = 240;
const links = [
    { to: "/", label: "Dashboard" },
    { to: "/services", label: "Services" },
    { to: "/barbers", label: "Barbers" },
    { to: "/appointments", label: "Appointments" },
    { to: "/profile", label: "Profile" },
];

export default function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const toggle = () => setMobileOpen(v => !v);

    const drawer = (
        <Box onClick={toggle} sx={{ textAlign: "center" }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                BarberService
            </Typography>
            <Divider />
            <List>
                {links.map(({ to, label }) => (
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
                        {links.map(({ to, label }) => (
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
