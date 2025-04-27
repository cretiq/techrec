import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AnalysisResultCard } from './AnalysisResultCard';

describe('AnalysisResultCard', () => {
  it('renders the title', () => {
    render(<AnalysisResultCard title="Test Title" />);
    expect(screen.getByRole('heading', { name: /test title/i })).toBeInTheDocument();
  });

  it('renders children when provided', () => {
    render(
      <AnalysisResultCard title="Test Title">
        <p>Child Content</p>
      </AnalysisResultCard>
    );
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('renders placeholder text when no children are provided', () => {
    render(<AnalysisResultCard title="Test Title" />);
    expect(screen.getByText('No content yet.')).toBeInTheDocument();
  });
}); 