// src/components/ServiceCard.tsx
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import { Schedule, MonetizationOn } from '@mui/icons-material';

interface ServiceCardProps {
    service: {
        id: number;
        name: string;
        duration: number;
        price: number;
    };
    selected: boolean;
    onClick: () => void;
}

export const ServiceCard = ({ service, selected, onClick }: ServiceCardProps) => (
    <Card
        onClick={onClick}
        sx={{
            cursor: 'pointer',
            border: selected ? 2 : 0,
            borderColor: selected ? 'primary.main' : 'transparent',
            boxShadow: selected ? 3 : 1,
            transition: 'all 0.2s ease',
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 2
            }
        }}
    >
        <CardContent>
            <Typography variant="h6" gutterBottom>{service.name}</Typography>
            <Box display="flex" justifyContent="space-between">
                <Chip
                    icon={<Schedule fontSize="small" />}
                    label={`${service.duration} мин`}
                    size="small"
                />
                <Chip
                    icon={<MonetizationOn fontSize="small" />}
                    label={`${service.price} ₽`}
                    size="small"
                    color="primary"
                />
            </Box>
        </CardContent>
    </Card>
);