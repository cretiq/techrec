'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {  Input  } from '@/components/ui-daisy/input';
import {  Select  } from '@/components/ui-daisy/select';
import { AnalysisStatus } from '@prisma/client'; // Import enum for dropdown values
import { debounce } from 'lodash'; // For debouncing search input

interface SearchFiltersProps {
  onFilterChange: (filters: { search?: string; status?: AnalysisStatus }) => void;
}

export function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<AnalysisStatus | 'all'>('all');

  // Debounced function to call onFilterChange
  const debouncedFilterChange = useCallback(
    debounce((currentSearchTerm: string, currentStatus: AnalysisStatus | 'all') => {
      const filters: { search?: string; status?: AnalysisStatus } = {};
      if (currentSearchTerm.trim()) {
        filters.search = currentSearchTerm.trim();
      }
      if (currentStatus !== 'all') {
        filters.status = currentStatus;
      }
      onFilterChange(filters);
    }, 300), // 300ms debounce delay
    [onFilterChange] // Dependency array
  );

  // Effect to trigger debounced function when searchTerm or selectedStatus changes
  useEffect(() => {
    debouncedFilterChange(searchTerm, selectedStatus);
    // Cleanup function to cancel the debounce on unmount or dependency change
    return () => {
      debouncedFilterChange.cancel();
    };
  }, [searchTerm, selectedStatus, debouncedFilterChange]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusChange = (value: string) => {
     // The value from Select will be a string, potentially "all" or a AnalysisStatus enum key
    setSelectedStatus(value as AnalysisStatus | 'all');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4 p-4 border rounded-lg" data-testid="cv-management-search-filters-container">
      <div className="flex-1" data-testid="cv-management-search-input-container">
        <Input
          type="text"
          placeholder="Search by filename..."
          value={searchTerm}
          onChange={handleSearchChange}
          data-testid="cv-management-search-input"
        />
      </div>
      <div className="w-full sm:w-48" data-testid="cv-management-status-filter-container">
        <Select 
          value={selectedStatus} 
          onChange={(e) => handleStatusChange(e.target.value)}
          data-testid="cv-management-status-filter-select"
        >
          <option value="all" data-testid="cv-management-status-option-all">All Statuses</option>
          {Object.values(AnalysisStatus).map((status) => (
            <option key={status} value={status} data-testid={`cv-management-status-option-${status.toLowerCase()}`}>
              {status}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
} 