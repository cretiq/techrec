import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Linkedin, Github, Link as LinkIcon, Edit, Save, X, AlertTriangle } from 'lucide-react';

// Import suggestion-related types and components
import { CvImprovementSuggestion } from '@/types/cv';
// Remove old imports
// import { SuggestionHighlight } from '@/components/suggestions/SuggestionHighlight';
// import { SuggestionIndicator } from '@/components/suggestions/SuggestionIndicator';
// Import new component
import { InlineSuggestion } from '@/components/analysis/InlineSuggestion';

interface ContactInfoData {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  linkedin?: string | null;
  github?: string | null;
  website?: string | null;
}

interface ContactInfoProps {
  data: ContactInfoData;
  onChange: (updatedData: ContactInfoData) => void;
  suggestions?: CvImprovementSuggestion[];
  onAcceptSuggestion?: (suggestion: CvImprovementSuggestion) => void;
  onRejectSuggestion?: (suggestion: CvImprovementSuggestion) => void;
}

// Helper function to find suggestions for a specific field path
const findSuggestionsForField = (
  suggestions: CvImprovementSuggestion[] | undefined,
  field: keyof ContactInfoData
): CvImprovementSuggestion[] => {
  if (!suggestions) return [];
  const fullPath = `contactInfo.${field}`;
  return suggestions.filter(s => s.section === fullPath);
};

export function ContactInfoDisplay({ data, onChange, suggestions, onAcceptSuggestion, onRejectSuggestion }: ContactInfoProps) {
  console.log('[ContactInfoDisplay] Rendering with data:', data); // LOG
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<ContactInfoData>(data);

  React.useEffect(() => {
    setEditData(data);
  }, [data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const newData = { ...editData, [id]: value || null };
    setEditData(newData);
    onChange(newData);
  };

  const handleSave = async () => {
    // For simplicity, local save confirmation. Parent handles actual save.
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(data); // Revert to original data from props
    onChange(data); // Notify parent of reversion
    setIsEditing(false);
  };

  // Function to render a single field (editable or display) with inline suggestions
  const renderFieldWithSuggestions = (
    id: keyof ContactInfoData,
    Icon: React.ElementType,
    placeholder: string,
    label?: string,
    type: string = 'text'
  ) => {
    const currentSuggestions = findSuggestionsForField(suggestions, id);
    const hasValue = data[id] && data[id]?.trim() !== '';
    const displayValue = hasValue ? data[id] : <span className='text-muted-foreground/50'>{placeholder}...</span>;

    return (
      <div key={id} className="mb-3"> {/* Add margin between fields */}
        <div className="flex items-center gap-2 text-sm mb-1"> {/* Reduced margin below field */}
        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        {isEditing ? (
          <div className="flex-1">
            <Label htmlFor={id} className="sr-only">{label || placeholder}</Label>
            <Input
              id={id}
              type={type}
              placeholder={placeholder}
              value={editData[id] || ''}
              onChange={handleInputChange}
              className="h-8 text-sm"
            />
          </div>
        ) : (
              <span className="truncate">{displayValue}</span>
          )}
        </div>
        {/* Render suggestions OR gentle prompt below the field if not editing */}
        {!isEditing && (
          <div className="pl-6 mt-1"> {/* Indent suggestions/prompts */}
            {!hasValue && id !== 'name' && id !== 'email' ? ( // Don't prompt for missing name/email, only optional fields
              <p className="text-xs text-yellow-600 dark:text-yellow-500 flex items-center gap-1">
                 <AlertTriangle className="h-3 w-3" /> Consider adding your {label || id}.
              </p>
            ) : currentSuggestions.length > 0 ? (
              currentSuggestions.map((suggestion, index) => (
                <InlineSuggestion
                  key={`${id}-suggestion-${index}`}
                  suggestion={suggestion}
                  onAccept={onAcceptSuggestion}
                  onReject={onRejectSuggestion}
                />
              ))
            ) : null}
          </div>
        )}
      </div>
    );
  };

  // Function to render a link field (editable or display) with inline suggestions
  const renderLinkWithSuggestions = (
    id: keyof ContactInfoData,
    Icon: React.ElementType,
    placeholder: string,
    textPrefix = ''
  ) => {
    const currentSuggestions = findSuggestionsForField(suggestions, id);
    const url = data[id]; // Use data directly for checking presence
    const hasValue = url && url.trim() !== '';
    const editUrl = editData[id]; // Use editData for input value
    const displayUrl = url?.replace(/^(https?:\/\/)/, '') || '';
    const isValidUrl = hasValue && (url.startsWith('http://') || url.startsWith('https://'));
    
    return (
       <div key={id} className="mb-3"> {/* Add margin between fields */}
        <div className="flex items-center gap-2 text-sm mb-1"> {/* Reduced margin below field */}
        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        {isEditing ? (
           <div className="flex-1">
            <Label htmlFor={id} className="sr-only">{placeholder}</Label>
            <Input
                id={id}
                type="url"
                placeholder={placeholder}
                value={editUrl || ''} // Use editData value here
                onChange={handleInputChange}
                className="h-8 text-sm"
             />
           </div>
        ) : (
          hasValue ? (
             isValidUrl ? (
                 <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                       {textPrefix}{displayUrl}
                 </a>
             ) : (
               <span className="truncate text-red-500" title="Invalid URL format">
                     {textPrefix}{displayUrl}
               </span>
             )
          ) : (
             <span className='text-muted-foreground/50'>{placeholder}...</span>
          )
        )}
        </div>
         {/* Render suggestions OR gentle prompt below the field if not editing */}
         {!isEditing && (
           <div className="pl-6 mt-1"> {/* Indent suggestions/prompts */}
             {!hasValue ? ( // Prompt if missing
               <p className="text-xs text-yellow-600 dark:text-yellow-500 flex items-center gap-1">
                 <AlertTriangle className="h-3 w-3" /> Consider adding your {id} profile.
               </p>
             ) : currentSuggestions.length > 0 ? ( // Show suggestions if present and has value
                 currentSuggestions.map((suggestion, index) => (
                   <InlineSuggestion
                     key={`${id}-suggestion-${index}`}
                     suggestion={suggestion}
                     onAccept={onAcceptSuggestion}
                     onReject={onRejectSuggestion}
                 />
               ))
             ) : null}
           </div>
         )}
      </div>
    );
  }

  return (
    // Remove Card, CardHeader - managed by parent
    <div className="space-y-2">
      {/* Edit/Save Buttons - moved to top right for consistency? Or keep inline? Keeping simple for now */}
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

      {/* Render fields */} 
      {isEditing && renderFieldWithSuggestions('name', Mail, 'Full Name', 'Full Name')} {/* Show name only when editing? */}
      {renderFieldWithSuggestions('email', Mail, 'Email Address', 'Email', 'email')}
      {renderFieldWithSuggestions('phone', Phone, 'Phone Number', 'Phone', 'tel')}
      {renderFieldWithSuggestions('location', MapPin, 'Location (City, Country)', 'Location')}
      {renderLinkWithSuggestions('linkedin', Linkedin, 'linkedin.com/in/...')}
      {renderLinkWithSuggestions('github', Github, 'github.com/...')}
      {renderLinkWithSuggestions('website', LinkIcon, 'yourwebsite.com')}
    </div>
  );
} 