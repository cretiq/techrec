import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProgressIndicator } from './ProgressIndicator';

describe('ProgressIndicator', () => {
  it('renders the progress bar by default', () => {
    render(<ProgressIndicator value={60} />);
    // shadcn Progress uses role="progressbar"
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '60');
  });

  it('renders the progress bar explicitly when type is bar', () => {
    render(<ProgressIndicator value={70} type="bar" />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '70');
  });

  it('renders placeholder text when type is circle', () => {
    render(<ProgressIndicator value={80} type="circle" />);
    expect(screen.getByText(/Circle progress \(value: 80%\) - TBD/i)).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('renders with default value 0', () => {
    render(<ProgressIndicator />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
  });
}); 