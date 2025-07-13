import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
    Alert,
    Box,
    Container,
    Paper,
    Snackbar,
    TextField,
    Typography,
    InputAdornment,
    IconButton,
    Button,
    useTheme,
    Fade,
    Grid
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Lock, Email, Visibility, VisibilityOff, ArrowForward } from "@mui/icons-material";
import { styled } from "@mui/system";

// Стилизованные компоненты
const GradientBox = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    padding: 0, // Убрали отступы
    margin: 0,  // Убрали отступы
}));

const AuthCard = styled(Paper)(({ theme }) => ({
    borderRadius: 0, // Убрали скругления
    boxShadow: 'none', // Убрали тень
    width: '100%', // Занимает всю ширину
    maxWidth: '100%', // Занимает всю ширину
    height: '100vh', // Занимает всю высоту
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'auto',
    [theme.breakpoints.up('sm')]: {
        borderRadius: 20, // Скругления только для десктопа
        boxShadow: '0 15px 35px rgba(0,0,0,0.2)', // Тень только для десктопа
        height: 'auto', // Автоматическая высота для десктопа
        maxWidth: 500, // Максимальная ширина для десктопа
        padding: theme.spacing(5),
    },
    '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 5,
        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    }
}));

const AnimatedIcon = styled(Box)({
    animation: 'pulse 2s infinite',
    '@keyframes pulse': {
        '0%': { transform: 'scale(1)' },
        '50%': { transform: 'scale(1.1)' },
        '100%': { transform: 'scale(1)' },
    }
});

export default function SignIn() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "error" | "success";
    }>({ open: false, message: "", severity: "error" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setSnackbar({
                open: true,
                message: "Все поля обязательны",
                severity: "error",
            });
            return;
        }

        // Простая валидация email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setSnackbar({
                open: true,
                message: "Пожалуйста, введите корректный email",
                severity: "error",
            });
            return;
        }

        setLoading(true);
        try {
            await login({ email, password });
            setSnackbar({
                open: true,
                message: "Вход выполнен успешно!",
                severity: "success",
            });
            setTimeout(() => navigate("/profile", { replace: true }), 1000);
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.message || "Ошибка входа. Проверьте данные",
                severity: "error",
            });
            setLoading(false);
        }
    };

    return (
        <GradientBox sx={{ padding: 0 }}>
            <Fade in={true} timeout={800}>
                <Container maxWidth="sm">
                    <AuthCard elevation={6}>
                        <Box textAlign="center" mb={4}>
                            <AnimatedIcon>
                                <Lock
                                    sx={{
                                        fontSize: 64,
                                        color: theme.palette.primary.main,
                                        background: 'rgba(255,255,255,0.9)',
                                        borderRadius: '50%',
                                        padding: 2,
                                        boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                                    }}
                                />
                            </AnimatedIcon>
                            <Typography
                                variant="h4"
                                component="h1"
                                sx={{
                                    fontWeight: 700,
                                    mt: 2,
                                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}
                            >
                                Вход в систему
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                                Введите свои данные для доступа к аккаунту
                            </Typography>
                        </Box>

                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            sx={{ display: "grid", gap: 3 }}
                        >
                            <TextField
                                label="Email"
                                type="email"
                                fullWidth
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '& fieldset': {
                                            borderColor: 'divider',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderWidth: 2,
                                            borderColor: 'primary.main',
                                        },
                                    },
                                }}
                            />

                            <TextField
                                label="Пароль"
                                type={showPassword ? "text" : "password"}
                                fullWidth
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock color="primary" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '& fieldset': {
                                            borderColor: 'divider',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderWidth: 2,
                                            borderColor: 'primary.main',
                                        },
                                    },
                                }}
                            />

                            <LoadingButton
                                type="submit"
                                variant="contained"
                                fullWidth
                                loading={loading}
                                endIcon={<ArrowForward />}
                                sx={{
                                    py: 1.8,
                                    borderRadius: 2,
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                                    },
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                Войти
                            </LoadingButton>
                        </Box>

                        <Grid container justifyContent="space-between" sx={{ mt: 4 }}>
                            <Grid>
                                <Typography variant="body2" color="text.secondary">
                                    Нет аккаунта?
                                </Typography>
                            </Grid>
                            <Grid>
                                <Button
                                    component={RouterLink}
                                    to="/signup"
                                    variant="outlined"
                                    color="primary"
                                    endIcon={<ArrowForward />}
                                    sx={{
                                        fontWeight: 600,
                                        borderRadius: 2,
                                        px: 3,
                                        py: 1,
                                        borderWidth: 2,
                                        '&:hover': {
                                            borderWidth: 2,
                                            background: 'rgba(25, 118, 210, 0.04)'
                                        }
                                    }}
                                >
                                    Регистрация
                                </Button>
                            </Grid>
                        </Grid>
                    </AuthCard>
                </Container>
            </Fade>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                    sx={{
                        borderRadius: 2,
                        boxShadow: 3,
                        fontWeight: 500,
                        minWidth: 300,
                        '& .MuiAlert-icon': {
                            fontSize: 30
                        }
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </GradientBox>
    );
}