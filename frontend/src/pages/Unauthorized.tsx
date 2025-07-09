// src/pages/Unauthorized.tsx
import React from "react";
import { Container, Paper, Typography } from "@mui/material";

export default function Unauthorized() {
    return (
        <Container maxWidth="sm" sx={{ mt: 16 }}>
            <Paper sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h4" gutterBottom>
                    Доступ запрещён
                </Typography>
                <Typography variant="body1">
                    У вас недостаточно прав для просмотра этой страницы.
                </Typography>
            </Paper>
        </Container>
    );
}
