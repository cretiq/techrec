import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Feedback } from './Feedback';

describe('Feedback', () => {
  it('renders the comment textarea and submit button', () => {
    render(<Feedback />);
    expect(screen.getByLabelText(/comment/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit feedback/i })).toBeInTheDocument();
  });

  it('renders the rating placeholder', () => {
    render(<Feedback />);
    expect(screen.getByText(/rating \(TBD\)/i)).toBeInTheDocument();
  });

  it('disables the submit button initially', () => {
    render(<Feedback />);
    expect(screen.getByRole('button', { name: /submit feedback/i })).toBeDisabled();
  });

  it('enables the submit button when a comment is entered', () => {
    render(<Feedback />);
    const textarea = screen.getByLabelText(/comment/i);
    fireEvent.change(textarea, { target: { value: 'This is a comment.' } });
    expect(screen.getByRole('button', { name: /submit feedback/i })).toBeEnabled();
  });

  it('calls onSubmit with the comment when submitted', () => {
    const handleSubmit = jest.fn();
    render(<Feedback onSubmit={handleSubmit} />);
    const textarea = screen.getByLabelText(/comment/i);
    const button = screen.getByRole('button', { name: /submit feedback/i });

    fireEvent.change(textarea, { target: { value: 'Test comment' } });
    fireEvent.click(button);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith('Test comment');
  });

  it('clears the comment after submission', () => {
    const handleSubmit = jest.fn();
    render(<Feedback onSubmit={handleSubmit} />);
    const textarea = screen.getByLabelText(/comment/i);
    const button = screen.getByRole('button', { name: /submit feedback/i });

    fireEvent.change(textarea, { target: { value: 'Another comment' } });
    expect(textarea).toHaveValue('Another comment');

    fireEvent.click(button);

    expect(textarea).toHaveValue('');
    expect(button).toBeDisabled(); // Should be disabled again after clearing
  });
}); 