// src/theme.ts
import { createTheme } from "@mui/material/styles";

export const getTheme = (mode: "light" | "dark") =>
    createTheme({
        palette: {
            mode,
            ...(mode === "dark"
                ? {
                    background: { default: "#121212", paper: "#1e1e1e" },
                    text: { primary: "#fff" },
                }
                : {}),
        },
        typography: {
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            h4: {
                fontWeight: 700,
            },
            h5: {
                fontWeight: 600,
            },
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        fontWeight: 600,
                        textTransform: 'none',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        '&:hover': {
                            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                        }
                    },
                    containedPrimary: {
                        background: 'linear-gradient(45deg, #1a2a6c 30%, #b21f1f 90%)',
                    }
                }
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    }
                }
            }
        }
    });