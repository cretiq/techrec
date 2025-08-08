import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui-daisy/input';
import { Button } from '@/components/ui-daisy/button';
import { Badge } from '@/components/ui-daisy/badge';
import { Tooltip } from '@/components/ui-daisy/tooltip';
import { Mail, Phone, MapPin, Linkedin, Github, Link as LinkIcon, Edit, Save, X, AlertTriangle, User } from 'lucide-react';
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
  
  // CRITICAL DEBUG: Track component instance identity
  const componentId = useRef(Math.random().toString(36).substr(2, 9));
  
  console.log(`🔍 [ContactInfoDisplay] RENDER #${renderCount.current}`, {
    componentId: componentId.current,
    dataKeys: data ? Object.keys(data) : null,
    dataValues: data,
    onChangeType: typeof onChange,
    onChangeString: onChange.toString().substring(0, 100),
    timestamp: new Date().toISOString()
  });
  
  // CRITICAL DEBUG: Log if this is a new component instance
  if (renderCount.current === 1) {
    console.log(`🆕 [ContactInfoDisplay] NEW COMPONENT INSTANCE created with ID: ${componentId.current}`);
  }
  
  const [editData, setEditData] = useState<ContactInfoData>(data);
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
    const inputElement = e.target;
    
    console.log('⌨️ [ContactInfoDisplay] handleInputChange called', {
      fieldId: id,
      newValue: value,
      currentEditData: editData,
      renderCount: renderCount.current,
      activeElement: document.activeElement?.id,
      inputElementId: inputElement.id,
      timestamp: new Date().toISOString()
    });
    
    const newData = { ...editData, [id]: value || null };
    console.log('📤 [ContactInfoDisplay] About to call parent onChange', {
      newData,
      parentOnChangeType: typeof onChange,
      renderCount: renderCount.current
    });
    
    setEditData(newData);
    
    // CRITICAL TEST: Store reference to input element before parent call
    const elementBeforeParentCall = document.getElementById(id);
    console.log('🔍 [CRITICAL] Element exists before parent call:', {
      elementExists: !!elementBeforeParentCall,
      elementId: elementBeforeParentCall?.id,
      elementValue: elementBeforeParentCall?.value,
      sameAsEventTarget: elementBeforeParentCall === inputElement
    });
    
    onChange(newData); // Immediately notify parent of changes
    
    // CRITICAL TEST: Check if element still exists after parent call
    setTimeout(() => {
      const elementAfterParentCall = document.getElementById(id);
      console.log('🎯 [CRITICAL] Element status after parent onChange', {
        elementStillExists: !!elementAfterParentCall,
        elementId: elementAfterParentCall?.id,
        elementValue: elementAfterParentCall?.value,
        sameElementReference: elementAfterParentCall === elementBeforeParentCall,
        activeElement: document.activeElement?.id,
        expectedFocus: id,
        focusMaintained: document.activeElement?.id === id,
        renderCount: renderCount.current
      });
      
      // If element changed, log the issue
      if (elementAfterParentCall !== elementBeforeParentCall) {
        console.error('🚨 [ROOT CAUSE FOUND] Input element was replaced! DOM element reference changed.');
      }
    }, 0);
  };


  // Function to render a single field with enhanced DaisyUI input (always editable)
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
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium text-base-content">{label || placeholder}</span>
          </label>
          <Input
            key={`${id}-input`}
            id={id}
            type={type}
            placeholder={placeholder}
            value={editData[id] || ''}
            onChange={handleInputChange}
            variant="elevated"
            inputSize="md"
            hoverable
            leftIcon={<Icon className="h-4 w-4" />}
            className={highlightClasses}
          />
        </div>
      </div>
    );
  };

  // Function to render a link field with enhanced DaisyUI input (always editable)
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
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium text-base-content">{placeholder}</span>
          </label>
          <Input
            key={`${id}-input`}
            id={id}
            type="url"
            placeholder={placeholder}
            value={editUrl || ''}
            onChange={handleInputChange}
            variant="elevated"
            inputSize="md"
            hoverable
            leftIcon={<Icon className="h-4 w-4" />}
            className={highlightClasses}
          />
        </div>
      </div>
    );
  }


  return (
    // Remove Card, CardHeader - managed by parent
    <div className="space-y-6">
      {/* Contact Info Fields - 3x2 Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* First Row */}
        <div>
          {renderFieldWithSuggestions('email', Mail, 'Email Address', 'Email')}
          <SuggestionManager section="contactInfo" targetField="email" className="mt-1" />
        </div>
        
        <div>
          {renderFieldWithSuggestions('phone', Phone, 'Phone Number', 'Phone')}
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