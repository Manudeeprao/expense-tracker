import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the api module
import api from '../../api/axios';
import MonthlyReport from '../MonthlyReport';

jest.mock('../../api/axios', () => ({
  get: jest.fn()
}));

// Mock useAuth to return a test user
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, email: 'test@example.com' } })
}));

describe('MonthlyReport', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and displays monthly report data', async () => {
    api.get.mockResolvedValueOnce({
      data: { totalExpenses: 100.0, categoryTotals: { Food: 60.0, Rent: 40.0 } }
    });

    render(<MonthlyReport />);

    // Loading state appears
    expect(screen.getByText(/loading report/i)).toBeInTheDocument();

  // Wait for the total to appear from MonthlyReportChart
  const total = await screen.findByText('$100.00');
  expect(total).toBeInTheDocument();

    // Category labels should be visible
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Rent')).toBeInTheDocument();
  });
});
