// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getServices, getAppointments } from "../api/appointment";
import { Grid, Paper, Typography, Box } from "@mui/material";

export default function Dashboard() {
    const { token } = useAuth();
    const [svcCount, setSvcCount] = useState(0);
    const [appCount, setAppCount] = useState(0);

    useEffect(() => {
        if (!token) return;
        getServices(token).then(r => setSvcCount(r.data.length));
        getAppointments(token).then(r => setAppCount(r.data.length));
    }, [token]);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Добро пожаловать!
            </Typography>
            <Grid container spacing={3}>
                <Grid >
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Услуг в каталоге</Typography>
                        <Typography variant="h3" color="primary">
                            {svcCount}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid >
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Ваших записей</Typography>
                        <Typography variant="h3" color="secondary">
                            {appCount}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
