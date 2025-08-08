import React, { useState } from 'react';
import {  Button  } from '@/components/ui-daisy/button';
import { Code, ExternalLink, Github, Calendar, Edit, Save, X, Plus, Trash2, Users, Lightbulb } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import {  Input  } from '@/components/ui-daisy/input';
import { Textarea } from "@/components/ui-daisy/textarea";
import { Label } from '@/components/ui-daisy/label';
import { cn, formatDateSafe } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Import suggestion-related types and components
import { PersonalProjectItem, CvImprovementSuggestion } from '@/types/cv';
import { SuggestionManager } from '@/components/suggestions/SuggestionManager';

interface PersonalProjectsProps {
  data: PersonalProjectItem[] | null | undefined;
  onChange: (updatedProjects: PersonalProjectItem[]) => void;
  suggestions?: CvImprovementSuggestion[];
  onAcceptSuggestion?: (suggestion: CvImprovementSuggestion) => void;
  onRejectSuggestion?: (suggestion: CvImprovementSuggestion) => void;
  isEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
}

export interface PersonalProjectsDisplayRef {
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
  return suggestions.filter(s => s.section === path);
};

// Helper to create path strings
const createPath = (base: string, index: number, field?: string, subIndex?: number): string => {
  let path = `${base}[${index}]`;
  if (field) path += `.${field}`;
  if (subIndex !== undefined) path += `[${subIndex}]`;
  return path;
};

// Status badge colors
const getStatusColor = (status?: string) => {
  switch (status) {
    case 'COMPLETED': return 'badge-success';
    case 'IN_PROGRESS': return 'badge-warning';
    case 'PLANNED': return 'badge-info';
    case 'ARCHIVED': return 'badge-neutral';
    default: return 'badge-primary';
  }
};

