import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ players: [], scores: [] }),
    })
  );
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders app header', async () => {
  render(<App />);
  expect(await screen.findByText(/StrikeTracker/i)).toBeInTheDocument();
});
