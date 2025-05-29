import React, { useState } from 'react';
import {  Badge  } from '@/components/ui-daisy/badge';
import {  Input  } from '@/components/ui-daisy/input';
import {  Button  } from '@/components/ui-daisy/button';
import { X, Edit, Save, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid'; // For temporary IDs if adding new items

// Import suggestion-related types and components
import { CvImprovementSuggestion } from '@/types/cv';
// Remove old imports
// import { SuggestionHighlight } from '@/components/suggestions/SuggestionHighlight';
// import { SuggestionIndicator } from '@/components/suggestions/SuggestionIndicator';
// Import new component
import { InlineSuggestion } from '@/components/analysis/InlineSuggestion';
import { cn } from '@/lib/utils';

// Import Skill type from central location
import { Skill as CvSkillType } from '@/types/cv';

// Local Skill type (if needed for editing state, but should align with CvSkillType)
// interface Skill {
//   id?: string; 
//   name: string; // Keep this required for adding new skills locally?
// }

interface SkillsProps {
  // Use the imported type
  data: CvSkillType[] | null | undefined;
  onChange: (updatedSkills: CvSkillType[]) => void;
  suggestions?: CvImprovementSuggestion[];
  onAcceptSuggestion?: (suggestion: CvImprovementSuggestion) => void;
  onRejectSuggestion?: (suggestion: CvImprovementSuggestion) => void;
}

// Helper function (can be generalized later)
const findSuggestionsForSkill = (
  suggestions: CvImprovementSuggestion[] | undefined,
  index: number
): CvImprovementSuggestion[] => {
  if (!suggestions) return [];
  const skillPath = `skills[${index}]`; // Path for the whole skill item
  const skillNamePath = `skills[${index}].name`; // Path for the skill name
  // Find suggestions matching the skill item or its name
  return suggestions.filter(s => s.section === skillPath || s.section === skillNamePath);
};

export function SkillsDisplay({ 
  data, 
  onChange, 
  suggestions, 
  onAcceptSuggestion,
  onRejectSuggestion
}: SkillsProps) {
  console.log('[SkillsDisplay] Rendering with data (count):', data?.length); // LOG
  const [isEditing, setIsEditing] = useState(false);
  // Use the imported type for state as well
  const [editData, setEditData] = useState<CvSkillType[]>(data || []);
  const [newSkillName, setNewSkillName] = useState('');

  React.useEffect(() => {
    // Ensure data passed to state aligns with CvSkillType
    setEditData(data || []);
  }, [data]);

  const notifyChange = (newData: CvSkillType[]) => {
    setEditData(newData);
    onChange(newData);
  };

  const handleAddSkill = () => {
    if (newSkillName.trim()) {
      const newSkillNameLower = newSkillName.trim().toLowerCase();
      // Check against optional name property
      if (!editData.some(skill => skill.name?.toLowerCase() === newSkillNameLower)) {
        // Add skill with required name property when creating new
        const newData = [...editData, { name: newSkillName.trim() }]; 
        notifyChange(newData);
      } else {
        console.warn("Attempted to add duplicate skill:", newSkillName.trim());
      }
      setNewSkillName('');
    }
  };

  const handleRemoveSkill = (indexToRemove: number) => {
    const newData = editData.filter((_, index) => index !== indexToRemove);
    notifyChange(newData);
  };

  const handleSave = async () => {
    console.log("Confirming skill edits (locally)...", editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    const originalData = data || [];
    setEditData(originalData);
    onChange(originalData); // Notify parent of reset
    setIsEditing(false);
    setNewSkillName('');
  };

  if (!isEditing && (!editData || editData.length === 0)) {
    return null;
  }

  return (
    <div>
        <div className="flex justify-end mb-2">
        {isEditing ? (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={handleCancel} className="h-7 w-7"><X className="h-4 w-4" /></Button>
            <Button variant="default" size="icon" onClick={handleSave} className="h-7 w-7"><Save className="h-4 w-4" /></Button>
          </div>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="h-7 w-7"><Edit className="h-4 w-4" /></Button>
        )}
        </div>

        <div className="flex flex-wrap gap-2">
          {editData.map((skill, index) => {
            const currentSuggestions = findSuggestionsForSkill(suggestions, index);
            // Provide fallback for potentially undefined name
            const skillName = skill.name ?? 'Unnamed Skill'; 

            return (
              <div key={skill.id || `skill-${index}`} className="mb-2"> {/* Wrapper for badge + suggestions */} 
                <Badge 
                  variant="secondary" 
                  className={cn("relative group", isEditing ? "pr-6" : "")}
                >
                {skillName} 
                {isEditing && (
                  <button 
                      onClick={() => handleRemoveSkill(index)}
                      className="absolute -top-1 -right-1 p-0.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/80" 
                      aria-label={`Remove ${skillName}`}
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
                </Badge>

                {/* Render Inline Suggestions below the badge if not editing */} 
                {!isEditing && currentSuggestions.length > 0 && (
                  <div className="mt-1 ml-1 space-y-1"> {/* Add spacing for suggestions below badge */} 
                    {currentSuggestions.map((suggestion, sIndex) => (
                      <InlineSuggestion 
                        key={`skill-${index}-suggestion-${sIndex}`}
                        suggestion={suggestion}
                        onAccept={onAcceptSuggestion}
                        onReject={onRejectSuggestion}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {isEditing && (
          <div className="mt-4 flex gap-2 items-center">
            <Input 
                type="text" 
                placeholder="Add new skill..." 
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                className="h-8 flex-1 text-sm"
            />
            <Button size="sm" onClick={handleAddSkill} className="h-8"><Plus className="h-4 w-4 mr-1"/> Add</Button>
          </div>
        )}
    </div>
  );
} 