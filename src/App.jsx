import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import theme from './theme/theme';
import MainLayout from './components/MainLayout';
import { useApp } from './context/AppContext';

import Auth from './screens/Auth';
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

export default function App() {
  const { currentUser, authLoading } = useApp();
  const [currentScreen, setCurrentScreen] = useState('dashboard');

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

  // THIS is the fix: no logged-in user -> show the Auth (login/register) screen.
  // Previously App.jsx never checked currentUser at all, so Auth.jsx was built but never rendered.
  if (!currentUser) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Auth onLogin={() => setCurrentScreen('dashboard')} />
      </ThemeProvider>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentScreen} />;
      case 'lost-found': return <LostFound />;
      case 'marketplace': return <Marketplace />;
      case 'skills': return <Skills />;
      case 'events': return <Events />;
      case 'notes': return <Notes />;
      case 'notifications': return <Notifications />;
      case 'profile': return <Profile />;
      case 'settings': return <Settings />;
      case 'admin': return <Admin />;
      default: return <Dashboard onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MainLayout currentScreen={currentScreen} onNavigate={setCurrentScreen}>
        {renderScreen()}
      </MainLayout>
    </ThemeProvider>
  );
}