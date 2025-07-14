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
    Grid,
    Checkbox,
    FormControlLabel
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
    Person,
    Email,
    Lock,
    Visibility,
    VisibilityOff,
    ArrowForward,
    HowToReg
} from "@mui/icons-material";
import { styled } from "@mui/system";

// Стилизованные компоненты
const GradientBox = styled(Box)({
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
});

const AuthCard = styled(Paper)(({ theme }) => ({
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    borderRadius: 0,
    boxShadow: 'none',
    padding: theme.spacing(3),
    position: 'relative',
    overflow: 'auto',

    [theme.breakpoints.up('sm')]: {
        height: 'auto',
        maxWidth: 500,
        borderRadius: 20,
        boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
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

export default function SignUp() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "error" | "success";
    }>({ open: false, message: "", severity: "error" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !password || !password2) {
            setSnackbar({
                open: true,
                message: "Все поля обязательны",
                severity: "error",
            });
            return;
        }


        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setSnackbar({
                open: true,
                message: "Пожалуйста, введите корректный email",
                severity: "error",
            });
            return;
        }

        if (password !== password2) {
            setSnackbar({
                open: true,
                message: "Пароли не совпадают",
                severity: "error",
            });
            return;
        }

        if (password.length < 6) {
            setSnackbar({
                open: true,
                message: "Пароль должен содержать минимум 6 символов",
                severity: "error",
            });
            return;
        }

        setLoading(true);
        try {
            await register({ name, email, password });
            setSnackbar({
                open: true,
                message: "Регистрация успешна! Перенаправляем...",
                severity: "success",
            });
            setTimeout(() => navigate("/profile", { replace: true }), 1500);
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.message || "Ошибка регистрации. Возможно, email уже используется",
                severity: "error",
            });
            setLoading(false);
        }
    };

    return (
        <GradientBox sx={{ padding: 0 }}>
            <Fade in={true} timeout={800}>
                <Container maxWidth="sm">
                    <AuthCard elevation={0}>
                        <Box textAlign="center" mb={4}>
                            <AnimatedIcon>
                                <HowToReg
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
                                Создать аккаунт
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                                Заполните форму для регистрации
                            </Typography>
                        </Box>

                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            sx={{ display: "grid", gap: 3 }}
                        >
                            <TextField
                                label="Имя"
                                fullWidth
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Person color="primary" />
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
                                helperText="Минимум 6 символов"
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
                                label="Повторите пароль"
                                type={showPassword2 ? "text" : "password"}
                                fullWidth
                                value={password2}
                                onChange={(e) => setPassword2(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock color="primary" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword2(!showPassword2)}
                                                edge="end"
                                            >
                                                {showPassword2 ? <VisibilityOff /> : <Visibility />}
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
                                endIcon={<HowToReg />}
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
                                Зарегистрироваться
                            </LoadingButton>
                        </Box>

                        <Grid container justifyContent="center" sx={{ mt: 4 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                Уже есть аккаунт?
                            </Typography>
                            <Button
                                component={RouterLink}
                                to="/signin"
                                variant="text"
                                color="primary"
                                endIcon={<ArrowForward />}
                                sx={{
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    px: 1,
                                    py: 0,
                                    '&:hover': {
                                        background: 'rgba(25, 118, 210, 0.04)'
                                    }
                                }}
                            >
                                Войти
                            </Button>
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