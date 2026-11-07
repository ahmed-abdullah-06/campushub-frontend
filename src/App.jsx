import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import theme from './theme/theme';
import MainLayout from './components/MainLayout';
import { useApp } from './context/AppContext';

import Auth from './screens/Auth';
import Landing from './screens/Landing';
import ResetPassword from './screens/ResetPassword';
import Dashboard from './screens/Dashboard';
import LostFound from './screens/LostFound';
import Marketplace from './screens/Marketplace';
import Skills from './screens/Skills';
import Events from './screens/Events';
import Notes from './screens/Notes';
import Notifications from './screens/Notifications';
import Profile from './screens/Profile';
import Settings from './screens/Settings';
import Admin from './screens/Admin';

const SCREENS = [
  'dashboard', 'lost-found', 'marketplace', 'skills', 'events',
  'notes', 'notifications', 'profile', 'settings', 'admin'
];

// Reads "#/marketplace" -> "marketplace" so shared links, bookmarks and the
// browser back/forward buttons all work without pulling in a router.
const screenFromHash = () => {
  const raw = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  return SCREENS.includes(raw) ? raw : 'dashboard';
};

export default function App() {
  const { currentUser, authLoading } = useApp();
  const [currentScreen, setCurrentScreen] = useState(screenFromHash);
  // Logged-out flow: Landing page first, then the Auth card when the visitor
  // picks "Sign In" / "Get Started" (or follows a #/login-style link).
  const [authView, setAuthView] = useState(() => {
    const raw = window.location.hash.replace(/^#\/?/, '').split('?')[0];
    return raw === 'login' || raw === 'register' ? raw : null;
  });
  // #/reset-password?token=... arrives from the emailed password-reset link.
  const [resetToken] = useState(() => {
    if (!window.location.hash.startsWith('#/reset-password')) return null;
    return new URLSearchParams(window.location.hash.split('?')[1] || '').get('token');
  });

  // Keep state and URL in sync in both directions
  useEffect(() => {
    const onHashChange = () => setCurrentScreen(screenFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((screen) => {
    const safe = SCREENS.includes(screen) ? screen : 'dashboard';
    setCurrentScreen(safe);
    const nextHash = `#/${safe === 'dashboard' ? '' : safe}`;
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
  }, []);

  // Still checking localStorage for a saved session — show a loader, not a blank/wrong screen
  if (authLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  // Password-reset screen (from the emailed link) wins over the landing page.
  if (!currentUser && window.location.hash.startsWith('#/reset-password')) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ResetPassword token={resetToken} onDone={() => navigate('dashboard')} />
      </ThemeProvider>
    );
  }

  // No logged-in user -> Landing page, or the Auth card once they opt in.
  if (!currentUser) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {authView ? (
          <Auth
            initialMode={authView === 'register' ? 'register' : 'login'}
            onLogin={() => { setAuthView(null); navigate('dashboard'); }}
            onBack={() => setAuthView(null)}
          />
        ) : (
          <Landing onGetStarted={(mode) => setAuthView(mode === 'register' ? 'register' : 'login')} />
        )}
      </ThemeProvider>
    );
  }

  const isAdmin = currentUser.role === 'admin';

  const renderScreen = () => {
    // A student who lands on (or types) #/admin gets bounced to the dashboard
    const screen = currentScreen === 'admin' && !isAdmin ? 'dashboard' : currentScreen;
    switch (screen) {
      case 'dashboard': return <Dashboard onNavigate={navigate} />;
      case 'lost-found': return <LostFound />;
      case 'marketplace': return <Marketplace />;
      case 'skills': return <Skills />;
      case 'events': return <Events />;
      case 'notes': return <Notes />;
      case 'notifications': return <Notifications />;
      case 'profile': return <Profile />;
      case 'settings': return <Settings />;
      case 'admin': return <Admin />;
      default: return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MainLayout currentScreen={currentScreen} onNavigate={navigate}>
        {renderScreen()}
      </MainLayout>
    </ThemeProvider>
  );
}
