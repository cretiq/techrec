import React, { useState, useRef } from 'react';
import { FloatingInput } from '@/components/ui-daisy/floating-input';
import { Button } from '@/components/ui-daisy/button';
import { Badge } from '@/components/ui-daisy/badge';
import { Tooltip } from '@/components/ui-daisy/tooltip';
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
    onChange(newData); // Immediately notify parent of changes
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

  // Function to render a single field with DaisyUI floating input (always editable)
  const renderFieldWithSuggestions = (
    id: keyof ContactInfoData,
    Icon: React.ElementType,
    placeholder: string,
    label?: string,
    type: string = 'text'
  ) => {
    const currentSuggestions = findSuggestionsForField(suggestions, id);
    const hasValue = data[id] && data[id]?.trim() !== '';
    const highlightClasses = useHighlightClasses(`contactInfo.${id}`);
    const showMissingWarning = !hasValue && id !== 'name' && id !== 'email'; // Don't warn for required fields

    return (
      <div key={id} className="space-y-2">
        <FloatingInput
          id={id}
          type={type}
          label={label || placeholder}
          value={editData[id] || ''}
          onChange={handleInputChange}
          leftIcon={<Icon className="h-4 w-4" />}
          showStatus={showMissingWarning}
          statusVariant="warning"
          statusTooltip={`Consider adding your ${label || id}`}
          variant="bordered"
          className={highlightClasses}
        />
      </div>
    );
  };

  // Function to render a link field with DaisyUI floating input (always editable)
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
    const isValidUrl = hasValue && (url.startsWith('http://') || url.startsWith('https://'));
    const highlightClasses = useHighlightClasses(`contactInfo.${id}`);
    const showMissingWarning = !hasValue; // Always show for optional profile links
    
    return (
      <div key={id} className="space-y-2">
        <FloatingInput
          id={id}
          type="url"
          label={placeholder}
          value={editUrl || ''}
          onChange={handleInputChange}
          leftIcon={<Icon className="h-4 w-4" />}
          showStatus={showMissingWarning}
          statusVariant="warning"
          statusTooltip={`Consider adding your ${id} profile`}
          variant="bordered"
          className={highlightClasses}
        />
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
      {/* Profile Picture Row */}
      <div className="flex items-start justify-center mb-6">
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
      </div>

      {/* Contact Info Fields - 3x2 Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* First Row */}
        <div>
          {renderFieldWithSuggestions('name', User, 'Full Name', 'Full Name')}
          {renderFieldWithSuggestions('email', Mail, 'Email Address', 'Email', 'email')}
          <SuggestionManager section="contactInfo" targetField="email" className="mt-1" />
        </div>
        
        <div>
          {renderFieldWithSuggestions('phone', Phone, 'Phone Number', 'Phone', 'tel')}
          <SuggestionManager section="contactInfo" targetField="phone" className="mt-1" />
        </div>
        
        <div>
          {renderFieldWithSuggestions('location', MapPin, 'Location (City, Country)', 'Location')}
          <SuggestionManager section="contactInfo" targetField="location" className="mt-1" />
        </div>
        
        {/* Second Row */}
        <div>
          {renderLinkWithSuggestions('linkedin', Linkedin, 'linkedin.com/in/...')}
          <SuggestionManager section="contactInfo" targetField="linkedin" className="mt-1" />
        </div>
        
        <div>
          {renderLinkWithSuggestions('github', Github, 'github.com/...')}
          <SuggestionManager section="contactInfo" targetField="github" className="mt-1" />
        </div>
        
        <div>
          {renderLinkWithSuggestions('website', LinkIcon, 'yourwebsite.com')}
          <SuggestionManager section="contactInfo" targetField="website" className="mt-1" />
        </div>
      </div>
    </div>
  );
} 