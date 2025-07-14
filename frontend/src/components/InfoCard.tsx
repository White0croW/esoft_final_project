// src/components/InfoCard.tsx
import { Card, CardContent, Avatar, Typography, Box } from '@mui/material';

interface InfoCardProps {
    title: string;
    subtitle: string;
    image: string;
}

export const InfoCard = ({ title, subtitle, image }: InfoCardProps) => (
    <Card>
        <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
                <Avatar src={image} sx={{ width: 64, height: 64 }} />
                <Box>
                    <Typography variant="h6">{title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {subtitle}
                    </Typography>
                </Box>
            </Box>
        </CardContent>
    </Card>
);