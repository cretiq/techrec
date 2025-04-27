import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Navigation } from './Navigation';

describe('Navigation Placeholder', () => {
  it('renders placeholder for tabs type', () => {
    render(<Navigation type="tabs" />);
    expect(screen.getByText(/Navigation Placeholder \(Type: tabs\)/i)).toBeInTheDocument();
  });

  it('renders placeholder for breadcrumbs type', () => {
    render(<Navigation type="breadcrumbs" />);
    expect(screen.getByText(/Navigation Placeholder \(Type: breadcrumbs\)/i)).toBeInTheDocument();
  });

  it('renders placeholder for section-links type', () => {
    render(<Navigation type="section-links" />);
    expect(screen.getByText(/Navigation Placeholder \(Type: section-links\)/i)).toBeInTheDocument();
  });
}); 