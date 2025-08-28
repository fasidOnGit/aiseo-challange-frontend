import React from 'react';
import { useTheme } from '@mui/material';
import { Venue } from '../../lib/types';
import { getSectionColor, getSectionBorderColor, calculateSectionDimensions } from '../../lib/utils/venue';

interface SectionBackgroundProps {
  section: Venue['sections'][0];
}

/**
 * Pure component for rendering section backgrounds and labels
 */
export const SectionBackground = React.memo(function SectionBackground({ section }: SectionBackgroundProps) {
  const theme = useTheme();
  const transform = section.transform;
  const { sectionWidth, sectionHeight } = calculateSectionDimensions(section);
  const priceTier = section.rows[0]?.seats[0]?.priceTier || 3;

  return (
    <g role="group" aria-label={`${section.label} section`}>
      {/* Section background */}
      <rect
        x={transform.x - 30}
        y={transform.y - 30}
        width={sectionWidth}
        height={sectionHeight}
        fill={getSectionColor(priceTier, theme)}
        stroke={getSectionBorderColor(priceTier, theme)}
        strokeWidth="2"
        rx="8"
        role="presentation"
        aria-hidden="true"
      />
      
      {/* Section label */}
      <text
        x={transform.x + sectionWidth / 2}
        y={transform.y - 15}
        textAnchor="middle"
        className="venue-text"
        fill={theme.palette.text.primary}
        fontSize="14"
        fontWeight="600"
        role="text"
        aria-label={`Section ${section.label}`}
      >
        {section.label}
      </text>
    </g>
  );
});
