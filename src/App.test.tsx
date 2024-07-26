import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the app', () => {
  render(<App />);
  const searchLabel = screen.getByText(/Quick search:/i);
  expect(searchLabel).toBeInTheDocument();
});
