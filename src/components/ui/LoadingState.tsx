import { Box, CircularProgress, Typography, useTheme, useMediaQuery } from '@mui/material';

interface LoadingStateProps {
  message?: string;
  description?: string;
}

export function LoadingState({ 
  message = "Loading Venue", 
  description = "Preparing your seating experience..." 
}: LoadingStateProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.background.default}, ${theme.palette.background.paper})`
      }}
      role="main"
      aria-label="Loading venue data"
      aria-live="polite"
    >
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress 
          size={isMobile ? 48 : 64} 
          color="primary" 
          sx={{ mb: { xs: 2, sm: 3 } }} 
          aria-label="Loading indicator" 
        />
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          fontWeight="bold" 
          color="text.primary" 
          gutterBottom
        >
          {message}
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          {description}
        </Typography>
      </Box>
    </Box>
  );
}
