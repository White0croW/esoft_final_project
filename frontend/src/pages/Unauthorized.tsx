import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Paper, Typography, Button } from "@mui/material";

export default function Unauthorized() {
    const nav = useNavigate();

    return (
        <Container maxWidth="sm" sx={{ mt: 16 }}>
            <Paper sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h4" gutterBottom>
                    Доступ запрещён
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                    У вас недостаточно прав для просмотра этой страницы.
                </Typography>
                <Button variant="contained" onClick={() => nav(-1)}>
                    Назад
                </Button>
            </Paper>
        </Container>
    );
}
