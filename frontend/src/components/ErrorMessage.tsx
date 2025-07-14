// src/components/ErrorMessage.tsx
import { Box, Alert } from '@mui/material';

export const ErrorMessage = ({ message }: { message: string }) => (
    <Box my={4}>
        <Alert severity="error">{message}</Alert>
    </Box>
);