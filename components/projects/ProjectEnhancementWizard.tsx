'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  CodeBracketIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  UserCircleIcon,
  CpuChipIcon,
  ChartBarIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui-daisy/button';
import { Card } from '@/components/ui-daisy/card';
import { Alert } from '@/components/ui-daisy/alert';
import { Badge } from '@/components/ui-daisy/badge';

// Types
import { GitHubRepository, GitHubUser } from '@/lib/github/repositoryService';
import { ReadmeAnalysis } from '@/utils/readmeAnalyzer';
import { ProjectIdea } from '@/utils/projectIdeasGenerator';

// Single-responsibility step components
import { GitHubRepositorySelector } from './wizard-steps/GitHubRepositorySelector';
import { ProjectContextForm } from './wizard-steps/ProjectContextForm';

interface ProjectEnhancementWizardProps {
  mode: 'github' | 'manual' | 'ideas';
  onComplete: (result: EnhancementResult) => void;
  onCancel: () => void;
}

interface EnhancementResult {
  mode: 'github' | 'manual' | 'ideas';
  projectData: any;
  enhancedDescription: string;
  cvDescription: string;
  narrative: {
    why: string;
    what: string;
    how: string;
  };
  pointsUsed: number;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  isValid: boolean;
  isOptional?: boolean;
}

/**
 * ProjectEnhancementWizard - Interactive flow for project enhancement
 */
