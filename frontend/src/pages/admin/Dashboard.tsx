import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, CircularProgress, Alert,
    Grid, Card, CardContent, List, ListItem,
    ListItemText, ListItemIcon, Divider, Avatar,
    useTheme, Skeleton, Stack, Chip
} from '@mui/material';
import {
    People, Store, Event, History,
    Person, AdminPanelSettings, Dashboard as DashboardIcon
} from '@mui/icons-material';
import api from '@/api/base';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface DashboardStats {
    users: number;
    barbershops: number;
    appointments: number;
}

interface RecentAction {
    id: number;
    action: string;
    timestamp: string;
    user: string;
    userAvatar?: string;
}

interface RecentActionsResponse {
    actions: RecentAction[];
    total: number;
    page: number;
    totalPages: number;
}

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentActions, setRecentActions] = useState<RecentAction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const theme = useTheme();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Проверка прав администратора
                if (user?.role !== 'ADMIN') {
                    throw new Error('Требуются права администратора');
                }

                const [statsResponse, actionsResponse] = await Promise.all([
                    api.get<DashboardStats>('/admin/stats'),
                    api.get<RecentActionsResponse>('/admin/recent-actions?limit=5')
                ]);

                setStats(statsResponse.data);
                setRecentActions(actionsResponse.data.actions);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || 'Ошибка загрузки данных');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    // Если пользователь не администратор
    if (user?.role !== 'ADMIN') {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Alert severity="error" sx={{ maxWidth: 600, width: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                        Доступ запрещен
                    </Typography>
                    <Typography>
                        У вас недостаточно прав для просмотра этой страницы.
                        Требуются права администратора.
                    </Typography>
                </Alert>
            </Box>
        );
    }

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Skeleton variant="text" width={250} height={60} sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                    {[0, 1, 2].map((item) => (
                        <Grid size={{ xs: 12, md: 4 }} key={item}>
                            <Skeleton variant="rounded" height={150} />
                        </Grid>
                    ))}
                </Grid>
                <Skeleton variant="text" width={200} height={50} sx={{ mt: 4, mb: 2 }} />
                <Skeleton variant="rounded" height={300} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box mt={2} sx={{ p: 3 }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                </Alert>
            </Box>
        );
    }

    // Функция для форматирования времени
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, 'd MMMM yyyy, HH:mm', { locale: ru });
    };

    // Иконки для статистики
    const statIcons = [
        { icon: <People fontSize="large" />, color: theme.palette.primary.main },
        { icon: <Store fontSize="large" />, color: theme.palette.secondary.main },
        { icon: <Event fontSize="large" />, color: theme.palette.success.main }
    ];

    // Получение ключей статистики для отображения
    const statKeys = stats ? Object.keys(stats) as (keyof DashboardStats)[] : [];

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <AdminPanelSettings fontSize="large" color="primary" sx={{ mr: 2 }} />
                <Typography variant="h4" component="h1">
                    Панель администратора
                </Typography>
                <Chip
                    label="Администратор"
                    color="primary"
                    variant="outlined"
                    sx={{ ml: 2, alignSelf: 'center' }}
                    icon={<Person fontSize="small" />}
                />
            </Box>

            {/* Статистика */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats && statKeys.map((key, index) => (
                    <Grid size={{ xs: 12, md: 4 }} key={key}>
                        <Card
                            elevation={3}
                            sx={{
                                borderRadius: 3,
                                height: '100%',
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: theme.shadows[6]
                                }
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography
                                            variant="subtitle1"
                                            color="text.secondary"
                                            sx={{ textTransform: 'uppercase', fontWeight: 500 }}
                                        >
                                            {key === 'users' && 'Пользователи'}
                                            {key === 'barbershops' && 'Барбершопы'}
                                            {key === 'appointments' && 'Записи'}
                                        </Typography>
                                        <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>
                                            {stats[key]}
                                        </Typography>
                                    </Box>
                                    <Avatar
                                        sx={{
                                            bgcolor: `${statIcons[index].color}20`,
                                            color: statIcons[index].color,
                                            width: 60,
                                            height: 60
                                        }}
                                    >
                                        {statIcons[index].icon}
                                    </Avatar>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Последние действия */}
            <Card elevation={3} sx={{ borderRadius: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <History color="primary" sx={{ mr: 1.5 }} />
                        <Typography variant="h6" component="h2">
                            Последние действия
                        </Typography>
                    </Box>

                    {recentActions.length > 0 ? (
                        <List sx={{ p: 0 }}>
                            {recentActions.map((action, index) => (
                                <React.Fragment key={action.id}>
                                    <ListItem
                                        sx={{
                                            transition: 'background-color 0.2s',
                                            '&:hover': {
                                                backgroundColor: theme.palette.action.hover,
                                                borderRadius: 2
                                            }
                                        }}
                                    >
                                        <ListItemIcon>
                                            <Avatar
                                                sx={{
                                                    bgcolor: theme.palette.primary.light,
                                                    width: 36,
                                                    height: 36
                                                }}
                                            >
                                                {action.userAvatar ? (
                                                    <img
                                                        src={action.userAvatar}
                                                        alt={action.user}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <Person fontSize="small" />
                                                )}
                                            </Avatar>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Box>
                                                    <Typography component="span" sx={{ fontWeight: 500 }}>
                                                        {action.user}
                                                    </Typography>
                                                    <Typography component="span" variant="body2" color="text.primary">
                                                        {` ${action.action}`}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatDateTime(action.timestamp)}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                    {index < recentActions.length - 1 && <Divider variant="inset" component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    ) : (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            py: 4,
                            color: theme.palette.text.disabled
                        }}>
                            <History sx={{ fontSize: 60, mb: 1 }} />
                            <Typography variant="h6">Нет данных о действиях</Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                В системе еще не было зарегистрировано действий
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Статус системы */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card elevation={3} sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <Typography variant="h6" component="h3" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Store sx={{ mr: 1, color: theme.palette.success.main }} />
                                    Статус системы
                                </Typography>
                            </Box>
                            <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">База данных</Typography>
                                    <Chip
                                        label={stats ? "Работает" : "Ошибка"}
                                        color={stats ? "success" : "error"}
                                        size="small"
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">API сервер</Typography>
                                    <Chip
                                        label={stats ? "Работает" : "Ошибка"}
                                        color={stats ? "success" : "error"}
                                        size="small"
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Последнее обновление</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {format(new Date(), 'd MMMM yyyy', { locale: ru })}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;