export const PersonalProjectsDisplay = React.forwardRef<PersonalProjectsDisplayRef, PersonalProjectsProps>(({ 
  data, 
  onChange, 
  suggestions, 
  onAcceptSuggestion, 
  onRejectSuggestion,
  isEditing: propIsEditing = false,
  onEditingChange 
}, ref) => {
  console.log('[PersonalProjectsDisplay] Rendering with data (count):', data?.length);
  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const isEditing = propIsEditing || internalIsEditing;
  const [editData, setEditData] = useState<PersonalProjectItem[]>(data || []);

  const setIsEditing = (editing: boolean) => {
    if (onEditingChange) {
      onEditingChange(editing);
    } else {
      setInternalIsEditing(editing);
    }
  };

  // Expose ref methods
  React.useImperativeHandle(ref, () => ({
    startEditing: () => setIsEditing(true),
    isEditing
  }));

  const startEditing = () => {
    setEditData(data || []);
    setIsEditing(true);
  };

  const saveChanges = () => {
    onChange(editData);
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setEditData(data || []);
    setIsEditing(false);
  };

  const addProject = () => {
    const newProject: PersonalProjectItem = {
      id: uuidv4(),
      name: '',
      description: '',
      technologies: [],
      startDate: '',
      endDate: '',
      status: 'PLANNED',
      isNew: true
    };
    setEditData([...editData, newProject]);
  };

  const removeProject = (index: number) => {
    setEditData(editData.filter((_, i) => i !== index));
  };

  const updateProject = (index: number, field: string, value: any) => {
    const updated = [...editData];
    if (field === 'technologies' && typeof value === 'string') {
      // Split comma-separated technologies
      updated[index] = { 
        ...updated[index], 
        [field]: value.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0)
      };
    } else if (field === 'highlights' && typeof value === 'string') {
      // Split comma-separated highlights
      updated[index] = { 
        ...updated[index], 
        [field]: value.split(',').map(highlight => highlight.trim()).filter(highlight => highlight.length > 0)
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setEditData(updated);
  };

  const addHighlight = (projectIndex: number) => {
    const updated = [...editData];
    if (!updated[projectIndex].highlights) {
      updated[projectIndex].highlights = [];
    }
    updated[projectIndex].highlights!.push('');
    setEditData(updated);
  };

  const updateHighlight = (projectIndex: number, highlightIndex: number, value: string) => {
    const updated = [...editData];
    if (updated[projectIndex].highlights) {
      updated[projectIndex].highlights![highlightIndex] = value;
      setEditData(updated);
    }
  };

  const removeHighlight = (projectIndex: number, highlightIndex: number) => {
    const updated = [...editData];
    if (updated[projectIndex].highlights) {
      updated[projectIndex].highlights = updated[projectIndex].highlights!.filter((_, i) => i !== highlightIndex);
      setEditData(updated);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground" data-testid="personal-projects-empty">
        <Code className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>No personal projects found in your CV.</p>
        {isEditing && (
          <Button onClick={addProject} className="mt-4" variant="elevated">
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        )}
      </div>
    );
  }

  const projectsToShow = isEditing ? editData : data;

  return (
    <div className="space-y-4" data-testid="personal-projects-display">
      {!isEditing && (
        <div className="flex justify-end mb-4">
          <Button onClick={startEditing} variant="elevated" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Projects
          </Button>
        </div>
      )}

      {isEditing && (
        <div className="flex justify-end gap-2 mb-4">
          <Button onClick={addProject} variant="elevated" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
          <Button onClick={saveChanges} variant="default" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button onClick={cancelEditing} variant="outlined" size="sm">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}

      <AnimatePresence>
        {projectsToShow.map((project, index) => {
          const projectPath = createPath('personalProjects', index);
          const projectSuggestions = findSuggestionsForPath(suggestions, projectPath);
          
          return (
            <motion.div
              key={project.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "border border-base-300/50 rounded-lg p-6",
                project.isNew && "ring-2 ring-primary/20"
              )}
              data-testid={`personal-project-${index}`}
            >
              {isEditing && (
                <div className="flex justify-end mb-4">
                  <Button 
                    onClick={() => removeProject(index)} 
                    variant="outlined"
                    size="sm"
                    className="text-error hover:bg-error/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                {/* Project Name and Status */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <Label htmlFor={`project-name-${index}`}>Project Name *</Label>
                        <Input
                          id={`project-name-${index}`}
                          value={project.name || ''}
                          onChange={(e) => updateProject(index, 'name', e.target.value)}
                          placeholder="Enter project name"
                          variant="elevated"
                        />
                      </div>
                    ) : (
                      <h3 className="text-xl font-semibold text-base-content flex items-center gap-2">
                        <Code className="h-5 w-5 text-primary" />
                        {project.name || 'Untitled Project'}
                      </h3>
                    )}
                  </div>
                  
                  {project.status && (
                    <div className={`badge ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Label htmlFor={`project-description-${index}`}>Description</Label>
                      <Textarea
                        id={`project-description-${index}`}
                        value={project.description || ''}
                        onChange={(e) => updateProject(index, 'description', e.target.value)}
                        placeholder="Describe your project..."
                        rows={3}
                        variant="elevated"
                      />
                    </div>
                  ) : (
                    project.description && (
                      <p className="text-base-content/80">{project.description}</p>
                    )
                  )}
                </div>

                {/* Technologies */}
                <div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Label htmlFor={`project-technologies-${index}`}>Technologies</Label>
                      <Input
                        id={`project-technologies-${index}`}
                        value={project.technologies?.join(', ') || ''}
                        onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                        placeholder="React, Node.js, MongoDB, etc."
                        variant="elevated"
                      />
                      <p className="text-sm text-base-content/60">Separate technologies with commas</p>
                    </div>
                  ) : (
                    project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, techIndex) => (
                          <span 
                            key={techIndex}
                            className="badge badge-outline badge-primary"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )
                  )}
                </div>

                {/* Project Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Repository */}
                  <div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Label htmlFor={`project-repository-${index}`}>Repository URL</Label>
                        <Input
                          id={`project-repository-${index}`}
                          value={project.repository || ''}
                          onChange={(e) => updateProject(index, 'repository', e.target.value)}
                          placeholder="https://github.com/..."
                          variant="elevated"
                        />
                      </div>
                    ) : (
                      project.repository && (
                        <a 
                          href={project.repository} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                        >
                          <Github className="h-4 w-4" />
                          Repository
                        </a>
                      )
                    )}
                  </div>

                  {/* Live URL */}
                  <div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Label htmlFor={`project-live-url-${index}`}>Live URL</Label>
                        <Input
                          id={`project-live-url-${index}`}
                          value={project.liveUrl || ''}
                          onChange={(e) => updateProject(index, 'liveUrl', e.target.value)}
                          placeholder="https://myproject.com"
                          variant="elevated"
                        />
                      </div>
                    ) : (
                      project.liveUrl && (
                        <a 
                          href={project.liveUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Live Demo
                        </a>
                      )
                    )}
                  </div>

                  {/* General URL */}
                  <div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Label htmlFor={`project-url-${index}`}>Project URL</Label>
                        <Input
                          id={`project-url-${index}`}
                          value={project.url || ''}
                          onChange={(e) => updateProject(index, 'url', e.target.value)}
                          placeholder="https://..."
                          variant="elevated"
                        />
                      </div>
                    ) : (
                      project.url && !project.liveUrl && !project.repository && (
                        <a 
                          href={project.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Project
                        </a>
                      )
                    )}
                  </div>
                </div>

                {/* Project Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Date Range */}
                  <div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Label>Project Timeline</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={project.startDate || ''}
                            onChange={(e) => updateProject(index, 'startDate', e.target.value)}
                            placeholder="2024-01"
                            variant="elevated"
                          />
                          <Input
                            value={project.endDate || ''}
                            onChange={(e) => updateProject(index, 'endDate', e.target.value)}
                            placeholder="2024-06"
                            variant="elevated"
                          />
                        </div>
                        <p className="text-sm text-base-content/60">Format: YYYY-MM</p>
                      </div>
                    ) : (
                      (project.startDate || project.endDate) && (
                        <div className="flex items-center gap-2 text-base-content/70">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {formatDateRange(project.startDate, project.endDate)}
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  {/* Team Size */}
                  <div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Label htmlFor={`project-team-size-${index}`}>Team Size</Label>
                        <Input
                          id={`project-team-size-${index}`}
                          type="number"
                          value={project.teamSize || ''}
                          onChange={(e) => updateProject(index, 'teamSize', parseInt(e.target.value) || null)}
                          placeholder="1"
                          variant="elevated"
                        />
                      </div>
                    ) : (
                      project.teamSize && (
                        <div className="flex items-center gap-2 text-base-content/70">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">Team of {project.teamSize}</span>
                        </div>
                      )
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Label htmlFor={`project-role-${index}`}>Your Role</Label>
                        <Input
                          id={`project-role-${index}`}
                          value={project.role || ''}
                          onChange={(e) => updateProject(index, 'role', e.target.value)}
                          placeholder="Full Stack Developer"
                          variant="elevated"
                        />
                      </div>
                    ) : (
                      project.role && (
                        <div className="text-sm text-base-content/70">
                          <strong>Role:</strong> {project.role}
                        </div>
                      )
                    )}
                  </div>

                  {/* Status (editing mode) */}
                  {isEditing && (
                    <div className="space-y-2">
                      <Label htmlFor={`project-status-${index}`}>Status</Label>
                      <select
                        id={`project-status-${index}`}
                        value={project.status || 'PLANNED'}
                        onChange={(e) => updateProject(index, 'status', e.target.value)}
                        className="select select-bordered w-full"
                      >
                        <option value="PLANNED">Planned</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Project Highlights */}
                <div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Key Highlights</Label>
                        <Button 
                          onClick={() => addHighlight(index)} 
                          variant="outlined" 
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Highlight
                        </Button>
                      </div>
                      {project.highlights?.map((highlight, highlightIndex) => (
                        <div key={highlightIndex} className="flex items-center gap-2">
                          <Input
                            value={highlight}
                            onChange={(e) => updateHighlight(index, highlightIndex, e.target.value)}
                            placeholder="Key achievement or highlight"
                            variant="elevated"
                            className="flex-1"
                          />
                          <Button
                            onClick={() => removeHighlight(index, highlightIndex)}
                            variant="outlined"
                            size="sm"
                            className="text-error hover:bg-error/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    project.highlights && project.highlights.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-base-content font-medium">
                          <Lightbulb className="h-4 w-4 text-warning" />
                          Key Highlights
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-base-content/80">
                          {project.highlights.map((highlight, highlightIndex) => (
                            <li key={highlightIndex}>{highlight}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </div>

                {/* Suggestions for this project */}
                {projectSuggestions.length > 0 && (
                  <SuggestionManager 
                    section={projectPath} 
                    className="mt-4"
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
});

PersonalProjectsDisplay.displayName = 'PersonalProjectsDisplay';