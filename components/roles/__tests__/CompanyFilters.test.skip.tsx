/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AdvancedFilters from '../AdvancedFilters'

// Mock dependencies
jest.mock('react-redux', () => ({
  useSelector: jest.fn(() => ({})),
  useDispatch: jest.fn(() => jest.fn()),
}))

describe('Enhanced Company Filtering', () => {
  const mockProps = {
    onFiltersChange: jest.fn(),
    onSearch: jest.fn(),
    loading: false,
    disabled: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders company description filter input', () => {
    render(<AdvancedFilters {...mockProps} />)
    
    const companyDescInput = screen.getByTestId('advanced-filters-input-company-description')
    expect(companyDescInput).toBeInTheDocument()
    expect(companyDescInput).toHaveAttribute('placeholder', expect.stringContaining('artificial intelligence'))
  })

  it('renders company specialties filter input', () => {
    render(<AdvancedFilters {...mockProps} />)
    
    const specialtiesInput = screen.getByTestId('advanced-filters-input-company-specialties')
    expect(specialtiesInput).toBeInTheDocument()
    expect(specialtiesInput).toHaveAttribute('placeholder', expect.stringContaining('Machine Learning'))
  })

  it('renders company name filter input', () => {
    render(<AdvancedFilters {...mockProps} />)
    
    const companyNameInput = screen.getByTestId('advanced-filters-input-company-name')
    expect(companyNameInput).toBeInTheDocument()
    expect(companyNameInput).toHaveAttribute('placeholder', expect.stringContaining('google, microsoft'))
  })

  it('renders industry filter input', () => {
    render(<AdvancedFilters {...mockProps} />)
    
    const industryInput = screen.getByTestId('advanced-filters-input-industry')
    expect(industryInput).toBeInTheDocument()
    expect(industryInput).toHaveAttribute('placeholder', expect.stringContaining('Computer Software'))
  })

  it('calls onFiltersChange when company description is entered', () => {
    render(<AdvancedFilters {...mockProps} />)
    
    const companyDescInput = screen.getByTestId('advanced-filters-input-company-description')
    fireEvent.change(companyDescInput, { target: { value: 'artificial intelligence' } })
    
    expect(mockProps.onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        organization_description_filter: 'artificial intelligence'
      })
    )
  })

  it('calls onFiltersChange when industry is entered', () => {
    render(<AdvancedFilters {...mockProps} />)
    
    const industryInput = screen.getByTestId('advanced-filters-input-industry')
    fireEvent.change(industryInput, { target: { value: 'Computer Software' } })
    
    expect(mockProps.onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        industry_filter: 'Computer Software'
      })
    )
  })
})