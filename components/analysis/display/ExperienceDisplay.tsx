import React, { useState } from 'react';
import {  Button  } from '@/components/ui-daisy/button';
import {  Card  } from '@/components/ui-daisy/card';
import { Briefcase, MapPin, Calendar, Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import {  Input  } from '@/components/ui-daisy/input';
import { Textarea } from "@/components/ui-daisy/textarea";
import { Label } from '@/components/ui-daisy/label';
import { cn, formatDateSafe } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Import suggestion-related types and components
import { ExperienceItem as CvExperienceItem, ExperienceProject, CvImprovementSuggestion } from '@/types/cv';
import { SuggestionManager } from '@/components/suggestions/SuggestionManager';

interface ExperienceProps {
  data: CvExperienceItem[] | null | undefined;
  onChange: (updatedExperience: CvExperienceItem[]) => void;
  suggestions?: CvImprovementSuggestion[];
  onAcceptSuggestion?: (suggestion: CvImprovementSuggestion) => void;
  onRejectSuggestion?: (suggestion: CvImprovementSuggestion) => void;
}

export interface ExperienceDisplayRef {
  startEditing: () => void;
  isEditing: boolean;
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

export const ExperienceDisplay = React.forwardRef<ExperienceDisplayRef, ExperienceProps>(({ data, onChange, suggestions, onAcceptSuggestion, onRejectSuggestion }, ref) => {
  console.log('[ExperienceDisplay] Rendering with data (count):', data?.length);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<CvExperienceItem[]>(data || []);

  // Prepare data for edit mode without auto-converting descriptions
  const prepareDataForEdit = (items: CvExperienceItem[]): CvExperienceItem[] => {
    // Don't auto-convert descriptions to responsibilities
    // Keep description and responsibilities as separate fields
    return items.map((item, index) => {
      // Ensure responsibilities is at least an empty array
      return { 
        ...item, 
        responsibilities: item.responsibilities || []
      };
    });
  };

  React.useEffect(() => {
    const processedData = prepareDataForEdit(data || []);
    setEditData(processedData);
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

  // Handlers for projects array
  const handleAddProject = (expIndex: number) => {
    const newProject: ExperienceProject = { name: '', description: '', technologies: [], teamSize: null, role: '' };
    const newData = editData.map((item, i) =>
      i === expIndex ? { ...item, projects: [...(item.projects || []), newProject] } : item
    );
    notifyChange(newData);
  };

  const handleProjectChange = (expIndex: number, projIndex: number, field: keyof ExperienceProject, value: string | number | string[] | null) => {
    const newData = editData.map((item, i) =>
      i === expIndex ? {
        ...item,
        projects: (item.projects || []).map((proj, pI) => 
          pI === projIndex ? { ...proj, [field]: value } : proj
        )
      } : item
    );
    notifyChange(newData);
  };

  const handleRemoveProject = (expIndex: number, projIndex: number) => {
    const newData = editData.map((item, i) =>
      i === expIndex ? {
        ...item,
        projects: (item.projects || []).filter((_, pI) => pI !== projIndex)
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

  const startEditing = () => {
    const processedData = prepareDataForEdit(editData);
    setEditData(processedData);
    setIsEditing(true);
  };

  // Expose functions via ref
  React.useImperativeHandle(ref, () => ({
    startEditing,
    isEditing
  }), [isEditing]);

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
      {isEditing && (
        <div className="flex justify-end mb-2">
          <div className="flex gap-2 items-center">
            <Button variant="outline" size="sm" onClick={handleAddItem} className="mr-2 h-8 text-xs"><Plus className="h-4 w-4 mr-1" /> Add Entry</Button>
            <Button variant="ghost" onClick={handleCancel} className="h-12 w-12 p-0 hover:bg-base-200 flex items-center justify-center"><X className="h-5 w-5" /></Button>
            <Button variant="elevated" onClick={handleSave} className="h-12 w-12 p-0 shadow-md hover:shadow-lg flex items-center justify-center"><Save className="h-5 w-5" /></Button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence initial={false}>
          {editData.map((exp, index) => (
            <Card
              key={exp.id || `exp-${index}`}
              variant="gradient-interactive"
              className={cn(
                "p-6 relative group shadow-lg hover:shadow-xl transition-all duration-200",
                exp.isNew && "border-dashed border-primary"
              )}
              animated
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
                    <Label className="text-xs font-medium block mb-2">Responsibilities/Achievements</Label>
                    <div className="list bg-base-100/30 rounded-lg p-2 mb-2">
                      {((exp.responsibilities && exp.responsibilities.length > 0) ? exp.responsibilities : ['']).map((resp, rIndex) => (
                        <div key={rIndex} className="list-row py-1 group">
                          <div className="text-primary/70 text-sm self-start mt-1">•</div>
                          <div className="list-col-grow pl-2 flex items-center gap-1">
                            <Input 
                              value={resp ?? ''} 
                              onChange={(e) => handleResponsibilityChange(index, rIndex, e.target.value)} 
                              placeholder={`Responsibility ${rIndex + 1}`} 
                              className="h-8 text-sm flex-1 bg-base-100/50" 
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemoveResponsibility(index, rIndex)} 
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-3 w-3 text-error" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleAddResponsibility(index)} className="h-7 text-xs">
                      <Plus className="h-3 w-3 mr-1" /> Add Responsibility
                    </Button>
                  </div>
                  
                  {/* Projects Section */}
                  <div>
                    <Label className="text-xs font-medium block mb-2">Projects</Label>
                    <div className="space-y-3 bg-base-100/30 rounded-lg p-2 mb-2">
                      {((exp.projects && exp.projects.length > 0) ? exp.projects : []).map((project, pIndex) => (
                        <div key={pIndex} className="p-3 bg-base-100/50 rounded-lg border border-base-200">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs text-primary">Project {pIndex + 1}</Label>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemoveProject(index, pIndex)} 
                              className="h-6 w-6 p-0 opacity-70 hover:opacity-100 hover:bg-error/10"
                            >
                              <Trash2 className="h-3 w-3 text-error" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <Input 
                              value={project?.name || ''} 
                              onChange={(e) => handleProjectChange(index, pIndex, 'name', e.target.value)} 
                              placeholder="Project name" 
                              className="h-8 text-sm" 
                            />
                            <Textarea 
                              value={project?.description || ''} 
                              onChange={(e) => handleProjectChange(index, pIndex, 'description', e.target.value)} 
                              placeholder="Project description" 
                              className="text-sm min-h-[60px]" 
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input 
                                value={project?.role || ''} 
                                onChange={(e) => handleProjectChange(index, pIndex, 'role', e.target.value)} 
                                placeholder="Your role" 
                                className="h-8 text-sm" 
                              />
                              <Input 
                                type="number" 
                                value={project?.teamSize || ''} 
                                onChange={(e) => handleProjectChange(index, pIndex, 'teamSize', e.target.value ? parseInt(e.target.value) : null)} 
                                placeholder="Team size" 
                                className="h-8 text-sm" 
                              />
                            </div>
                            <Input 
                              value={project?.technologies?.join(', ') || ''} 
                              onChange={(e) => handleProjectChange(index, pIndex, 'technologies', e.target.value.split(',').map(t => t.trim()).filter(t => t))} 
                              placeholder="Technologies (comma-separated)" 
                              className="h-8 text-sm" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleAddProject(index)} className="h-7 text-xs">
                      <Plus className="h-3 w-3 mr-1" /> Add Project
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-1.5">
                      <Briefcase className="h-4 w-4" />
                      {exp.title ?? 'Untitled Role'}
                    </h3>
                    {/* Field-specific suggestions for job title */}
                    <SuggestionManager 
                      section="experience" 
                      targetId={exp.id} 
                      targetField="title" 
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{exp.company ?? 'Unknown Company'}</p>
                    {/* Field-specific suggestions for company */}
                    <SuggestionManager 
                      section="experience" 
                      targetId={exp.id} 
                      targetField="company" 
                      className="mt-1" 
                    />
                  </div>
                  <div className="flex items-start gap-4 text-xs text-muted-foreground mt-2 mb-1">
                    {(exp.startDate || exp.endDate) && 
                      <div className='flex-shrink-0'>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateSafe(exp.startDate ?? null)} - {formatDateSafe(exp.endDate ?? null)}
                        </span>
                      </div>
                    }
                    {exp.location && 
                      <div className='flex-shrink-0'>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {exp.location}
                        </span>
                        {/* Field-specific suggestions for location */}
                        <SuggestionManager 
                          section="experience" 
                          targetId={exp.id} 
                          targetField="location" 
                          className="mt-1" 
                        />
                      </div>
                    }
                  </div>
                  {/* Display description - always as paragraph, above responsibilities */}
                  {exp.description && (
                    <div className="bg-base-100/20 rounded-lg p-3 mt-4">
                      <p className="text-base text-base-content/90 leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                  )}

                  {/* Display responsibilities array */}
                  {exp.responsibilities && exp.responsibilities.length > 0 && (
                    <ul className="list bg-base-100/20 rounded-lg mt-3 p-2">
                      {exp.responsibilities.map((resp, rIndex) => (
                        <li key={rIndex} className="list-row py-1.5">
                          <div className="text-primary/70 text-sm">•</div>
                          <div className="text-sm text-base-content/90 list-col-grow pl-2">
                            {resp ?? ''}
                            {/* Field-specific suggestions for this responsibility */}
                            <SuggestionManager 
                              section="experience" 
                              targetId={exp.id} 
                              targetField={`responsibilities[${rIndex}]`} 
                              className="mt-1" 
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Display tech stack */}
                  {exp.techStack && exp.techStack.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-base-content mb-2">Technologies:</h4>
                      <div className="flex flex-wrap gap-2">
                        {exp.techStack.map((tech, tIndex) => (
                          <span 
                            key={tIndex} 
                            className="px-3 py-1 text-xs bg-secondary/20 text-secondary border border-secondary/30 rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Display Projects */}
                  {exp.projects && exp.projects.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-base-content mb-2">Projects:</h4>
                      <div className="space-y-3">
                        {exp.projects.map((project, pIndex) => (
                          <div key={pIndex} className="p-3 bg-base-100/40 rounded-lg border border-base-200/50 shadow-md">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium text-sm text-primary">{project.name}</h5>
                                {project.description && (
                                  <p className="text-sm text-base-content/80 mt-1 leading-relaxed">
                                    {project.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                                  {project.role && (
                                    <span className="text-primary">
                                      Role: {project.role}
                                    </span>
                                  )}
                                  {project.teamSize && (
                                    <span className="px-2 py-1 bg-info/10 text-info rounded-full">
                                      Team: {project.teamSize} people
                                    </span>
                                  )}
                                </div>
                                {project.technologies && project.technologies.length > 0 && (
                                  <div className="mt-2">
                                    <div className="flex flex-wrap gap-1">
                                      {project.technologies.map((tech, tIndex) => (
                                        <span 
                                          key={tIndex} 
                                          className="px-2 py-1 text-xs bg-secondary/20 text-secondary rounded"
                                        >
                                          {tech}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Project-specific suggestions */}
                            <SuggestionManager 
                              section="experience" 
                              targetId={exp.id} 
                              targetField={`projects[${pIndex}]`} 
                              className="mt-2" 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* General suggestions for overall experience quality */}
                  <SuggestionManager 
                    section="experience" 
                    targetId={exp.id} 
                    targetField="general" 
                    className="mt-3" 
                  />
                </>
              )}
            </Card>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
});

ExperienceDisplay.displayName = "ExperienceDisplay"; 