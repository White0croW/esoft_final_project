import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getServices, getAppointments } from "../api/appointment";
import {
    Grid,
    Paper,
    Typography,
    Box,
    CircularProgress,
} from "@mui/material";

export default function Dashboard() {
    const { token, user } = useAuth();
    const [svcCount, setSvcCount] = useState<number | null>(null);
    const [appCount, setAppCount] = useState<number | null>(null);

    useEffect(() => {
        if (!token) return;

        getServices(token)
            .then(r => setSvcCount(r.data.length))
            .catch(() => setSvcCount(0));

        getAppointments(token)
            .then(r => setAppCount(r.data.length))
            .catch(() => setAppCount(0));
    }, [token]);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Добро пожаловать{user?.role === "admin" ? ", админ" : ""}!
            </Typography>

            <Grid container spacing={3}>
                <Grid>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Услуг в каталоге</Typography>
                        <Typography variant="h3" color="primary">
                            {svcCount === null ? <CircularProgress size={24} /> : svcCount}
                        </Typography>
                    </Paper>
                </Grid>

                <Grid>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">
                            {user?.role === "admin" ? "Всего записей" : "Ваших записей"}
                        </Typography>
                        <Typography variant="h3" color="secondary">
                            {appCount === null ? <CircularProgress size={24} /> : appCount}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
