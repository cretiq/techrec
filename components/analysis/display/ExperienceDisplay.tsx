import React, { useState } from 'react';
import {  Button  } from '@/components/ui-daisy/button';
import { Briefcase, MapPin, Calendar, Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import {  Input  } from '@/components/ui-daisy/input';
import { Textarea } from "@/components/ui-daisy/textarea";
import { Label } from '@/components/ui/label';
import { cn, formatDateSafe } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Import suggestion-related types and components
import { ExperienceItem as CvExperienceItem, CvImprovementSuggestion } from '@/types/cv';
// Removed InlineSuggestion - using SuggestionManager instead

interface ExperienceProps {
  data: CvExperienceItem[] | null | undefined;
  onChange: (updatedExperience: CvExperienceItem[]) => void;
  suggestions?: CvImprovementSuggestion[];
  onAcceptSuggestion?: (suggestion: CvImprovementSuggestion) => void;
  onRejectSuggestion?: (suggestion: CvImprovementSuggestion) => void;
}

// Helper to format date ranges
const formatDateRange = (start?: string | null, end?: string | null): string => {
  const formatPart = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    try {
      // Handle YYYY-MM and YYYY-MM-DD
      const date = new Date(dateStr + (dateStr.length === 7 ? '-02' : '')); // Add day if missing for Date object
      const year = date.getFullYear();
      const month = date.toLocaleString('default', { month: 'short' });
      return `${month} ${year}`;
    } catch {
      return dateStr; // Return original string if parsing fails
    }
  };
  const startFormatted = formatPart(start);
  const endFormatted = end ? formatPart(end) : 'Present';
  return `${startFormatted} - ${endFormatted}`.trim().replace(/^-| -$/,''); // Clean up if one date is missing
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
const createPath = (base: string, index: number, field?: string, subIndex?: number): string => {
  let path = `${base}[${index}]`;
  if (field) path += `.${field}`;
  if (subIndex !== undefined) path += `[${subIndex}]`;
  return path;
};

export function ExperienceDisplay({ data, onChange, suggestions, onAcceptSuggestion, onRejectSuggestion }: ExperienceProps) {
  console.log('[ExperienceDisplay] Rendering with data (count):', data?.length);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<CvExperienceItem[]>(data || []);

  React.useEffect(() => {
    setEditData(data || []);
  }, [data]);

  // Helper to notify parent
  const notifyChange = (newData: CvExperienceItem[]) => {
    setEditData(newData);
    onChange(newData);
  };

  // Input change handler for top-level fields
  const handleInputChange = (index: number, field: keyof Omit<CvExperienceItem, 'id' | 'isNew' | 'responsibilities'>, value: string | null) => {
    const newData = editData.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    notifyChange(newData);
  };

  // Handlers for responsibilities array
  const handleAddResponsibility = (expIndex: number) => {
    const newData = editData.map((item, i) =>
      i === expIndex ? { ...item, responsibilities: [...(item.responsibilities || []), ''] } : item
    );
    notifyChange(newData);
  };

  const handleResponsibilityChange = (expIndex: number, respIndex: number, value: string) => {
    const newData = editData.map((item, i) =>
      i === expIndex ? {
        ...item,
        responsibilities: (item.responsibilities || []).map((resp, rI) => rI === respIndex ? value : resp)
      } : item
    );
    notifyChange(newData);
  };

  const handleRemoveResponsibility = (expIndex: number, respIndex: number) => {
    const newData = editData.map((item, i) =>
      i === expIndex ? {
        ...item,
        responsibilities: (item.responsibilities || []).filter((_, rI) => rI !== respIndex)
      } : item
    );
    notifyChange(newData);
  };

  // Handlers for adding/removing entire experience items
  const handleAddItem = () => {
    const newItem: CvExperienceItem = { id: `temp_exp_${uuidv4()}`, title: '', company: '', isNew: true };
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

  // Removed renderInlineSuggestions function - using SuggestionManager instead

  // Animation variants for list items
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
          {editData.map((exp, index) => (
            <motion.div
              key={exp.id || `exp-${index}`}
              className={`p-6 rounded-lg relative group bg-white/20 dark:bg-black/20 ${exp.isNew ? 'border-dashed border-primary' : ''}`}
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
                  aria-label="Remove Experience Entry"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              )}
              {isEditing ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input id={`title-${index}`} placeholder="Job Title" value={exp.title ?? ''} onChange={(e) => handleInputChange(index, 'title', e.target.value)} />
                    <Input id={`company-${index}`} placeholder="Company Name" value={exp.company ?? ''} onChange={(e) => handleInputChange(index, 'company', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input id={`location-${index}`} placeholder="Location (City, Country)" value={exp.location ?? ''} onChange={(e) => handleInputChange(index, 'location', e.target.value)} />
                    <div className="flex items-center gap-1">
                      <Label htmlFor={`startDate-${index}`} className="text-xs text-muted-foreground shrink-0">From</Label>
                      <Input type="month" id={`startDate-${index}`} value={exp.startDate?.substring(0, 7) ?? ''} onChange={(e) => handleInputChange(index, 'startDate', e.target.value)} className="text-xs h-8" />
                      <Label htmlFor={`endDate-${index}`} className="text-xs text-muted-foreground shrink-0 ml-1">To</Label>
                      <Input type="month" id={`endDate-${index}`} value={exp.endDate?.substring(0, 7) ?? ''} onChange={(e) => handleInputChange(index, 'endDate', e.target.value)} className="text-xs h-8" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium block mb-1">Responsibilities/Achievements</Label>
                    {(exp.responsibilities || []).map((resp, rIndex) => (
                      <div key={rIndex} className="flex items-center gap-1 mt-1">
                        <Input value={resp ?? ''} onChange={(e) => handleResponsibilityChange(index, rIndex, e.target.value)} placeholder={`Responsibility ${rIndex + 1}`} className="h-7 text-sm flex-1" />
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveResponsibility(index, rIndex)} className="h-6 w-6 p-0"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => handleAddResponsibility(index)} className="mt-2 h-7 text-xs"><Plus className="h-3 w-3 mr-1" /> Add Responsibility</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-0.5">
                      <Briefcase className="h-4 w-4" />
                      {exp.title ?? 'Untitled Role'}
                    </h3>
                    {/* Inline suggestions removed - using SuggestionManager instead */}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-0.5">{exp.company ?? 'Unknown Company'}</p>
                    {/* Inline suggestions removed - using SuggestionManager instead */}
                  </div>
                  <div className="flex items-start gap-4 text-xs text-muted-foreground mt-1 mb-0.5">
                    {(exp.startDate || exp.endDate) && 
                      <div className='flex-shrink-0'>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateSafe(exp.startDate ?? null)} - {formatDateSafe(exp.endDate ?? null)}
                        </span>
                        {/* Inline suggestions removed - using SuggestionManager instead */}
                        {/* Inline suggestions removed - using SuggestionManager instead */}
                      </div>
                    }
                    {exp.location && 
                      <div className='flex-shrink-0'>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {exp.location}
                        </span>
                        {/* Inline suggestions removed - using SuggestionManager instead */}
                      </div>
                    }
                  </div>
                  {exp.responsibilities && exp.responsibilities.length > 0 && (
                    <ul className="mt-2 list-disc list-inside text-sm space-y-1">
                      {exp.responsibilities.map((resp, rIndex) => (
                        <li key={rIndex}>
                          {resp ?? ''}
                          {/* Inline suggestions removed - using SuggestionManager instead */}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
} 