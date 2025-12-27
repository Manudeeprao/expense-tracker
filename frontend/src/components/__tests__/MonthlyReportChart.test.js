import React from 'react';
import { render, screen } from '@testing-library/react';
import MonthlyReportChart from '../MonthlyReportChart';

describe('MonthlyReportChart', () => {
  it('renders total and categories', () => {
    const report = {
      totalExpenses: 200,
      categoryTotals: { Food: 120, Rent: 80 }
    };

    render(<MonthlyReportChart report={report} month={9} year={2025} />);

    // Total expense
    expect(screen.getByText(/Total expenses/i)).toBeInTheDocument();
    expect(screen.getByText('$200.00')).toBeInTheDocument();

    // Categories
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Rent')).toBeInTheDocument();
  });
});
