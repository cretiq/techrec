'use client';

import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CvImprovementSuggestion } from '@/types/cv';
import { SuggestionCard } from '@/components/ui-daisy/suggestion-card';
import { RootState, AppDispatch } from '@/lib/store';
import {
  selectSuggestions,
  applySuggestion, 
  dismissSuggestion
} from '@/lib/features/analysisSlice';
import {  Button  } from '@/components/ui-daisy/button';
import {  Input  } from '@/components/ui-daisy/input';
import {  Select, SelectContent, SelectItem, SelectTrigger, SelectValue  } from '@/components/ui-daisy/select';
import { ListFilter, Search } from 'lucide-react';

// Type for suggestion status, managed locally or in Redux UI slice?
// For now, let's assume we track handled suggestions via Redux state implicitly
// (i.e., a suggestion disappears from the main list if handled).

export function SuggestionList() {
  const dispatch: AppDispatch = useDispatch();
  const allSuggestions = useSelector(selectSuggestions); 

  // --- Filtering State --- 
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<CvImprovementSuggestion['suggestionType'] | 'all'>('all');

  // --- Sorting State ---
  const [sortBy, setSortBy] = useState<'default' | 'section' | 'type'>('default'); 

  const handleAccept = (suggestion: CvImprovementSuggestion) => {
    dispatch(applySuggestion(suggestion));
    // Optionally show toast confirmation
  };

  const handleReject = (suggestion: CvImprovementSuggestion) => {
    dispatch(dismissSuggestion(suggestion));
    // Optionally show toast confirmation
  };

  const filteredSuggestions = useMemo(() => {
    let filtered = allSuggestions;

    // Filter out contactInfo suggestions (safety net)
    filtered = filtered.filter(s => s.section !== 'contactInfo');

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(s => s.suggestionType === filterType);
    }

    // Filter by search term (searches section and reasoning)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.section.toLowerCase().includes(lowerSearchTerm) || 
        s.reasoning.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Sorting logic
    if (sortBy === 'section') {
      filtered.sort((a, b) => a.section.localeCompare(b.section));
    } else if (sortBy === 'type') {
      filtered.sort((a, b) => a.suggestionType.localeCompare(b.suggestionType));
    }
    // Default sort is the order received from the store/API

    return filtered;
  }, [allSuggestions, searchTerm, filterType, sortBy]);

  const suggestionTypes: CvImprovementSuggestion['suggestionType'][] = [
    'wording', 'add_content', 'remove_content', 'reorder', 'format'
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">Improvement Suggestions</h3>
      
      {/* Filter and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search"
            placeholder="Search suggestions (section, reasoning)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
        <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}> 
          <SelectTrigger className="w-full sm:w-[180px]">
            <ListFilter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {suggestionTypes.map(type => (
              <SelectItem key={type} value={type} className='capitalize'>
                {type.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            {/* Use a sort icon? */} 
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default Order</SelectItem>
            <SelectItem value="section">Sort by Section</SelectItem>
            <SelectItem value="type">Sort by Type</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Suggestion List */}
      {filteredSuggestions && filteredSuggestions.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredSuggestions.map((suggestion, index) => (
            // Use section + index as key for now, consider unique ID later
            <SuggestionCard 
              key={`${suggestion.section}-${index}`}
              suggestion={suggestion} 
              onAccept={handleAccept} 
              onReject={handleReject} 
              // isHandled will be implicitly true if suggestion is removed from list by Redux action
              // If we keep handled suggestions in the list, we need to derive isHandled from state
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-6">
          {allSuggestions.length === 0 ? 'No suggestions generated yet.' : 'No suggestions match your filters.'}
        </p>
      )}
    </div>
  );
} 