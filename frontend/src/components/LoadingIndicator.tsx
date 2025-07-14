// src/components/LoadingIndicator.tsx
import { Box, CircularProgress } from '@mui/material';

export const LoadingIndicator = () => (
    <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
    </Box>
);