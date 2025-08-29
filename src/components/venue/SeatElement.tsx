import React from 'react';
import { Seat } from '../../lib/types';
import { SEAT_STATUS_CONFIG } from '../../lib/constants/venue';

interface SeatElementProps {
  seat: Seat;
  sectionId: string;
  rowIndex: number;
  onSeatClick: (seatId: string, sectionId: string, rowIndex: number, col: number) => void;
  isSelected: boolean;
  absoluteX: number;
  absoluteY: number;
  isAtSelectionLimit: boolean;
}

/**
 * Component for rendering individual seat elements in SVG
 * No React.memo - props change frequently (isSelected, isAtSelectionLimit)
 * and memo overhead > benefit for 500+ seats
 */
export function SeatElement({ 
  seat, 
  sectionId, 
  rowIndex, 
  onSeatClick, 
  isSelected, 
  absoluteX, 
  absoluteY, 
  isAtSelectionLimit 
}: SeatElementProps) {
  
  const getSeatSymbol = (): string => {
    if (seat.status === 'available') {
      return isSelected ? SEAT_STATUS_CONFIG.selected.symbol : SEAT_STATUS_CONFIG.available.symbol;
    }
    return SEAT_STATUS_CONFIG[seat.status as keyof typeof SEAT_STATUS_CONFIG]?.symbol || SEAT_STATUS_CONFIG.available.symbol;
  };

  const isClickable = seat.status === 'available';
  const isDisabled = !isSelected && isAtSelectionLimit;
  const cursor = isClickable && !isDisabled ? 'pointer' : 'not-allowed';

  const handleClick = (): void => {
    if (isClickable && !isDisabled) {
      onSeatClick(seat.id, sectionId, rowIndex, seat.col);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<SVGUseElement>): void => {
    if (!isClickable || isDisabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSeatClick(seat.id, sectionId, rowIndex, seat.col);
    }
  };

  const ariaLabel = `Seat ${seat.col} in row ${rowIndex} of section ${sectionId}${
    !isClickable ? ` - ${seat.status}` : isDisabled ? ' - Maximum seats reached' : ''
  }`;

  return (
    <use
      href={`#${getSeatSymbol()}`}
      x={absoluteX - 12}
      y={absoluteY - 12}
      width="24"
      height="24"
      style={{ cursor }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={isClickable && !isDisabled ? 0 : -1}
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      aria-disabled={!isClickable || isDisabled}
      data-seat-status={seat.status}
      focusable={isClickable && !isDisabled ? 'true' : undefined}
    />
  );
}
