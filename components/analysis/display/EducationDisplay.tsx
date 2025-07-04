import React, { useState } from 'react';
import {  Input  } from '@/components/ui-daisy/input';
import {  Button  } from '@/components/ui-daisy/button';
import { Label } from '@/components/ui/label';
import { GraduationCap, MapPin, Calendar, Edit, Save, X, Trash2, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn, formatDateSafe } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Import suggestion-related types and components
import { EducationItem as CvEducationItem, CvImprovementSuggestion } from '@/types/cv';
// Remove old imports
// import { SuggestionHighlight } from '@/components/suggestions/SuggestionHighlight';
// import { SuggestionIndicator } from '@/components/suggestions/SuggestionIndicator';
// Import new component
import { InlineSuggestion } from '@/components/analysis/InlineSuggestion';

interface EducationProps {
  data: CvEducationItem[] | null | undefined;
  onChange: (updatedEducation: CvEducationItem[]) => void;
  suggestions?: CvImprovementSuggestion[];
  onAcceptSuggestion?: (suggestion: CvImprovementSuggestion) => void;
  onRejectSuggestion?: (suggestion: CvImprovementSuggestion) => void;
}

// Use the same date formatter as Experience
const formatDateRange = (start?: string | null, end?: string | null): string => {
  const formatPart = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr + (dateStr.length === 7 ? '-02' : ''));
      const year = date.getFullYear();
      const month = date.toLocaleString('default', { month: 'short' });
      return `${month} ${year}`;
    } catch {
      return dateStr;
    }
  };
  const startFormatted = formatPart(start);
  const endFormatted = end ? formatPart(end) : 'Present';
  const yearOnly = end ? formatPart(end) : start ? formatPart(start) : null; // Use year if available
  if (startFormatted && endFormatted) {
    return `${startFormatted} - ${endFormatted}`.trim().replace(/^-| -$/,'');
  } else if (yearOnly) {
    return yearOnly;
  }
  return '';
};

// Helper function to find suggestions for a specific path
const findSuggestionsForPath = (
  suggestions: CvImprovementSuggestion[] | undefined,
  path: string
): CvImprovementSuggestion[] => {
  if (!suggestions) return [];
  // Use exact match for inline suggestions related to a specific path
  return suggestions.filter(s => s.section === path);
};

// Helper to create path strings
const createPath = (base: string, index: number, field?: string): string => {
  let path = `${base}[${index}]`;
  if (field) path += `.${field}`;
  return path;
};

// Removed RenderWithSuggestion helper component

