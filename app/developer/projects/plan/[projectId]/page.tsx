'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeftIcon,
  LightBulbIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  PlayIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  RocketLaunchIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui-daisy/button';
import { Card } from '@/components/ui-daisy/card';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui-daisy/badge';

interface ProjectPlan {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeEstimate: string;
  technologies: string[];
  keyFeatures: string[];
  phases: ProjectPhase[];
  setupInstructions: string[];
  resourceLinks: ResourceLink[];
  implementationGuide: string;
  testingStrategy: string;
  deploymentSteps: string[];
}

interface ProjectPhase {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  tasks: string[];
  deliverables: string[];
}

interface ResourceLink {
  title: string;
  url: string;
  type: 'documentation' | 'tutorial' | 'tool' | 'inspiration';
}

export default function ProjectPlanPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const projectId = params.projectId as string;

  const [projectPlan, setProjectPlan] = useState<ProjectPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedPhases, setCompletedPhases] = useState<string[]>([]);

  useEffect(() => {
    if (!session?.user?.id) {
      setError('Please sign in to view project plans');
      setIsLoading(false);
      return;
    }

    // TODO: Replace with actual API call to get project plan
    // For now, generate a mock project plan based on the projectId
    const generateMockPlan = () => {
      const mockPlan: ProjectPlan = {
        id: projectId,
        title: "Personal Task Manager",
        description: "A modern, responsive task management application that helps users organize their daily activities, set priorities, and track progress. Perfect for learning modern web development patterns.",
        difficulty: "Beginner",
        timeEstimate: "2-3 weeks",
        technologies: ["React", "TypeScript", "Node.js", "Express", "MongoDB"],
        keyFeatures: [
          "User authentication",
          "Task CRUD operations", 
          "Priority levels",
          "Due date tracking",
          "Progress visualization",
          "Responsive design"
        ],
        phases: [
          {
            id: "planning",
            title: "Planning & Setup",
            description: "Set up the development environment and plan the application architecture",
            estimatedHours: 8,
            tasks: [
              "Create project repository",
              "Set up development environment",
              "Design database schema",
              "Create wireframes",
              "Plan component architecture"
            ],
            deliverables: ["Project structure", "Database design", "UI wireframes"]
          },
          {
            id: "backend",
            title: "Backend Development",
            description: "Build the API and database layer",
            estimatedHours: 20,
            tasks: [
              "Set up Express server",
              "Configure MongoDB connection",
              "Create user authentication",
              "Build task API endpoints",
              "Add input validation",
              "Implement error handling"
            ],
            deliverables: ["REST API", "Authentication system", "Database models"]
          },
          {
            id: "frontend",
            title: "Frontend Development", 
            description: "Build the user interface and connect to backend",
            estimatedHours: 25,
            tasks: [
              "Set up React application",
              "Create component library",
              "Build authentication pages",
              "Develop task management UI",
              "Add responsive design",
              "Integrate with API"
            ],
            deliverables: ["React application", "Responsive UI", "API integration"]
          },
          {
            id: "testing",
            title: "Testing & Polish",
            description: "Test the application and add finishing touches",
            estimatedHours: 12,
            tasks: [
              "Write unit tests",
              "Add integration tests",
              "Fix bugs and issues",
              "Optimize performance",
              "Add final polish"
            ],
            deliverables: ["Test suite", "Bug-free application", "Performance optimizations"]
          }
        ],
        setupInstructions: [
          "Install Node.js (v18 or higher)",
          "Install MongoDB or set up MongoDB Atlas",
          "Clone the project repository",
          "Run 'npm install' in both frontend and backend directories",
          "Create environment variables file",
          "Start MongoDB service",
          "Run 'npm run dev' to start development servers"
        ],
        resourceLinks: [
          {
            title: "React Documentation",
            url: "https://react.dev",
            type: "documentation"
          },
          {
            title: "TypeScript Handbook",
            url: "https://www.typescriptlang.org/docs",
            type: "documentation"  
          },
          {
            title: "Express.js Guide",
            url: "https://expressjs.com/en/guide/routing.html",
            type: "documentation"
          },
          {
            title: "MongoDB Tutorial",
            url: "https://docs.mongodb.com/manual/tutorial",
            type: "tutorial"
          }
        ],
        implementationGuide: "Start by setting up your development environment and creating the basic project structure. Focus on building the backend API first, then move to the frontend. Test each feature as you build it.",
        testingStrategy: "Use Jest for unit testing, React Testing Library for component tests, and Postman for API testing. Test user authentication, CRUD operations, and edge cases.",
        deploymentSteps: [
          "Set up production database (MongoDB Atlas)",
          "Configure environment variables for production",
          "Build the React application for production",
          "Deploy backend to Heroku or similar platform",
          "Deploy frontend to Vercel or Netlify",
          "Test the deployed application"
        ]
      };

      setProjectPlan(mockPlan);
      setIsLoading(false);
    };

    generateMockPlan();
  }, [session, projectId]);

  const togglePhaseComplete = (phaseId: string) => {
    setCompletedPhases(prev => 
      prev.includes(phaseId) 
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'documentation': return <DocumentTextIcon className="w-4 h-4" />;
      case 'tutorial': return <PlayIcon className="w-4 h-4" />;
      case 'tool': return <CogIcon className="w-4 h-4" />;
      case 'inspiration': return <StarIcon className="w-4 h-4" />;
      default: return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  const getResourceBadgeVariant = (type: string) => {
    switch (type) {
      case 'documentation': return 'info';
      case 'tutorial': return 'success'; 
      case 'tool': return 'warning';
      case 'inspiration': return 'primary';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-base-content/60">Loading project plan...</p>
        </div>
      </div>
    );
  }

  if (error || !projectPlan) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full text-center">
          <Alert variant="destructive" className="mb-4">
            {error || 'Project plan not found'}
          </Alert>
          <Button onClick={() => router.back()}>
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const progressPercentage = (completedPhases.length / projectPlan.phases.length) * 100;

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
            >
              Back to Ideas
            </Button>
          </div>
        </div>

        {/* Project Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl">
                  <RocketLaunchIcon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-base-content mb-2">
                    {projectPlan.title}
                  </h1>
                  <p className="text-base-content/70 text-lg mb-4">
                    {projectPlan.description}
                  </p>
                  <div className="flex items-center gap-4">
                    <Badge variant={projectPlan.difficulty === 'Beginner' ? 'success' : projectPlan.difficulty === 'Intermediate' ? 'warning' : 'error'}>
                      {projectPlan.difficulty}
                    </Badge>
                    <span className="flex items-center gap-1 text-sm text-base-content/60">
                      <ClockIcon className="w-4 h-4" />
                      {projectPlan.timeEstimate}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-base-content mb-3 flex items-center gap-2">
                    <CodeBracketIcon className="w-5 h-5" />
                    Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {projectPlan.technologies.map((tech, index) => (
                      <Badge key={index} variant="outline">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-base-content mb-3 flex items-center gap-2">
                    <StarIcon className="w-5 h-5" />
                    Key Features
                  </h3>
                  <ul className="space-y-1">
                    {projectPlan.keyFeatures.map((feature, index) => (
                      <li key={index} className="text-sm text-base-content/70 flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-success flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Progress Card */}
            <Card className="p-6">
              <h3 className="font-semibold text-base-content mb-4">Project Progress</h3>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Completed</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-base-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-base-content/60">
                {completedPhases.length} of {projectPlan.phases.length} phases completed
              </p>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-base-content mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="primary" size="sm" className="w-full">
                  Start Development
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Download Plan
                </Button>
                <Button variant="ghost" size="sm" className="w-full">
                  Share Project
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Development Phases */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-base-content mb-6">Development Phases</h2>
          <div className="space-y-6">
            {projectPlan.phases.map((phase, index) => (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${completedPhases.includes(phase.id) ? 'bg-success' : 'bg-base-200'}`}>
                        {completedPhases.includes(phase.id) ? (
                          <CheckCircleIcon className="w-6 h-6 text-white" />
                        ) : (
                          <span className="w-6 h-6 flex items-center justify-center text-sm font-semibold text-base-content">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-base-content mb-2">
                          {phase.title}
                        </h3>
                        <p className="text-base-content/70 mb-4">
                          {phase.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-base-content/60 mb-4">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            {phase.estimatedHours} hours
                          </span>
                          <span>{phase.tasks.length} tasks</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-base-content mb-2">Tasks</h4>
                            <ul className="space-y-1">
                              {phase.tasks.map((task, taskIndex) => (
                                <li key={taskIndex} className="text-sm text-base-content/70 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-base-content/30 rounded-full flex-shrink-0" />
                                  {task}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium text-base-content mb-2">Deliverables</h4>
                            <ul className="space-y-1">
                              {phase.deliverables.map((deliverable, delIndex) => (
                                <li key={delIndex} className="text-sm text-base-content/70 flex items-center gap-2">
                                  <CheckCircleIcon className="w-4 h-4 text-success flex-shrink-0" />
                                  {deliverable}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant={completedPhases.includes(phase.id) ? "success" : "outline"}
                      size="sm"
                      onClick={() => togglePhaseComplete(phase.id)}
                    >
                      {completedPhases.includes(phase.id) ? "Completed" : "Mark Complete"}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Additional Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Setup Instructions */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-base-content mb-4 flex items-center gap-2">
              <CogIcon className="w-6 h-6" />
              Setup Instructions
            </h3>
            <ol className="space-y-2">
              {projectPlan.setupInstructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-base-content/70">
                  <span className="bg-primary text-primary-content rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  {instruction}
                </li>
              ))}
            </ol>
          </Card>

          {/* Resources */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-base-content mb-4 flex items-center gap-2">
              <DocumentTextIcon className="w-6 h-6" />
              Helpful Resources
            </h3>
            <div className="space-y-3">
              {projectPlan.resourceLinks.map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border border-base-300 rounded-lg hover:bg-base-200 transition-colors"
                >
                  <div className="p-2 bg-base-200 rounded-lg">
                    {getResourceIcon(resource.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-base-content">{resource.title}</span>
                      <Badge variant={getResourceBadgeVariant(resource.type) as any} size="sm">
                        {resource.type}
                      </Badge>
                    </div>
                    <span className="text-sm text-base-content/60">{resource.url}</span>
                  </div>
                </a>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}