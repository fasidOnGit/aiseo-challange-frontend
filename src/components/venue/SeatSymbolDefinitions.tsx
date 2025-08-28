import React from 'react';
import { useTheme } from '@mui/material';

/**
 * Pure component for SVG seat symbol definitions
 */
export const SeatSymbolDefinitions = React.memo(function SeatSymbolDefinitions() {
  const theme = useTheme();

  return (
    <defs>
      <style>
        {`
          .venue-text {
            font-family: system-ui, -apple-system, sans-serif;
            font-weight: 600;
            font-size: 14px;
            fill: #374151;
          }
          .venue-row-text {
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 12px;
            font-weight: 500;
            fill: #6b7280;
          }
        `}
      </style>
      
      <symbol id="seat-available" viewBox="0 0 24 24">
        <rect
          x="2"
          y="2"
          width="20"
          height="20"
          rx="4"
          fill="white"
          stroke={theme.palette.success.main}
          strokeWidth="2"
        />
      </symbol>
      
      <symbol id="seat-selected" viewBox="0 0 24 24">
        <rect
          x="2"
          y="2"
          width="20"
          height="20"
          rx="4"
          fill={theme.palette.success.main}
          stroke={theme.palette.success.main}
          strokeWidth="2"
        />
        <circle cx="12" cy="12" r="4" fill="white" opacity="0.9"/>
      </symbol>
      
      <symbol id="seat-reserved" viewBox="0 0 24 24">
        <rect
          x="2"
          y="2"
          width="20"
          height="20"
          rx="4"
          fill={theme.palette.warning.main}
          stroke={theme.palette.warning.main}
          strokeWidth="2"
        />
      </symbol>
      
      <symbol id="seat-sold" viewBox="0 0 24 24">
        <rect
          x="2"
          y="2"
          width="20"
          height="20"
          rx="4"
          fill={theme.palette.error.main}
          stroke={theme.palette.error.main}
          strokeWidth="2"
        />
      </symbol>
      
      <symbol id="seat-held" viewBox="0 0 24 24">
        <rect
          x="2"
          y="2"
          width="20"
          height="20"
          rx="4"
          fill={theme.palette.secondary.main}
          stroke={theme.palette.secondary.main}
          strokeWidth="2"
        />
      </symbol>
    </defs>
  );
});
