import { render, screen } from '@testing-library/react';
import App from './App';
import { AppProvider } from './context/AppContext';

test('renders CampusHub main application', () => {
  render(
    <AppProvider>
      <App />
    </AppProvider>
  );
  const elements = screen.getAllByText(/CampusHub/i);
  expect(elements.length).toBeGreaterThan(0);
});