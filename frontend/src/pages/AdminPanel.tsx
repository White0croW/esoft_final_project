import React, { useState } from "react";
import {
    Box,
    Tab,
    Tabs,
    Typography,
    Paper,
} from "@mui/material";
import ServicesPage from "./Services";
import Barbers from "./Barbers";
import Appointments from "./Appointments";

export default function AdminPanel() {
    const [tab, setTab] = useState(0);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Админ-панель
            </Typography>

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label="Услуги" />
                <Tab label="Мастера" />
                <Tab label="Записи" />
            </Tabs>

            <Paper sx={{ p: 2 }}>
                {tab === 0 && <ServicesPage />}
                {tab === 1 && <Barbers />}
                {tab === 2 && <Appointments />}
            </Paper>
        </Box>
    );
}
