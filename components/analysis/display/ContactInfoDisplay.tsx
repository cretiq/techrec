import React, { useState, useRef } from 'react';
import { FloatingInput } from '@/components/ui-daisy/floating-input';
import { Button } from '@/components/ui-daisy/button';
import { Badge } from '@/components/ui-daisy/badge';
import { Tooltip } from '@/components/ui-daisy/tooltip';
import { Mail, Phone, MapPin, Linkedin, Github, Link as LinkIcon, Edit, Save, X, AlertTriangle, Camera, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui-daisy/avatar';
import { useToast } from '@/components/ui-daisy/use-toast';
import { useHighlightClasses } from '@/utils/suggestionHighlight';
import { motion } from 'framer-motion';

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
  const renderCount = useRef(0);
  renderCount.current += 1;
  
  console.log(`🔍 [ContactInfoDisplay] RENDER #${renderCount.current}`, {
    dataKeys: data ? Object.keys(data) : null,
    dataValues: data,
    onChangeType: typeof onChange,
    onChangeString: onChange.toString().substring(0, 100),
    timestamp: new Date().toISOString()
  });
  
  const [editData, setEditData] = useState<ContactInfoData>(data);
  const [profilePicture, setProfilePicture] = useState<string | null>('/profile_picture.png'); // Default placeholder
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    console.log('🔄 [ContactInfoDisplay] useEffect: data changed, updating editData', {
      oldEditData: editData,
      newData: data,
      renderCount: renderCount.current
    });
    setEditData(data);
  }, [data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    console.log('⌨️ [ContactInfoDisplay] handleInputChange called', {
      fieldId: id,
      newValue: value,
      currentEditData: editData,
      renderCount: renderCount.current,
      activeElement: document.activeElement?.id,
      timestamp: new Date().toISOString()
    });
    
    const newData = { ...editData, [id]: value || null };
    console.log('📤 [ContactInfoDisplay] About to call parent onChange', {
      newData,
      parentOnChangeType: typeof onChange,
      renderCount: renderCount.current
    });
    
    setEditData(newData);
    onChange(newData); // Immediately notify parent of changes
    
    // Check if focus is maintained after state update
    setTimeout(() => {
      console.log('🎯 [ContactInfoDisplay] Focus check after onChange', {
        activeElement: document.activeElement?.id,
        expectedFocus: id,
        focusMaintained: document.activeElement?.id === id,
        renderCount: renderCount.current
      });
    }, 0);
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
    console.log(`🏗️ [ContactInfoDisplay] renderFieldWithSuggestions('${id}')`, {
      currentValue: editData[id],
      renderCount: renderCount.current,
      onChangeFunction: handleInputChange.toString().substring(0, 50),
      timestamp: new Date().toISOString()
    });
    
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
    <div className="space-y-6">
      {/* Profile Picture and Name Row - 1/3 2/3 Layout */}
      <div className="flex items-center gap-6 mb-8">
        {/* Profile Picture - 1/3 */}
        <div className="flex-shrink-0 w-1/3 flex justify-center">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-base-300/50 shadow-lg">
              <AvatarImage src={profilePicture || '/profile_picture.png'} alt={data.name || 'Profile'} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-2xl font-bold">
                {getInitials(data.name)}
              </AvatarFallback>
            </Avatar>
            
            {/* Upload overlay */}
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-8 w-8 text-white" />
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

        {/* Name Display - 2/3 */}
        <div className="flex-1 w-2/3">
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeOut",
              delay: 0.2
            }}
          >
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 1.2, 
                ease: "easeOut",
                delay: 0.4
              }}
            >
              {data.name || 'Your Name'}
            </motion.h1>
            
            {/* Floating particles effect */}
            <div className="absolute -inset-4 opacity-30 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-primary/40 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </motion.div>
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