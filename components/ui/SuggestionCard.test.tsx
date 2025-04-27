import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SuggestionCard } from './SuggestionCard';

describe('SuggestionCard', () => {
  const props = {
    title: 'Suggestion Title',
    description: 'Suggestion description here.',
  };

  it('renders the title and description', () => {
    render(<SuggestionCard {...props} />);
    expect(screen.getByRole('heading', { name: props.title })).toBeInTheDocument();
    expect(screen.getByText(props.description)).toBeInTheDocument();
  });

  it('renders placeholder content and action buttons', () => {
    render(<SuggestionCard {...props} />);
    expect(screen.getByText('Details go here...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument();
  });
}); 