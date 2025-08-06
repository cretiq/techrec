import React, { useState, useRef } from 'react';
import {  Input  } from '@/components/ui-daisy/input';
import {  Button  } from '@/components/ui-daisy/button';
import { Label } from '@/components/ui-daisy/label';
import { Mail, Phone, MapPin, Linkedin, Github, Link as LinkIcon, Edit, Save, X, AlertTriangle, Camera, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui-daisy/avatar';
import { useToast } from '@/components/ui-daisy/use-toast';
import { useHighlightClasses } from '@/utils/suggestionHighlight';

// Import suggestion-related types and components
import { CvImprovementSuggestion } from '@/types/cv';
import { SuggestionManager } from '@/components/suggestions/SuggestionManager';

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
  const [profilePicture, setProfilePicture] = useState<string | null>(null); // TODO: Get from user data
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 2MB',
        variant: 'destructive'
      });
      return;
    }

    // Create local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfilePicture(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // TODO: Upload to S3 and update user profile
    toast({
      title: "Profile Picture Updated",
      description: "Profile picture upload functionality coming soon!",
    });

    // Reset input
    if (e.target) e.target.value = '';
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
    const highlightClasses = useHighlightClasses(`contactInfo.${id}`);

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
              <span className={`truncate p-1 rounded ${highlightClasses}`}>{displayValue}</span>
          )}
        </div>
        {/* Render suggestions OR gentle prompt below the field if not editing */}
        {!isEditing && (
          <div className="pl-6 mt-1"> {/* Indent suggestions/prompts */}
            {!hasValue && id !== 'name' && id !== 'email' ? ( // Don't prompt for missing name/email, only optional fields
              <p className="text-xs text-yellow-600 dark:text-yellow-500 flex items-center gap-1">
                 <AlertTriangle className="h-3 w-3" /> Consider adding your {label || id}.
              </p>
            ) : null}
            {/* Inline suggestions removed - using SuggestionManager instead */}
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
    const highlightClasses = useHighlightClasses(`contactInfo.${id}`);
    
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
                 <a href={url} target="_blank" rel="noopener noreferrer" className={`text-blue-600 hover:underline truncate p-1 rounded ${highlightClasses}`}>
                       {textPrefix}{displayUrl}
                 </a>
             ) : (
               <span className={`truncate text-red-500 p-1 rounded ${highlightClasses}`} title="Invalid URL format">
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
             ) : null}
             {/* Inline suggestions removed - using SuggestionManager instead */}
           </div>
         )}
      </div>
    );
  }

  // Get initials for avatar fallback
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    // Remove Card, CardHeader - managed by parent
    <div className="space-y-4">
      {/* Profile Picture and Edit Button Row */}
      <div className="flex items-start justify-between">
        {/* Profile Picture */}
        <div className="relative group">
          <Avatar className="h-24 w-24 border-2 border-base-300">
            <AvatarImage src={profilePicture || undefined} alt={data.name || 'Profile'} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-lg font-semibold">
              {getInitials(data.name)}
            </AvatarFallback>
          </Avatar>
          
          {/* Upload overlay */}
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-6 w-6 text-white" />
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
            className="hidden"
          />
        </div>

        {/* Edit/Save Buttons */}
        <div>
          {isEditing ? (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={handleCancel} className="h-7 w-7"><X className="h-4 w-4" /></Button>
              <Button variant="default" size="icon" onClick={handleSave} className="h-7 w-7"><Save className="h-4 w-4" /></Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="h-7 w-7"><Edit className="h-4 w-4" /></Button>
          )}
        </div>
      </div>

      {/* Contact Info Fields */}
      <div className="space-y-2">
        {/* Render fields */} 
        {isEditing && renderFieldWithSuggestions('name', User, 'Full Name', 'Full Name')} {/* Changed icon from Mail to User */}
        {renderFieldWithSuggestions('email', Mail, 'Email Address', 'Email', 'email')}
        <SuggestionManager section="contactInfo" targetField="email" className="mt-1" />
        
        {renderFieldWithSuggestions('phone', Phone, 'Phone Number', 'Phone', 'tel')}
        <SuggestionManager section="contactInfo" targetField="phone" className="mt-1" />
        
        {renderFieldWithSuggestions('location', MapPin, 'Location (City, Country)', 'Location')}
        <SuggestionManager section="contactInfo" targetField="location" className="mt-1" />
        
        {renderLinkWithSuggestions('linkedin', Linkedin, 'linkedin.com/in/...')}
        <SuggestionManager section="contactInfo" targetField="linkedin" className="mt-1" />
        
        {renderLinkWithSuggestions('github', Github, 'github.com/...')}
        <SuggestionManager section="contactInfo" targetField="github" className="mt-1" />
        
        {renderLinkWithSuggestions('website', LinkIcon, 'yourwebsite.com')}
        <SuggestionManager section="contactInfo" targetField="website" className="mt-1" />
      </div>
    </div>
  );
} 