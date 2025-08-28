import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  useTheme
} from '@mui/material';
import { Venue } from '../../lib/types';
import { findSeatById } from '../../lib/utils/venue';
import { PRICE_TIER_CONFIG } from '../../lib/constants/venue';

interface SelectedSeatsCardProps {
  seatId: string;
  venue: Venue;
  index: number;
}

/**
 * Pure component for rendering individual selected seat cards
 */
export const SelectedSeatsCard = React.memo(function SelectedSeatsCard({ 
  seatId, 
  venue, 
  index 
}: SelectedSeatsCardProps) {
  const theme = useTheme();
  const seatData = findSeatById(seatId, venue);
  
  if (!seatData) return null;
  
  const { seat, section, row } = seatData;
  const priceConfig = PRICE_TIER_CONFIG[seat.priceTier as keyof typeof PRICE_TIER_CONFIG] || PRICE_TIER_CONFIG[3];

  return (
    <Box role="gridcell">
      <Card 
        elevation={1}
        sx={{ 
          height: { xs: '70px', sm: '80px' },
          border: `1px solid ${theme.palette.divider}`,
          '&:hover': {
            boxShadow: theme.shadows[2],
            transform: 'translateY(-1px)',
            transition: 'all 0.2s ease-in-out'
          }
        }}
        role="article"
        aria-label={`Selected seat ${seat.col} in row ${row.index} of ${section.label}`}
      >
        <CardContent sx={{ 
          p: { xs: 0.75, sm: 1 }, 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between' 
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Chip
              label={priceConfig.label}
              color={priceConfig.color as 'primary' | 'success' | 'secondary'}
              size="small"
              variant="outlined"
              sx={{ 
                fontSize: { xs: '0.6rem', sm: '0.65rem' }, 
                height: { xs: '16px', sm: '18px' }
              }}
              role="status"
              aria-label={`${priceConfig.label} price tier`}
            />
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' } }}
            >
              {section.label}
            </Typography>
          </Box>
          
          <Typography 
            variant="body2" 
            fontWeight="bold" 
            color="text.primary" 
            sx={{ 
              textAlign: 'center', 
              fontSize: { xs: '0.7rem', sm: '0.8rem' }
            }}
          >
            Row {row.index}, Seat {seat.col}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' } }}
            >
              {seat.id}
            </Typography>
            <Typography 
              variant="body2" 
              fontWeight="bold" 
              color="primary" 
              sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
            >
              ${priceConfig.price}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
});
