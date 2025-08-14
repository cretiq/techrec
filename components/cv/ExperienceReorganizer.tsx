'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui-daisy/button';
import { Card } from '@/components/ui-daisy/card';
import { Badge } from '@/components/ui-daisy/badge';
import { cn } from '@/lib/utils';
import { 
  GripVertical, 
  Merge, 
  Split, 
  ChevronRight,
  ChevronDown,
  Undo,
  Redo,
  Save,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { SortableExperienceItem } from './SortableExperienceItem';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Experience {
  id: string;
  title: string;
  company: string;
  description: string;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  current: boolean;
  responsibilities: string[];
  achievements: string[];
  teamSize?: number | null;
  techStack: string[];
  parentId?: string | null;
  children?: Experience[];
  displayOrder: number;
  mergedFrom?: string[];
}

interface ExperienceReorganizerProps {
  experiences: Experience[];
  onSave: (experiences: Experience[]) => Promise<void>;
  onReanalyze?: () => void;
  cvId?: string;
}

interface EditAction {
  type: 'reorder' | 'nest' | 'unnest' | 'merge';
  timestamp: number;
  previousState: Experience[];
}

export function ExperienceReorganizer({ 
  experiences: initialExperiences, 
  onSave,
  onReanalyze,
  cvId,
}: ExperienceReorganizerProps) {
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<EditAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Organize experiences into hierarchical structure
  const organizeExperiences = (exps: Experience[]): Experience[] => {
    const rootExperiences = exps.filter(e => !e.parentId);
    const childMap = new Map<string, Experience[]>();
    
    exps.filter(e => e.parentId).forEach(child => {
      const siblings = childMap.get(child.parentId!) || [];
      siblings.push(child);
      childMap.set(child.parentId!, siblings);
    });

    return rootExperiences.map(parent => ({
      ...parent,
      children: childMap.get(parent.id) || [],
    })).sort((a, b) => a.displayOrder - b.displayOrder);
  };

  const [organizedExperiences, setOrganizedExperiences] = useState<Experience[]>(
    organizeExperiences(initialExperiences)
  );

  useEffect(() => {
    setOrganizedExperiences(organizeExperiences(experiences));
    setHasChanges(JSON.stringify(experiences) !== JSON.stringify(initialExperiences));
  }, [experiences, initialExperiences]);

  // Add to history
  const addToHistory = (action: Omit<EditAction, 'timestamp' | 'previousState'>) => {
    const newAction: EditAction = {
      ...action,
      timestamp: Date.now(),
      previousState: [...experiences],
    };
    
    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newAction);
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo/Redo functionality
  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    if (canUndo) {
      const action = history[historyIndex];
      setExperiences(action.previousState);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      const nextIndex = historyIndex + 1;
      const nextAction = history[nextIndex];
      
      // Apply the action forward
      setHistoryIndex(nextIndex);
      
      // Get the state after this action
      if (nextIndex < history.length - 1) {
        setExperiences(history[nextIndex + 1].previousState);
      } else {
        // This was the last action, need to reapply it
        // For now, we'll just use the current state
        // In production, we'd store the result state too
      }
    }
  };

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = experiences.findIndex(e => e.id === active.id);
      const newIndex = experiences.findIndex(e => e.id === over.id);
      
      const newExperiences = arrayMove(experiences, oldIndex, newIndex)
        .map((exp, index) => ({ ...exp, displayOrder: index }));
      
      setExperiences(newExperiences);
      addToHistory({ type: 'reorder' });
    }
  };

  // Selection handlers
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Nesting handlers
  const handleNest = () => {
    if (selectedIds.size !== 2) {
      toast.error('Please select exactly 2 experiences to nest');
      return;
    }
    
    const [childId, parentId] = Array.from(selectedIds);
    const newExperiences = experiences.map(exp => {
      if (exp.id === childId) {
        return { ...exp, parentId };
      }
      return exp;
    });
    
    setExperiences(newExperiences);
    addToHistory({ type: 'nest' });
    setSelectedIds(new Set());
    toast.success('Experience nested successfully');
  };

  const handleUnnest = (experienceId: string) => {
    const newExperiences = experiences.map(exp => {
      if (exp.id === experienceId) {
        return { ...exp, parentId: null };
      }
      return exp;
    });
    
    setExperiences(newExperiences);
    addToHistory({ type: 'unnest' });
    toast.success('Experience unnested successfully');
  };

  // Merge handler
  const handleMerge = async () => {
    if (selectedIds.size < 2) {
      toast.error('Please select at least 2 experiences to merge');
      return;
    }

    const selectedExperiences = experiences.filter(e => selectedIds.has(e.id));
    
    // Check if any selected experience has children
    if (selectedExperiences.some(e => experiences.some(child => child.parentId === e.id))) {
      toast.error('Cannot merge experiences that have nested items');
      return;
    }

    // Create merged experience
    const mergedExperience: Experience = {
      id: `merged-${Date.now()}`,
      title: selectedExperiences[0].title,
      company: selectedExperiences[0].company,
      description: selectedExperiences.map(e => e.description).filter(Boolean).join('\n\n'),
      location: selectedExperiences[0].location,
      startDate: selectedExperiences.reduce((earliest, e) => 
        new Date(e.startDate) < new Date(earliest) ? e.startDate : earliest, 
        selectedExperiences[0].startDate
      ),
      endDate: selectedExperiences.some(e => e.current) 
        ? null 
        : selectedExperiences.reduce((latest, e) => 
            e.endDate && (!latest || new Date(e.endDate) > new Date(latest)) ? e.endDate : latest,
            selectedExperiences[0].endDate
          ),
      current: selectedExperiences.some(e => e.current),
      responsibilities: [...new Set(selectedExperiences.flatMap(e => e.responsibilities))],
      achievements: [...new Set(selectedExperiences.flatMap(e => e.achievements))],
      techStack: [...new Set(selectedExperiences.flatMap(e => e.techStack))],
      teamSize: Math.max(...selectedExperiences.map(e => e.teamSize || 0).filter(Boolean)),
      displayOrder: Math.min(...selectedExperiences.map(e => e.displayOrder)),
      mergedFrom: Array.from(selectedIds),
    };

    // Remove selected experiences and add merged one
    const newExperiences = experiences
      .filter(e => !selectedIds.has(e.id))
      .concat(mergedExperience)
      .sort((a, b) => a.displayOrder - b.displayOrder);
    
    setExperiences(newExperiences);
    addToHistory({ type: 'merge' });
    setSelectedIds(new Set());
    toast.success(`Merged ${selectedIds.size} experiences successfully`);
  };

  // Save handler
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(experiences);
      setHasChanges(false);
      toast.success('Changes saved successfully');
    } catch (error) {
      toast.error('Failed to save changes');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset handler
  const handleReset = () => {
    setExperiences(initialExperiences);
    setHistory([]);
    setHistoryIndex(-1);
    setSelectedIds(new Set());
    setHasChanges(false);
    toast.info('Reset to original state');
  };

  const activeExperience = experiences.find(e => e.id === activeId);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card variant="bordered" className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={!canUndo}
              className="gap-2"
            >
              <Undo className="h-4 w-4" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={!canRedo}
              className="gap-2"
            >
              <Redo className="h-4 w-4" />
              Redo
            </Button>
            
            <div className="h-8 w-px bg-base-300" />
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNest}
              disabled={selectedIds.size !== 2}
              className="gap-2"
            >
              <ChevronRight className="h-4 w-4" />
              Nest
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMerge}
              disabled={selectedIds.size < 2}
              className="gap-2"
            >
              <Merge className="h-4 w-4" />
              Merge ({selectedIds.size})
            </Button>
            
            {onReanalyze && (
              <>
                <div className="h-8 w-px bg-base-300" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReanalyze}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Re-analyze
                </Button>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="warning" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Unsaved changes
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={!hasChanges}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Drag and drop area */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={organizedExperiences.map(e => e.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {organizedExperiences.map((experience) => (
              <SortableExperienceItem
                key={experience.id}
                experience={experience}
                isSelected={selectedIds.has(experience.id)}
                onToggleSelection={toggleSelection}
                onUnnest={handleUnnest}
                isExpanded={expandedIds.has(experience.id)}
                onToggleExpand={(id) => {
                  const newExpanded = new Set(expandedIds);
                  if (newExpanded.has(id)) {
                    newExpanded.delete(id);
                  } else {
                    newExpanded.add(id);
                  }
                  setExpandedIds(newExpanded);
                }}
              />
            ))}
          </div>
        </SortableContext>
        
        <DragOverlay>
          {activeId && activeExperience ? (
            <Card variant="elevated" className="p-4 shadow-lg opacity-90">
              <div className="font-semibold">{activeExperience.title}</div>
              <div className="text-sm text-base-content/70">{activeExperience.company}</div>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}