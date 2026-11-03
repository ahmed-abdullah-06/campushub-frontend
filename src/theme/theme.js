import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4F46E5', // Indigo-600
      light: '#6366F1',
      dark: '#4338CA',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0D9488', // Teal-600
      light: '#14B8A6',
      dark: '#0F766E',
    },
    background: {
      default: '#F4F5FA', // Light purple-gray dashboard background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
    },
  },
  // Compact scale: MUI's defaults render quite large on a laptop; these sizes
  // keep everything readable but noticeably denser and "normal".
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    htmlFontSize: 16,
    h1: { fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '2rem' },
    h2: { fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.7rem' },
    h3: { fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '1.45rem' },
    h4: { fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '1.25rem' },
    h5: { fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '1.1rem' },
    h6: { fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '1rem' },
    body1: { fontSize: '0.875rem' },
    body2: { fontSize: '0.8125rem' },
    subtitle1: { fontSize: '0.875rem' },
    subtitle2: { fontSize: '0.8125rem' },
    button: { fontSize: '0.8125rem' },
    caption: { fontSize: '0.6875rem' },
    overline: { fontSize: '0.625rem' },
  },
  shape: {
    borderRadius: 10, // Match rounded UI cards
  },
  components: {
    MuiButton: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 600,
          boxShadow: 'none',
          paddingInline: 14,
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(79, 70, 229, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          border: '1px solid #F3F4F6',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: '20px',
          height: 22,
          fontSize: '0.75rem',
        },
      },
    },
  },
});

export default theme;