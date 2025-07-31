import React, { useState } from 'react';
import {  Card, CardContent, CardHeader, CardTitle  } from '@/components/ui-daisy/card';
import { Textarea } from "@/components/ui-daisy/textarea";
import {  Button  } from '@/components/ui-daisy/button'; 
import { Edit, Save, X } from 'lucide-react';
import { AIAssistanceButton } from '@/components/analysis/AIAssistanceButton';
import { useHighlightClasses } from '@/utils/suggestionHighlight';

// Import suggestion-related types and components
import { CvImprovementSuggestion } from '@/types/cv';
// Remove Highlight/Indicator imports
// import { SuggestionHighlight } from '@/components/suggestions/SuggestionHighlight';
// import { SuggestionIndicator } from '@/components/suggestions/SuggestionIndicator';
// Removed InlineSuggestion - using SuggestionManager instead

interface AboutProps {
  data: string | null | undefined;
  onChange: (updatedAbout: string | null) => void;
  suggestions?: CvImprovementSuggestion[]; // Use the specific type
  onAcceptSuggestion?: (suggestion: CvImprovementSuggestion) => void;
  onRejectSuggestion?: (suggestion: CvImprovementSuggestion) => void;
}

// Helper function to find suggestions for a specific path
const findSuggestionsForPath = (
  suggestions: CvImprovementSuggestion[] | undefined,
  path: string
): CvImprovementSuggestion[] => {
  if (!suggestions) return [];
  // Ensure exact path match for this simple field
  return suggestions.filter(s => s.section === path);
};

export function AboutDisplay({ 
  data, 
  onChange, 
  suggestions, 
  onAcceptSuggestion,
  onRejectSuggestion
}: AboutProps) {
  console.log('[AboutDisplay] Rendering with data (length):', data?.length);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<string>(data || '');
  const highlightClasses = useHighlightClasses('about');

  React.useEffect(() => {
    setEditData(data || '');
  }, [data]);

  // Define the specific path for this component
  const sectionPath = 'about';
  const aboutSuggestions = findSuggestionsForPath(suggestions, sectionPath);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setEditData(newValue);
    onChange(newValue || null);
  };

  const handleSave = async () => {
    console.log("Confirming about edits (locally)...", editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    const originalData = data || '';
    setEditData(originalData);
    onChange(originalData || null); 
    setIsEditing(false);
  };

  // Check if there is content to display (either actual data or suggestions)
  const hasContent = !!editData || aboutSuggestions.length > 0;

  // If not editing and no content to display, render nothing (or a placeholder)
  if (!isEditing && !hasContent) {
    // Return an empty fragment or a subtle placeholder if needed
    return <></>; 
    // Or potentially: return <p className=\"text-sm text-muted-foreground\">(No summary provided)</p>;
  }

  return (
    <>
        {isEditing ? (
          <Textarea
            value={editData}
            onChange={handleTextChange}
            placeholder="Enter summary or about section..."
            className="min-h-[100px] text-sm"
          />
        ) : (
          <p className={`text-sm whitespace-pre-wrap p-2 rounded-md ${highlightClasses}`}>
            {editData}
          </p>
        )}

      {/* Inline suggestions removed - using SuggestionManager instead */}
    </>
  );
}
 