export const ProjectEnhancementWizard: React.FC<ProjectEnhancementWizardProps> = ({
  mode,
  onComplete,
  onCancel
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data state
  const [githubRepositories, setGithubRepositories] = useState<GitHubRepository[]>([]);
  const [selectedRepository, setSelectedRepository] = useState<GitHubRepository | null>(null);
  const [readmeAnalysis, setReadmeAnalysis] = useState<ReadmeAnalysis | null>(null);
  const [projectIdeas, setProjectIdeas] = useState<ProjectIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<ProjectIdea | null>(null);
  const [enhancementData, setEnhancementData] = useState({
    context: '',
    achievements: '',
    challenges: '',
    impact: '',
    teamSize: '',
    duration: '',
    personalRole: ''
  });

  // Initialize wizard steps based on mode
  const getWizardSteps = (): WizardStep[] => {
    const baseSteps: WizardStep[] = [
      {
        id: 'intro',
        title: 'Getting Started',
        description: 'Welcome to project enhancement',
        component: IntroStep,
        isValid: true
      }
    ];

    if (mode === 'github') {
      return [
        ...baseSteps,
        {
          id: 'github-connect',
          title: 'Connect GitHub',
          description: 'Connect your GitHub account and select repositories',
          component: GitHubConnectStep,
          isValid: !!session?.user?.githubAccessToken
        },
        {
          id: 'repository-select',
          title: 'Select Repository',
          description: 'Choose a repository to enhance',
          component: (props: any) => <GitHubRepositorySelector onRepositorySelect={props.setSelectedRepository} />,
          isValid: !!selectedRepository
        },
        {
          id: 'analysis-review',
          title: 'Review Analysis',
          description: 'Review AI analysis of your project',
          component: AnalysisReviewStep,
          isValid: !!readmeAnalysis
        },
        {
          id: 'enhancement-details',
          title: 'Add Context',
          description: 'Provide additional project context',
          component: (props: any) => <ProjectContextForm onContextChange={props.setEnhancementData} />,
          isValid: true,
          isOptional: true
        },
        {
          id: 'generate-description',
          title: 'Generate Description',
          description: 'Create CV-ready project description',
          component: GenerateDescriptionStep,
          isValid: true
        }
      ];
    } else if (mode === 'ideas') {
      return [
        ...baseSteps,
        {
          id: 'ideas-selection',
          title: 'Choose Project Idea',
          description: 'Select from personalized project suggestions',
          component: IdeasSelectionStep,
          isValid: !!selectedIdea
        },
        {
          id: 'idea-customization',
          title: 'Customize Project',
          description: 'Adapt the idea to your preferences',
          component: IdeaCustomizationStep,
          isValid: true
        },
        {
          id: 'generate-plan',
          title: 'Generate Implementation Plan',
          description: 'Create detailed project plan and CV description',
          component: GeneratePlanStep,
          isValid: true
        }
      ];
    } else {
      return [
        ...baseSteps,
        {
          id: 'manual-input',
          title: 'Project Details',
          description: 'Enter your project information manually',
          component: ManualInputStep,
          isValid: true
        },
        {
          id: 'enhancement-details',
          title: 'Add Context',
          description: 'Provide additional project context',
          component: EnhancementDetailsStep,
          isValid: true
        },
        {
          id: 'generate-description',
          title: 'Generate Description',
          description: 'Create CV-ready project description',
          component: GenerateDescriptionStep,
          isValid: true
        }
      ];
    }
  };

  const steps = getWizardSteps();
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canGoNext = currentStepData?.isValid || currentStepData?.isOptional;
  const canGoBack = currentStep > 0;

  // Navigation
  const handleNext = async () => {
    if (!canGoNext) return;

    if (isLastStep) {
      await handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (canGoBack) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Generate the final result based on current data
      const result: EnhancementResult = {
        mode,
        projectData: mode === 'github' ? selectedRepository : mode === 'ideas' ? selectedIdea : enhancementData,
        enhancedDescription: 'Generated enhanced description', // Will be replaced by actual generation
        cvDescription: 'Generated CV description', // Will be replaced by actual generation
        narrative: {
          why: 'Generated why section',
          what: 'Generated what section', 
          how: 'Generated how section'
        },
        pointsUsed: 15 // Will be calculated based on actual points usage
      };
      
      onComplete(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to complete enhancement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Project Enhancement Wizard
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {mode === 'github' && 'Transform your GitHub projects into compelling CV entries'}
                  {mode === 'ideas' && 'Turn project ideas into actionable plans'}
                  {mode === 'manual' && 'Create professional project descriptions'}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  index <= currentStep
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {index < currentStep ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 transition-colors ${
                    index < currentStep ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Current step info */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {currentStepData?.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {currentStepData?.description}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" className="mb-6">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </Alert>
        )}

        {/* Step Content */}
        <Card className="mb-8 min-h-[400px]" data-testid="project-enhancement-wizard-card">
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                data-testid={`project-enhancement-wizard-step-${currentStepData?.id}`}
              >
                {currentStepData && (
                  <currentStepData.component
                    mode={mode}
                    session={session}
                    githubRepositories={githubRepositories}
                    setGithubRepositories={setGithubRepositories}
                    selectedRepository={selectedRepository}
                    setSelectedRepository={setSelectedRepository}
                    readmeAnalysis={readmeAnalysis}
                    setReadmeAnalysis={setReadmeAnalysis}
                    projectIdeas={projectIdeas}
                    setProjectIdeas={setProjectIdeas}
                    selectedIdea={selectedIdea}
                    setSelectedIdea={setSelectedIdea}
                    enhancementData={enhancementData}
                    setEnhancementData={setEnhancementData}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    setError={setError}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={!canGoBack || isLoading}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </Button>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </div>

          <Button
            onClick={handleNext}
            disabled={!canGoNext || isLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            data-testid="project-enhancement-button-proceed-enhancement-trigger"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" data-testid="project-enhancement-analyzing-spinner" />
                Processing...
              </>
            ) : isLastStep ? (
              <>
                Complete
                <CheckCircleIcon className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRightIcon className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Placeholder step components (these would be fully implemented)
const IntroStep: React.FC<any> = ({ mode }) => (
  <div className="text-center py-8">
    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
      {mode === 'github' && <CodeBracketIcon className="w-8 h-8 text-white" />}
      {mode === 'ideas' && <LightBulbIcon className="w-8 h-8 text-white" />}
      {mode === 'manual' && <DocumentTextIcon className="w-8 h-8 text-white" />}
    </div>
    <h3 className="text-xl font-semibold mb-4">Let's enhance your project portfolio!</h3>
    <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
      {mode === 'github' && 'We\'ll analyze your GitHub repositories and help you create compelling CV descriptions that showcase your technical skills and problem-solving abilities.'}
      {mode === 'ideas' && 'We\'ll help you choose and develop project ideas that will make your portfolio stand out to employers.'}
      {mode === 'manual' && 'We\'ll guide you through creating professional project descriptions that highlight your achievements and technical expertise.'}
    </p>
  </div>
);

const GitHubConnectStep: React.FC<any> = ({ session }) => (
  <div className="text-center py-8">
    {session?.user?.githubAccessToken ? (
      <div>
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">GitHub Connected!</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Your GitHub account is connected. We'll fetch your repositories in the next step.
        </p>
      </div>
    ) : (
      <div>
        <CodeBracketIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Connect Your GitHub Account</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          We need access to your public repositories to analyze and enhance them.
        </p>
        <Button className="bg-gray-900 hover:bg-gray-800 text-white">
          Connect GitHub
        </Button>
      </div>
    )}
  </div>
);

// RepositorySelectStep replaced with GitHubRepositorySelector component

const AnalysisReviewStep: React.FC<any> = () => (
  <div className="py-4" data-testid="project-enhancement-analysis-results">
    <h3 className="text-lg font-semibold mb-4">AI Analysis Results</h3>
    <div className="space-y-4">
      <Alert variant="info" data-testid="project-enhancement-analysis-confidence">
        <ChartBarIcon className="w-5 h-5" />
        <span data-testid="project-enhancement-analysis-confidence-score">Analysis completed with 85% confidence</span>
      </Alert>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="project-enhancement-analysis-gaps">
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg" data-testid="project-enhancement-gap-business-context">
          <h4 className="font-medium text-purple-700 dark:text-purple-300">WHY</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Problem statement and motivation identified</p>
        </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg" data-testid="project-enhancement-gap-impact-metrics">
          <h4 className="font-medium text-blue-700 dark:text-blue-300">WHAT</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Key features and technologies extracted</p>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg" data-testid="project-enhancement-gap-technical-details">
          <h4 className="font-medium text-green-700 dark:text-green-300">HOW</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Implementation approach analyzed</p>
        </div>
      </div>
      <div data-testid="project-enhancement-analysis-suggestions">
        <h4 className="font-medium mb-2">Suggested Improvements</h4>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <li>• Add business impact metrics</li>
          <li>• Include technical challenges overcome</li>
          <li>• Mention team collaboration aspects</li>
        </ul>
      </div>
    </div>
  </div>
);

// EnhancementDetailsStep replaced with ProjectContextForm component

const GenerateDescriptionStep: React.FC<any> = ({ isLoading, enhancementData, setEnhancementData }) => (
  <div className="py-4 text-center">
    <SparklesIcon className="w-16 h-16 text-purple-500 mx-auto mb-4" />
    <h3 className="text-xl font-semibold mb-2">Ready to Generate!</h3>
    <p className="text-gray-600 dark:text-gray-300 mb-6">
      We'll create a professional CV-ready description of your project that highlights your skills and achievements.
    </p>
    
    {/* Enhancement form inputs */}
    <div className="text-left mb-6 space-y-4 max-w-md mx-auto">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Business Context</span>
        </label>
        <textarea 
          className="textarea textarea-bordered" 
          rows={3}
          placeholder="Describe the business problem this project solved..."
          value={enhancementData?.context || ''}
          onChange={(e) => setEnhancementData?.({...enhancementData, context: e.target.value})}
          data-testid="project-enhancement-input-business-context"
        />
      </div>
      
      <div className="form-control">
        <label className="label">
          <span className="label-text">Impact Metrics</span>
        </label>
        <textarea 
          className="textarea textarea-bordered" 
          rows={2}
          placeholder="What measurable impact did this project have?"
          value={enhancementData?.impact || ''}
          onChange={(e) => setEnhancementData?.({...enhancementData, impact: e.target.value})}
          data-testid="project-enhancement-input-impact-metrics"
        />
      </div>
      
      <div className="form-control">
        <label className="label">
          <span className="label-text">Technical Challenges</span>
        </label>
        <textarea 
          className="textarea textarea-bordered" 
          rows={2}
          placeholder="What technical challenges did you overcome?"
          value={enhancementData?.challenges || ''}
          onChange={(e) => setEnhancementData?.({...enhancementData, challenges: e.target.value})}
          data-testid="project-enhancement-input-technical-challenges"
        />
      </div>
    </div>
    
    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-6" data-testid="project-enhancement-points-warning">
      <p className="text-sm text-purple-700 dark:text-purple-300">
        This will cost 15 points from your account
      </p>
    </div>
    
    {isLoading && (
      <div className="mb-4">
        <div className="loading loading-spinner loading-lg text-primary mx-auto" data-testid="project-enhancement-generating-spinner"></div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Generating your CV description...</p>
      </div>
    )}
    
    {/* Mock generated description area */}
    <div className="hidden" data-testid="project-enhancement-generated-description">
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-left mb-4">
        <h4 className="font-semibold mb-2">Generated CV Description:</h4>
        <p className="text-sm">This project addressed a critical problem in user experience by implementing a solution that resulted in measurable impact...</p>
      </div>
      <div className="space-y-2">
        <Button 
          className="w-full"
          variant="default"
          data-testid="project-enhancement-button-accept-description-trigger"
        >
          Accept Description
        </Button>
        
        <div className="hidden" data-testid="project-enhancement-success-banner">
          <Alert variant="success">
            <CheckCircleIcon className="w-5 h-5" />
            <span>CV description generated successfully!</span>
            <div data-testid="project-enhancement-cv-score-improvement">+15 CV Score improvement</div>
          </Alert>
        </div>
        
        <Button 
          variant="outline"
          data-testid="project-enhancement-button-view-profile-trigger"
        >
          View Profile
        </Button>
        
        <Button 
          variant="outline"
          data-testid="project-enhancement-button-enhance-another-trigger"
        >
          Enhance Another Project
        </Button>
      </div>
    </div>
    
    <div className="space-y-4">
      <Button 
        className="w-full"
        variant="default"
        disabled={isLoading}
        data-testid="project-enhancement-button-generate-description-trigger"
      >
        {isLoading ? 'Generating...' : 'Generate CV Description'}
      </Button>
      
      <Button 
        className="w-full"
        variant="outline"
        disabled={isLoading}
        data-testid="project-enhancement-confirm-points-trigger"
      >
        Confirm and Use Points
      </Button>
    </div>
    
    {/* Insufficient points modal placeholder */}
    <div className="hidden" data-testid="project-enhancement-insufficient-points-modal">
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">Insufficient Points</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4" data-testid="insufficient-points-message">
            You have insufficient points to generate this description. You need 15 points but only have 0.
          </p>
          <div className="space-y-2">
            <Button 
              className="w-full"
              variant="default"
              data-testid="insufficient-points-button-upgrade-trigger"
            >
              Upgrade Subscription
            </Button>
            <div className="text-sm text-gray-500" data-testid="insufficient-points-pricing-info">
              Upgrade to get more points and better efficiency
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Portfolio management placeholders */}
    <div className="hidden" data-testid="portfolio-dashboard-container">
      <div data-testid="portfolio-stats-enhanced-projects">Enhanced Projects: 3</div>
      <Button data-testid="portfolio-button-view-history-trigger">View History</Button>
      <Button data-testid="portfolio-button-export-trigger">Export Portfolio</Button>
      <div className="hidden" data-testid="portfolio-history-container">History</div>
      <div className="hidden" data-testid="portfolio-export-modal">
        <Button data-testid="portfolio-export-format-pdf">PDF</Button>
        <Button data-testid="portfolio-button-download-trigger">Download</Button>
        <div className="hidden" data-testid="portfolio-export-success">Export successful!</div>
      </div>
    </div>
  </div>
);

const IdeasSelectionStep: React.FC<any> = () => (
  <div className="py-4">
    <h3 className="text-lg font-semibold mb-4">Choose a Project Idea</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 cursor-pointer transition-colors">
          <h4 className="font-medium mb-2">Project Idea {i}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">A compelling project that demonstrates your skills...</p>
          <div className="flex items-center justify-between">
            <Badge variant="secondary">Beginner</Badge>
            <Button variant="outline" size="sm">Select</Button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const IdeaCustomizationStep: React.FC<any> = () => (
  <div className="py-4">
    <h3 className="text-lg font-semibold mb-4">Customize Your Project</h3>
    <p className="text-gray-600 dark:text-gray-300 mb-6">Adapt this project idea to match your interests and goals.</p>
    {/* Customization form would go here */}
  </div>
);

const GeneratePlanStep: React.FC<any> = () => (
  <div className="py-4 text-center">
    <LightBulbIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
    <h3 className="text-xl font-semibold mb-2">Generate Implementation Plan</h3>
    <p className="text-gray-600 dark:text-gray-300">
      We'll create a detailed project plan and CV description for your chosen idea.
    </p>
  </div>
);

const ManualInputStep: React.FC<any> = () => (
  <div className="py-4" data-testid="project-enhancement-manual-questionnaire">
    <h3 className="text-lg font-semibold mb-4">Enter Project Details</h3>
    <div className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Project Name</span>
        </label>
        <input 
          type="text" 
          className="input input-bordered" 
          placeholder="My Awesome Project"
          data-testid="project-enhancement-manual-input-name"
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Project Description</span>
        </label>
        <textarea 
          className="textarea textarea-bordered" 
          rows={4} 
          placeholder="Describe what your project does and its key features..."
          data-testid="project-enhancement-manual-input-description"
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Technologies Used</span>
        </label>
        <input 
          type="text" 
          className="input input-bordered" 
          placeholder="React, Node.js, MongoDB, TypeScript..."
          data-testid="project-enhancement-manual-input-technologies"
        />
      </div>
      <div className="pt-4">
        <Button
          className="w-full"
          variant="default"
          data-testid="project-enhancement-manual-button-proceed-trigger"
        >
          Proceed with Manual Entry
        </Button>
      </div>
    </div>
  </div>
);

export default ProjectEnhancementWizard;