// src/main.tsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

// Светлая и тёмная тема
import { createTheme } from "@mui/material/styles";

const AppWithProviders = () => {
    const { mode } = useTheme();
    const [muiTheme, setMuiTheme] = useState(() => createTheme({ palette: { mode } }));

    useEffect(() => {
        setMuiTheme(createTheme({ palette: { mode } }));
    }, [mode]);

    return (
        <MuiThemeProvider theme={muiTheme}>
            <CssBaseline />
            <App />
        </MuiThemeProvider>
    );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <ThemeProvider>
                    <AppWithProviders />
                </ThemeProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);