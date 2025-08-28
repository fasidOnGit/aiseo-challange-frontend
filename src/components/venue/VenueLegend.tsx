import React from 'react';
import {
  Box,
  Typography,
  useTheme
} from '@mui/material';
import { Venue } from '../../lib/types';
import { getUniquePriceTiers } from '../../lib/utils/venue';
import { PRICE_TIER_CONFIG } from '../../lib/constants/venue';

interface VenueLegendProps {
  venue: Venue;
}

/**
 * Pure component for rendering venue legend with price tiers and seat status
 */
export const VenueLegend = React.memo(function VenueLegend({ venue }: VenueLegendProps) {
  const theme = useTheme();
  const priceTiers = getUniquePriceTiers(venue);

  return (
    <Box
      sx={{
        mt: 2,
        p: { xs: 1, sm: 1.5 },
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        background: theme.palette.background.paper
      }}
      role="region"
      aria-label="Venue legend"
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1.5, sm: 3 },
        alignItems: { xs: 'flex-start', sm: 'center' }
      }}>
        {/* Section Types */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 600, 
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              color: 'text.secondary',
              minWidth: 'fit-content'
            }}
          >
            Sections:
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {priceTiers.map((tier) => {
              const config = PRICE_TIER_CONFIG[tier as keyof typeof PRICE_TIER_CONFIG];
              if (!config) return null;
              
              return (
                <Box
                  key={tier}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 0.75,
                    py: 0.25,
                    border: `1px solid ${theme.palette[config.color].main}`,
                    borderRadius: 0.5,
                    fontSize: { xs: '0.6rem', sm: '0.7rem' }
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      backgroundColor: theme.palette[config.color].main,
                      borderRadius: '50%'
                    }}
                  />
                  <Typography variant="caption" sx={{ fontSize: 'inherit' }}>
                    {config.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Seat Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 600, 
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              color: 'text.secondary',
              minWidth: 'fit-content'
            }}
          >
            Seats:
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {[
              { label: 'Available', color: theme.palette.success.main },
              { label: 'Selected', color: theme.palette.success.main, filled: true },
              { label: 'Reserved', color: theme.palette.warning.main },
              { label: 'Sold', color: theme.palette.error.main }
            ].map((status, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 0.75,
                  py: 0.25,
                  border: `1px solid ${status.color}`,
                  borderRadius: 0.5,
                  fontSize: { xs: '0.6rem', sm: '0.7rem' }
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    backgroundColor: status.filled ? status.color : 'transparent',
                    border: status.filled ? 'none' : `1px solid ${status.color}`,
                    borderRadius: '2px'
                  }}
                />
                <Typography variant="caption" sx={{ fontSize: 'inherit' }}>
                  {status.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
});
