import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import api from '@/api/base';
import { useAuth } from '@/contexts/AuthContext';

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
}

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentActions, setRecentActions] = useState<RecentAction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Проверка роли администратора
                if (user?.role !== 'ADMIN') {
                    throw new Error('Требуются права администратора');
                }

                // Параллельная загрузка данных
                const [statsResponse, actionsResponse] = await Promise.all([
                    api.get<DashboardStats>('/admin/stats'),
                    api.get<RecentAction[]>('/admin/recent-actions')
                ]);

                setStats(statsResponse.data);
                setRecentActions(actionsResponse.data);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || 'Ошибка загрузки данных');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box mt={2}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Панель администратора
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6">Статистика</Typography>
                <Box mt={2}>
                    <Typography>Количество пользователей: {stats?.users || 0}</Typography>
                    <Typography>Количество барбершопов: {stats?.barbershops || 0}</Typography>
                    <Typography>Количество записей: {stats?.appointments || 0}</Typography>
                </Box>
            </Paper>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6">Последние действия</Typography>
                <Box mt={2}>
                    {recentActions.length > 0 ? (
                        recentActions.map((action) => (
                            <Box key={action.id} mb={1} p={1} bgcolor="action.hover" borderRadius={1}>
                                <Typography variant="body2">
                                    <b>{action.user}</b> — {action.action}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(action.timestamp).toLocaleString()}
                                </Typography>
                            </Box>
                        ))
                    ) : (
                        <Typography>Нет данных о действиях</Typography>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default Dashboard;