export function EducationDisplay({ data, onChange, suggestions, onAcceptSuggestion, onRejectSuggestion }: EducationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<CvEducationItem[]>(data || []);

  React.useEffect(() => {
    setEditData(data || []);
  }, [data]);

  const notifyChange = (newData: CvEducationItem[]) => {
    setEditData(newData);
    onChange(newData);
  };

  const handleInputChange = (index: number, field: keyof Omit<CvEducationItem, 'id' | 'isNew'>, value: string | null) => {
    const newData = editData.map((item, i) =>
      i === index ? { ...item, [field]: value || null } : item
    );
    notifyChange(newData);
  };

  const handleAddItem = () => {
    const newItem: CvEducationItem = { id: `temp_edu_${uuidv4()}`, institution: '', isNew: true };
    notifyChange([...editData, newItem]);
  };

  const handleRemoveItem = (indexToRemove: number) => {
    const newData = editData.filter((_, index) => index !== indexToRemove);
    notifyChange(newData);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    const originalData = data || [];
    setEditData(originalData);
    onChange(originalData);
    setIsEditing(false);
  };

  // Function to render suggestions for a given path
  const renderInlineSuggestions = (path: string) => {
    const currentSuggestions = findSuggestionsForPath(suggestions, path);
    if (isEditing || currentSuggestions.length === 0) {
    return null;
  }
    return (
      <AnimatePresence>
        {currentSuggestions.map((suggestion, index) => (
          <InlineSuggestion
            key={`${path}-suggestion-${index}`}
            suggestion={suggestion}
            onAccept={onAcceptSuggestion}
            onReject={onRejectSuggestion}
          />
        ))}
      </AnimatePresence>
    );
  };

  // Animation variants for list items (same as Experience)
  const listItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  if (!isEditing && (!editData || editData.length === 0)) {
    return null;
  }

  return (
    <div>
      <div className="flex justify-end mb-2">
        {isEditing ? (
          <div className="flex gap-1 items-center">
            <Button variant="outline" size="sm" onClick={handleAddItem} className="mr-2 h-7 text-xs"><Plus className="h-3 w-3 mr-1" /> Add Entry</Button>
            <Button variant="ghost" size="icon" onClick={handleCancel} className="h-7 w-7"><X className="h-4 w-4" /></Button>
            <Button variant="default" size="icon" onClick={handleSave} className="h-7 w-7"><Save className="h-4 w-4" /></Button>
          </div>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="h-7 w-7"><Edit className="h-4 w-4" /></Button>
        )}
      </div>

      <div className="space-y-6">
        <AnimatePresence initial={false}>
          {editData.map((edu, index) => (
            <motion.div
              key={edu.id || `edu-${index}`}
              className={`p-6 rounded-lg relative group bg-white/20 dark:bg-black/20 ${edu.isNew ? 'border-dashed border-primary' : ''}`}
              variants={listItemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              {isEditing && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveItem(index)}
                  className="absolute top-1 right-1 h-6 w-6 opacity-50 hover:opacity-100 z-10 bg-background/80 hover:bg-destructive/10 p-0"
                  aria-label="Remove Education Entry"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              )}

              {isEditing ? (
                // EDITING VIEW
                <div className="space-y-2">
                  <Input id={`institution-${index}`} placeholder="Institution Name" value={edu.institution ?? ''} onChange={(e) => handleInputChange(index, 'institution', e.target.value)} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input id={`degree-${index}`} placeholder="Degree (e.g., B.S. Computer Science)" value={edu.degree ?? ''} onChange={(e) => handleInputChange(index, 'degree', e.target.value)} />
                    <Input id={`year-${index}`} placeholder="Year or Date Range" value={edu.year ?? ''} onChange={(e) => handleInputChange(index, 'year', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input id={`location-${index}`} placeholder="Location (City, Country)" value={edu.location ?? ''} onChange={(e) => handleInputChange(index, 'location', e.target.value)} />
                  </div>
                </div>
              ) : (
                // DISPLAY VIEW with Inline Suggestions
                <>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-0.5">
                      <GraduationCap className="h-4 w-4" />
                      {edu.institution ?? 'Unnamed Institution'}
                    </h3>
                    {renderInlineSuggestions(createPath('education', index, 'institution'))}
                  </div>
                  {edu.degree && 
                    <div className='mt-0.5'>
                      <p className="text-sm text-muted-foreground mb-0.5">{edu.degree}</p>
                      {renderInlineSuggestions(createPath('education', index, 'degree'))}
                    </div>
                  }
                  <div className="flex items-start gap-4 text-xs text-muted-foreground mt-1 mb-0.5">
                    {(edu.startDate || edu.endDate || edu.year) && (
                      <div className='flex-shrink-0'>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {edu.year ?? formatDateRange(edu.startDate, edu.endDate)}
                        </span>
                        {renderInlineSuggestions(edu.year ? createPath('education', index, 'year') : createPath('education', index, 'startDate'))}
                        {!edu.year && renderInlineSuggestions(createPath('education', index, 'endDate'))}
                      </div>
                    )}
                    {edu.location && (
                      <div className='flex-shrink-0'>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {edu.location}
                        </span>
                        {renderInlineSuggestions(createPath('education', index, 'location'))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
} 