import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Button, 
  useTheme, 
  useMediaQuery 
} from '@mui/material';
import { EventSeat as EventSeatIcon, Refresh as RefreshIcon } from '@mui/icons-material';

interface ErrorStateProps {
  error: Error;
  onRetry: () => void;
  title?: string;
}

export function ErrorState({ 
  error, 
  onRetry, 
  title = "Failed to Load Venue" 
}: ErrorStateProps) {
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
      aria-label="Error loading venue"
      aria-live="assertive"
    >
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 3, sm: 4 }, 
            textAlign: 'center',
            borderRadius: 3,
            background: theme.palette.background.paper
          }}
        >
          <EventSeatIcon 
            sx={{ 
              fontSize: { xs: 48, sm: 64 }, 
              color: theme.palette.error.main, 
              mb: { xs: 1.5, sm: 2 } 
            }} 
            aria-hidden="true"
          />
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            fontWeight="bold" 
            color="error" 
            gutterBottom
          >
            {title}
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ mb: { xs: 2, sm: 3 } }}
          >
            {error.message || 'An error occurred while loading the venue data.'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
            sx={{ borderRadius: 2 }}
            aria-label="Retry loading venue data"
          >
            Try Again
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
