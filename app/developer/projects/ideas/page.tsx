'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import { 
  generateProjectIdeas,
  selectProjectIdeas,
  selectIsLoading,
  selectError,
  clearError
} from '@/lib/features/projectEnhancementSlice';
import {
  LightBulbIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  SparklesIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
  ClockIcon,
  StarIcon,
  ChevronRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui-daisy/button';
import { Card } from '@/components/ui-daisy/card';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui-daisy/badge';

// Types for FR #24 implementation
interface QuestionnaireResponse {
  problemStatement?: string;
  problemStatementPills: string[];
  projectScope?: string;
  learningGoals: string[];
  targetUsers?: string;
  platformPreference?: string;
}
interface ProjectIdea {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  skills: string[];
  tools: string[];
  description: string;
  timeEstimate: string;
  keyFeatures: string[];
}

// Local questionnaire state (specific to FR #24 - not in Redux yet)
interface LocalQuestionnaireState {
  currentStep: number;
  responses: QuestionnaireResponse;
  userSkills: string[];
}

const QUESTIONNAIRE_STEPS = [
  'problem',
  'scope', 
  'learning',
  'users',
  'platform'
];

const BRAINSTORMING_PILLS = {
  problem: [
    'Organize my schedule',
    'Track my expenses', 
    'Find nearby services',
    'Learn new skills',
    'Stay in touch with friends',
    'Manage my tasks',
    'Monitor my health',
    'Plan my meals'
  ],
  scope: ['Weekend project', '1-2 weeks', '1 month', '2+ months'],
  learning: [
    'New framework',
    'Backend skills', 
    'Mobile development',
    'UI/UX design',
    'Database management',
    'API development',
    'Cloud services',
    'Testing strategies'
  ],
  users: ['Just me', 'Friends/family', 'General public', 'Small businesses', 'Developers'],
  platform: ['Web app', 'Mobile app', 'Desktop app', 'API/Backend', 'Chrome extension']
};

export default function ProjectIdeasPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const projectIdeas = useSelector(selectProjectIdeas);
  const isGenerating = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  
  // Local questionnaire state (TODO: Move to Redux slice extension)
  const [localState, setLocalState] = useState<LocalQuestionnaireState>({
    currentStep: 0,
    responses: {
      problemStatementPills: [],
      learningGoals: [],
    },
    userSkills: []
  });
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // Load user skills on component mount
  useEffect(() => {
    const loadUserSkills = async () => {
      if (!session?.user?.id) {
        setIsProfileLoading(false);
        return;
      }

      try {
        // TODO: Implement API call to get user skills from profile
        // For now, using placeholder skills
        const skills = ['JavaScript', 'React', 'Node.js', 'TypeScript'];
        setLocalState(prev => ({ 
          ...prev, 
          userSkills: skills
        }));
        setIsProfileLoading(false);
      } catch (error) {
        console.error('Error loading user skills:', error);
        setIsProfileLoading(false);
      }
    };

    loadUserSkills();
  }, [session]);

  const updateResponse = (field: keyof QuestionnaireResponse, value: any) => {
    setLocalState(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [field]: value
      }
    }));
  };

  const togglePill = (category: keyof typeof BRAINSTORMING_PILLS, pill: string) => {
    if (category === 'problem') {
      const currentPills = localState.responses.problemStatementPills;
      const newPills = currentPills.includes(pill)
        ? currentPills.filter(p => p !== pill)
        : [...currentPills, pill];
      updateResponse('problemStatementPills', newPills);
    } else if (category === 'learning') {
      const currentGoals = localState.responses.learningGoals;
      const newGoals = currentGoals.includes(pill)
        ? currentGoals.filter(g => g !== pill)
        : [...currentGoals, pill];
      updateResponse('learningGoals', newGoals);
    } else {
      // Single-select fields
      const fieldMap = {
        scope: 'projectScope',
        users: 'targetUsers', 
        platform: 'platformPreference'
      };
      updateResponse(fieldMap[category] as keyof QuestionnaireResponse, pill);
    }
  };

  const nextStep = () => {
    if (localState.currentStep < QUESTIONNAIRE_STEPS.length - 1) {
      setLocalState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }
  };

  const prevStep = () => {
    if (localState.currentStep > 0) {
      setLocalState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  };

  const canProceed = () => {
    const currentStepKey = QUESTIONNAIRE_STEPS[localState.currentStep];
    const { responses } = localState;
    
    switch (currentStepKey) {
      case 'problem':
        return responses.problemStatement || responses.problemStatementPills.length > 0;
      case 'scope':
        return !!responses.projectScope;
      case 'learning': 
        return responses.learningGoals.length > 0;
      case 'users':
        return !!responses.targetUsers;
      case 'platform':
        return !!responses.platformPreference;
      default:
        return false;
    }
  };

  const handleGenerateProjectIdeas = async () => {
    dispatch(clearError());

    try {
      await dispatch(generateProjectIdeas({
        skills: localState.userSkills,
        experienceLevel: 'beginner', // Could be dynamic based on user profile
        problemStatement: localState.responses.problemStatement || localState.responses.problemStatementPills.join(', '),
        projectScope: localState.responses.projectScope,
        learningGoals: localState.responses.learningGoals,
        targetUsers: localState.responses.targetUsers,
        platformPreference: localState.responses.platformPreference
      })).unwrap();
    } catch (error) {
      console.error('Error generating project ideas:', error);
    }
  };

  const handleProjectSelect = (project: ProjectIdea) => {
    // Navigate to project planning page (NOT CV enhancement wizard)
    router.push(`/developer/projects/plan/${project.id}`);
  };

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-base-content/60">Loading your profile...</p>
        </div>
      </div>
    );
  };

  const currentStepKey = QUESTIONNAIRE_STEPS[localState.currentStep];
  const isLastStep = localState.currentStep === QUESTIONNAIRE_STEPS.length - 1;
  const showResults = projectIdeas.length > 0;

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
            >
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
                <LightBulbIcon className="w-8 h-8 text-primary" />
                Project Ideas Generator
              </h1>
              <p className="text-base-content/60 mt-1">
                Answer a few questions to get personalized project ideas
              </p>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        {!showResults && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-base-content/60">
                Step {localState.currentStep + 1} of {QUESTIONNAIRE_STEPS.length}
              </span>
              <span className="text-sm text-base-content/60">
                {Math.round(((localState.currentStep + 1) / QUESTIONNAIRE_STEPS.length) * 100)}% complete
              </span>
            </div>
            <div className="w-full bg-base-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((localState.currentStep + 1) / QUESTIONNAIRE_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Questionnaire */}
        {!showResults && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepKey}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8">
                {/* Question content */}
                <div className="mb-8">
                  {currentStepKey === 'problem' && (
                    <div>
                      <h2 className="text-2xl font-bold text-base-content mb-4">
                        Do you have any problem in your everyday life that could be solved with software?
                      </h2>
                      <div className="space-y-4">
                        <textarea
                          className="textarea textarea-bordered w-full"
                          rows={3}
                          placeholder="Describe a problem you'd like to solve... (optional)"
                          value={localState.responses.problemStatement || ''}
                          onChange={(e) => updateResponse('problemStatement', e.target.value)}
                        />
                        <div>
                          <p className="text-sm text-base-content/60 mb-3">Or choose from these ideas:</p>
                          <div className="flex flex-wrap gap-2">
                            {BRAINSTORMING_PILLS.problem.map(pill => (
                              <Badge
                                key={pill}
                                variant={localState.responses.problemStatementPills.includes(pill) ? 'primary' : 'outline'}
                                className="cursor-pointer hover:shadow-sm transition-all"
                                onClick={() => togglePill('problem', pill)}
                              >
                                {pill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStepKey === 'scope' && (
                    <div>
                      <h2 className="text-2xl font-bold text-base-content mb-4">
                        How much time can you dedicate?
                      </h2>
                      <div className="grid grid-cols-2 gap-3">
                        {BRAINSTORMING_PILLS.scope.map(pill => (
                          <Button
                            key={pill}
                            variant={localState.responses.projectScope === pill ? 'primary' : 'outline'}
                            size="lg"
                            className="justify-start"
                            onClick={() => togglePill('scope', pill)}
                          >
                            {pill}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStepKey === 'learning' && (
                    <div>
                      <h2 className="text-2xl font-bold text-base-content mb-4">
                        What would you like to learn/improve?
                      </h2>
                      <p className="text-base-content/60 mb-4">Select all that apply</p>
                      <div className="grid grid-cols-2 gap-3">
                        {BRAINSTORMING_PILLS.learning.map(pill => (
                          <Button
                            key={pill}
                            variant={localState.responses.learningGoals.includes(pill) ? 'primary' : 'outline'}
                            size="lg"
                            className="justify-start"
                            onClick={() => togglePill('learning', pill)}
                            leftIcon={localState.responses.learningGoals.includes(pill) ? <CheckCircleIcon className="w-5 h-5" /> : undefined}
                          >
                            {pill}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStepKey === 'users' && (
                    <div>
                      <h2 className="text-2xl font-bold text-base-content mb-4">
                        Who would use this app?
                      </h2>
                      <div className="grid grid-cols-1 gap-3">
                        {BRAINSTORMING_PILLS.users.map(pill => (
                          <Button
                            key={pill}
                            variant={localState.responses.targetUsers === pill ? 'primary' : 'outline'}
                            size="lg"
                            className="justify-start"
                            onClick={() => togglePill('users', pill)}
                          >
                            {pill}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStepKey === 'platform' && (
                    <div>
                      <h2 className="text-2xl font-bold text-base-content mb-4">
                        What type of app interests you?
                      </h2>
                      <div className="grid grid-cols-1 gap-3">
                        {BRAINSTORMING_PILLS.platform.map(pill => (
                          <Button
                            key={pill}
                            variant={localState.responses.platformPreference === pill ? 'primary' : 'outline'}
                            size="lg"
                            className="justify-start"
                            onClick={() => togglePill('platform', pill)}
                          >
                            {pill}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-between">
                  <Button
                    variant="ghost"
                    onClick={prevStep}
                    disabled={localState.currentStep === 0}
                    leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
                  >
                    Previous
                  </Button>

                  {isLastStep ? (
                    <Button
                      onClick={handleGenerateProjectIdeas}
                      disabled={!canProceed() || isGenerating}
                      leftIcon={isGenerating ? undefined : <SparklesIcon className="w-5 h-5" />}
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating Ideas...
                        </>
                      ) : (
                        'Generate Project Ideas'
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={nextStep}
                      disabled={!canProceed()}
                      rightIcon={<ArrowRightIcon className="w-4 h-4" />}
                    >
                      Continue
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Project Ideas Results */}
        {showResults && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-base-content">
                Project Ideas for You
              </h2>
              <Button
                variant="outline"
                onClick={() => setLocalState(prev => ({ ...prev, currentStep: 0 }))}
                leftIcon={<SparklesIcon className="w-4 h-4" />}
              >
                Start Over
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {projectIdeas.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-6 h-full flex flex-col hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-base-content flex-1 pr-2">
                        {project.title}
                      </h3>
                      <Badge variant={project.difficulty === 'Beginner' ? 'success' : project.difficulty === 'Intermediate' ? 'warning' : 'error'}>
                        {project.difficulty}
                      </Badge>
                    </div>

                    <p className="text-base-content/70 text-sm mb-4 flex-1">
                      {project.description}
                    </p>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-base-content/80 mb-1 flex items-center gap-1">
                          <CodeBracketIcon className="w-3 h-3" />
                          Technologies
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {project.skills.slice(0, 4).map((skill, index) => (
                            <Badge key={index} variant="outline" size="sm">
                              {skill}
                            </Badge>
                          ))}
                          {project.skills.length > 4 && (
                            <Badge variant="outline" size="sm">
                              +{project.skills.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-base-content/60">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {project.timeEstimate}
                        </span>
                        <span className="flex items-center gap-1">
                          <StarIcon className="w-3 h-3" />
                          {project.keyFeatures.length} features
                        </span>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full mt-4"
                        onClick={() => handleProjectSelect(project)}
                        rightIcon={<ChevronRightIcon className="w-4 h-4" />}
                      >
                        Start Building
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
