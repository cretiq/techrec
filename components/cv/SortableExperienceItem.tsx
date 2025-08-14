'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui-daisy/card';
import { Button } from '@/components/ui-daisy/button';
import { Badge } from '@/components/ui-daisy/badge';
// Using native checkbox with DaisyUI classes
import { cn } from '@/lib/utils';
import {
  GripVertical,
  ChevronRight,
  ChevronDown,
  Split,
  Calendar,
  MapPin,
  Users,
  Code,
  Trophy,
  Briefcase,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

interface SortableExperienceItemProps {
  experience: Experience;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onUnnest: (id: string) => void;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  depth?: number;
}

export function SortableExperienceItem({
  experience,
  isSelected,
  onToggleSelection,
  onUnnest,
  isExpanded,
  onToggleExpand,
  depth = 0,
}: SortableExperienceItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: experience.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasChildren = experience.children && experience.children.length > 0;
  const isNested = depth > 0;

  // Format dates
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const dateRange = `${formatDate(experience.startDate)} - ${
    experience.current ? 'Present' : experience.endDate ? formatDate(experience.endDate) : 'Present'
  }`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'transition-all',
        isDragging && 'opacity-50',
        isNested && 'ml-8'
      )}
    >
      <Card
        variant="bordered"
        className={cn(
          'p-4 transition-all',
          isSelected && 'ring-2 ring-primary ring-opacity-50 bg-primary/5',
          isNested && 'border-l-4 border-primary/30'
        )}
      >
        <div className="flex items-start gap-3">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5 text-base-content opacity-50" />
          </div>

          {/* Selection checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(experience.id)}
            className="checkbox checkbox-primary mt-1"
          />

          {/* Expand/collapse button if has children */}
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleExpand(experience.id)}
              className="p-1"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Main content */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{experience.title}</h3>
                <p className="text-sm text-base-content opacity-70">{experience.company}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-base-content opacity-60">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {dateRange}
                  </span>
                  {experience.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {experience.location}
                    </span>
                  )}
                  {experience.teamSize && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {experience.teamSize} team members
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {experience.mergedFrom && experience.mergedFrom.length > 0 && (
                  <Badge variant="info" size="sm">
                    Merged ({experience.mergedFrom.length})
                  </Badge>
                )}
                {isNested && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUnnest(experience.id)}
                    className="gap-1"
                  >
                    <Split className="h-3 w-3" />
                    Unnest
                  </Button>
                )}
              </div>
            </div>

            {/* Description */}
            {experience.description && (
              <p className="text-sm text-base-content opacity-80 line-clamp-2">
                {experience.description}
              </p>
            )}

            {/* Skills and achievements summary */}
            <div className="flex flex-wrap gap-3">
              {experience.techStack.length > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <Code className="h-3 w-3 text-primary" />
                  <span className="text-base-content opacity-70">
                    {experience.techStack.length} skills
                  </span>
                </div>
              )}
              {experience.responsibilities.length > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <Briefcase className="h-3 w-3 text-primary" />
                  <span className="text-base-content opacity-70">
                    {experience.responsibilities.length} responsibilities
                  </span>
                </div>
              )}
              {experience.achievements.length > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <Trophy className="h-3 w-3 text-primary" />
                  <span className="text-base-content opacity-70">
                    {experience.achievements.length} achievements
                  </span>
                </div>
              )}
            </div>

            {/* Tech stack preview */}
            {experience.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {experience.techStack.slice(0, 5).map((tech, index) => (
                  <Badge key={index} variant="outline" size="sm">
                    {tech}
                  </Badge>
                ))}
                {experience.techStack.length > 5 && (
                  <Badge variant="outline" size="sm">
                    +{experience.techStack.length - 5} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Nested children */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 space-y-2 overflow-hidden"
            >
              {experience.children!.map((child) => (
                <SortableExperienceItem
                  key={child.id}
                  experience={child}
                  isSelected={isSelected}
                  onToggleSelection={onToggleSelection}
                  onUnnest={onUnnest}
                  isExpanded={false}
                  onToggleExpand={onToggleExpand}
                  depth={depth + 1}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}