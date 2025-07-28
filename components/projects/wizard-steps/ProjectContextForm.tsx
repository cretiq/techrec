// Project Context Form - Single-responsibility component
// Follows established daisyUI form patterns with Redux integration

'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  updateEnhancementContext,
  selectEnhancementContext
} from '@/lib/features/projectEnhancementSlice';

interface ProjectContextFormProps {
  onContextChange?: (context: any) => void;
}

/**
 * Project Context Form Component
 * Single-responsibility: Collect additional project context using daisyUI form controls
 */
export const ProjectContextForm: React.FC<ProjectContextFormProps> = ({
  onContextChange
}) => {
  const dispatch = useDispatch();
  const context = useSelector(selectEnhancementContext);

  const handleFieldChange = (field: string, value: string) => {
    const updatedContext = { ...context, [field]: value };
    dispatch(updateEnhancementContext({ [field]: value }));
    onContextChange?.(updatedContext);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Add Project Context</h3>
        <p className="text-base-content/60">
          Provide additional details to create a more compelling CV description
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Challenge/Problem */}
        <div className="form-control md:col-span-2">
          <label className="label">
            <span className="label-text font-medium">What challenge did this project solve?</span>
            <span className="label-text-alt text-info">Helps highlight problem-solving skills</span>
          </label>
          <textarea
            className="textarea textarea-bordered min-h-[100px]"
            placeholder="Describe the specific problem or challenge your project addressed..."
            value={context.challenges || ''}
            onChange={(e) => handleFieldChange('challenges', e.target.value)}
          />
          <label className="label">
            <span className="label-text-alt">Be specific about the problem and why it needed solving</span>
          </label>
        </div>

        {/* Personal Role */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Your Role & Contributions</span>
            <span className="label-text-alt text-info">Shows leadership and initiative</span>
          </label>
          <textarea
            className="textarea textarea-bordered min-h-[80px]"
            placeholder="I led the development of... I was responsible for... I contributed by..."
            value={context.personalRole || ''}
            onChange={(e) => handleFieldChange('personalRole', e.target.value)}
          />
        </div>

        {/* Team Context */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Team Size & Collaboration</span>
            <span className="label-text-alt text-info">Demonstrates teamwork ability</span>
          </label>
          <select
            className="select select-bordered"
            value={context.teamSize || ''}
            onChange={(e) => handleFieldChange('teamSize', e.target.value)}
          >
            <option value="">Select team size</option>
            <option value="Solo project">Solo project</option>
            <option value="2-3 people">2-3 people</option>
            <option value="4-6 people">4-6 people</option>
            <option value="7-10 people">7-10 people</option>
            <option value="10+ people">10+ people</option>
          </select>
          {context.teamSize && context.teamSize !== 'Solo project' && (
            <textarea
              className="textarea textarea-bordered mt-2 min-h-[60px]"
              placeholder="Describe your collaboration approach, team dynamics, or leadership role..."
              value={context.context || ''}
              onChange={(e) => handleFieldChange('context', e.target.value)}
            />
          )}
        </div>

        {/* Project Duration */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Project Duration</span>
            <span className="label-text-alt text-info">Shows project scope</span>
          </label>
          <select
            className="select select-bordered"
            value={context.duration || ''}
            onChange={(e) => handleFieldChange('duration', e.target.value)}
          >
            <option value="">Select duration</option>
            <option value="1-2 weeks">1-2 weeks</option>
            <option value="1 month">1 month</option>
            <option value="2-3 months">2-3 months</option>
            <option value="3-6 months">3-6 months</option>
            <option value="6+ months">6+ months</option>
            <option value="Ongoing">Ongoing project</option>
          </select>
        </div>

        {/* Achievements */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Key Achievements</span>
            <span className="label-text-alt text-info">Quantify your impact</span>
          </label>
          <textarea
            className="textarea textarea-bordered min-h-[80px]"
            placeholder="Reduced load time by 40%... Increased user engagement by... Built feature used by X users..."
            value={context.achievements || ''}
            onChange={(e) => handleFieldChange('achievements', e.target.value)}
          />
          <label className="label">
            <span className="label-text-alt">Include numbers, percentages, and measurable outcomes</span>
          </label>
        </div>

        {/* Impact */}
        <div className="form-control md:col-span-2">
          <label className="label">
            <span className="label-text font-medium">Business/User Impact</span>
            <span className="label-text-alt text-info">Shows business value understanding</span>
          </label>
          <textarea
            className="textarea textarea-bordered min-h-[100px]"
            placeholder="This project improved user experience by... Helped the business by... Solved the problem of..."
            value={context.impact || ''}
            onChange={(e) => handleFieldChange('impact', e.target.value)}
          />
          <label className="label">
            <span className="label-text-alt">Focus on the value delivered to users or the business</span>
          </label>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-base-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Context Completion</span>
          <span className="text-sm text-base-content/60">
            {Object.values(context).filter(Boolean).length}/6 fields
          </span>
        </div>
        <div className="w-full bg-base-300 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(Object.values(context).filter(Boolean).length / 6) * 100}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProjectContextForm;