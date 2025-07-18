import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    Box, CssBaseline, Drawer, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, Toolbar, AppBar, Typography,
    Avatar, Divider, useTheme, styled, IconButton,
    Menu, MenuItem, Button
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Store as StoreIcon,
    ContentCut as ContentCutIcon,
    DesignServices as ServicesIcon,
    CalendarMonth as CalendarIcon,
    PhotoAlbum as PortfolioIcon,
    Logout as LogoutIcon,
    Menu as MenuIcon,
    Home as HomeIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useAuth } from '@/contexts/AuthContext';
import { useTheme as useAppTheme } from '@/contexts/ThemeContext';

const drawerWidth = 240;

const navigationItems = [
    { text: 'Дашборд', path: '', icon: <DashboardIcon /> },
    { text: 'Пользователи', path: 'users', icon: <PeopleIcon /> },
    { text: 'Барбершопы', path: 'barbershops', icon: <StoreIcon /> },
    { text: 'Барберы', path: 'barbers', icon: <ContentCutIcon /> },
    { text: 'Услуги', path: 'services', icon: <ServicesIcon /> },
    { text: 'Записи', path: 'appointments', icon: <CalendarIcon /> },
];

const StyledNavLink = styled(NavLink)(({ theme }) => ({
    textDecoration: 'none',
    color: 'inherit',
    width: '100%',
    '&.active > div': {
        backgroundColor: theme.palette.action.selected,
        borderLeft: `4px solid ${theme.palette.primary.main}`,
    },
    '&:hover > div': {
        backgroundColor: theme.palette.action.hover,
    }
}));

const AdminLayout: React.FC = () => {
    const theme = useTheme();
    const { mode, toggleMode } = useAppTheme();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    // Функция выхода из аккаунта
    const { user, logout } = useAuth();
    // Функция перехода на главную страницу сайта
    const goToMainSite = () => {
        navigate('/');
    };

    // Функция открытия меню профиля
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    // Функция закрытия меню профиля
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box sx={{ display: 'flex', bgcolor: 'grey.50', minHeight: '100vh' }}>
            <CssBaseline />

            {/* AppBar */}
            <AppBar
                position="fixed"
                sx={{
                    zIndex: theme.zIndex.drawer + 1,
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            color="inherit"
                            onClick={goToMainSite}
                            sx={{ mr: 1 }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap>
                            <Box component="span" sx={{ color: 'primary.main' }}>Barber</Box>Admin
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            startIcon={<HomeIcon />}
                            onClick={goToMainSite}
                            sx={{ mr: 1 }}
                        >
                            На сайт
                        </Button>

                        <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                            <Avatar
                                sx={{
                                    bgcolor: 'primary.main',
                                    width: 36,
                                    height: 36,
                                    '&:hover': {
                                        transform: 'scale(1.1)',
                                        transition: 'transform 0.3s'
                                    }
                                }}
                                src="/path/to/avatar.jpg"
                            />
                        </IconButton>

                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            PaperProps={{
                                elevation: 0,
                                sx: {
                                    mt: 1.5,
                                    minWidth: 200,
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                    '& .MuiMenuItem-root': {
                                        py: 1.5,
                                        '&:hover': {
                                            backgroundColor: 'action.hover'
                                        }
                                    }
                                }
                            }}
                        >
                            <MenuItem disabled>
                                <Typography variant="subtitle2">Администратор</Typography>
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={goToMainSite}>
                                <ListItemIcon>
                                    <HomeIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>На главный сайт</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={logout}>
                                <ListItemIcon>
                                    <LogoutIcon fontSize="small" color="error" />
                                </ListItemIcon>
                                <ListItemText primaryTypographyProps={{ color: 'error' }}>
                                    Выйти
                                </ListItemText>
                            </MenuItem>
                        </Menu>
                        <IconButton color="inherit" onClick={toggleMode}>
                            {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    display: { xs: 'none', sm: 'block' },
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        bgcolor: 'background.paper',
                        borderRight: 'none',
                        boxShadow: theme.shadows[2]
                    },
                }}
            >
                <Toolbar>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        py: 2,
                        width: '100%'
                    }}>
                        <ContentCutIcon sx={{
                            fontSize: 32,
                            color: 'primary.main',
                            mr: 1
                        }} />
                        <Typography variant="h6">
                            <Box component="span" sx={{ fontWeight: 700 }}>Barber</Box>Admin
                        </Typography>
                    </Box>
                </Toolbar>

                <Divider />

                <Box sx={{ overflow: 'auto', py: 1 }}>
                    <List>
                        {navigationItems.map((item) => (
                            <ListItem
                                key={item.path}
                                disablePadding
                                sx={{ py: 0.5, px: 1.5 }}
                            >
                                <StyledNavLink to={`/admin/${item.path}`}>
                                    <ListItemButton sx={{ borderRadius: 1 }}>
                                        <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.text}
                                            primaryTypographyProps={{ variant: 'body1' }}
                                        />
                                    </ListItemButton>
                                </StyledNavLink>
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Box sx={{ mt: 'auto', p: 2 }}>
                    <Divider sx={{ mb: 2 }} />
                    <ListItemButton
                        sx={{
                            borderRadius: 1,
                            '&:hover': {
                                backgroundColor: 'error.light',
                            }
                        }}
                        onClick={logout}
                    >
                        <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary="Выйти"
                            primaryTypographyProps={{
                                variant: 'body1',
                                sx: { color: 'error.main' }
                            }}
                        />
                    </ListItemButton>
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3 },
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    pt: { xs: 8, sm: 10 }
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default AdminLayout;