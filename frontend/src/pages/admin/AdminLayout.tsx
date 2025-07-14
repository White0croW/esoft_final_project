import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Box, CssBaseline, Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar, AppBar, Typography } from '@mui/material';

const drawerWidth = 240;

// Маппинг русских названий на английские пути
const navigationItems = [
    { text: 'Пользователи', path: 'users' },
    { text: 'Барбершопы', path: 'barbershops' },
    { text: 'Барберы', path: 'barbers' },
    { text: 'Услуги', path: 'services' },
    { text: 'Записи', path: 'appointments' },
    { text: 'Портфолио', path: 'portfolio' }
];

const AdminLayout: React.FC = () => {
    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" noWrap>
                        BarberShop Admin
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {navigationItems.map((item) => (
                            <ListItem key={item.path} disablePadding>
                                <ListItemButton
                                    component={Link}
                                    to={`/admin/${item.path}`}
                                >
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};

export default AdminLayout;