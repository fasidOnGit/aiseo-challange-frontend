import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  useTheme, 
  useMediaQuery 
} from '@mui/material';
import { Venue } from '../../lib/types';

interface VenueHeaderProps {
  venue: Venue;
}

export function VenueHeader({ venue }: VenueHeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const totalSeats = venue.sections.reduce((total, section) => 
    total + section.rows.reduce((rowTotal, row) => rowTotal + row.seats.length, 0), 0
  );

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        borderRadius: 0,
        borderBottom: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.paper
      }}
      role="banner"
      aria-label="Venue header information"
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ py: { xs: 2, sm: 3 } }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 2, sm: 0 }
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant={isMobile ? "h4" : "h3"} 
                fontWeight="bold" 
                color="text.primary" 
                gutterBottom
                sx={{ fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}
              >
                {venue.name}
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Interactive Seating Chart
              </Typography>
            </Box>
            <Box sx={{ 
              textAlign: { xs: 'left', sm: 'right' },
              alignSelf: { xs: 'flex-start', sm: 'flex-end' }
            }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Total Seats
              </Typography>
              <Typography 
                variant={isMobile ? "h4" : "h3"} 
                fontWeight="bold" 
                color="primary"
                sx={{ fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}
              >
                {totalSeats}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Paper>
  );
}
