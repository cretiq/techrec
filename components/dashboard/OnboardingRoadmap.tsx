'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  FileText, 
  Search, 
  User,
  Sparkles,
  Target,
  ChevronRight,
  Trophy,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui-daisy/card';
import { Button } from '@/components/ui-daisy/button';
import { Badge } from '@/components/ui-daisy/badge';
import { Progress } from '@/components/ui-daisy/progress';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeId: string;
  badgeName: string;
  badgeIcon: string;
  isCompleted: boolean;
  completedAt?: Date;
  link?: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime?: string;
  progressData?: {
    current: number;
    target: number;
    label: string;
  };
}

interface OnboardingRoadmapProps {
  className?: string;
  roadmapData?: {
    milestones: Array<{
      id: string;
      title: string;
      isCompleted: boolean;
      completedAt: Date | null;
    }>;
    completedCount: number;
    progress: number;
  };
  profileScore?: number;
}

export function OnboardingRoadmap({ className = '', roadmapData, profileScore = 0 }: OnboardingRoadmapProps) {
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);
  const router = useRouter();

  console.log('🗺️ [OnboardingRoadmap] Component mounted with data:', { roadmapData, profileScore });

  // Process roadmap data
  useEffect(() => {
    if (roadmapData) {
      console.log('🗺️ [OnboardingRoadmap] Processing roadmap data...');
      
      const processedMilestones: RoadmapMilestone[] = [
        {
          id: 'cv-upload',
          title: 'Upload Your CV',
          description: 'Start your journey by uploading your CV for AI analysis',
          icon: FileText,
          badgeId: 'first_step',
          badgeName: 'First Step',
          badgeIcon: '🚀',
          isCompleted: roadmapData.milestones.find(m => m.id === 'cv-upload')?.isCompleted || false,
          completedAt: roadmapData.milestones.find(m => m.id === 'cv-upload')?.completedAt || undefined,
          link: '/developer/cv-management',
          priority: 'high',
          estimatedTime: '5 min'
        },
        {
          id: 'first-analysis',
          title: 'Get AI Feedback',
          description: 'Let our AI analyze your CV and provide improvement suggestions',
          icon: Sparkles,
          badgeId: 'ai_collaborator',
          badgeName: 'AI Collaborator',
          badgeIcon: '🤖',
          isCompleted: roadmapData.milestones.find(m => m.id === 'first-analysis')?.isCompleted || false,
          completedAt: roadmapData.milestones.find(m => m.id === 'first-analysis')?.completedAt || undefined,
          link: '/developer/cv-management',
          priority: 'high',
          estimatedTime: '10 min'
        },
        {
          id: 'profile-improvement',
          title: 'Improve Your Profile',
          description: 'Enhance your profile score by completing sections and accepting suggestions',
          icon: TrendingUp,
          badgeId: 'profile_complete',
          badgeName: 'Profile Master',
          badgeIcon: '🏆',
          isCompleted: roadmapData.milestones.find(m => m.id === 'profile-improvement')?.isCompleted || false,
          completedAt: roadmapData.milestones.find(m => m.id === 'profile-improvement')?.completedAt || undefined,
          link: '/developer/cv-management',
          priority: 'high',
          estimatedTime: '15 min',
          progressData: {
            current: profileScore,
            target: 90,
            label: 'Profile Score'
          }
        },
        {
          id: 'role-search',
          title: 'Search for Roles',
          description: 'Explore job opportunities and find roles that match your skills',
          icon: Search,
          badgeId: 'job_hunter',
          badgeName: 'Job Hunter',
          badgeIcon: '🎯',
          isCompleted: roadmapData.milestones.find(m => m.id === 'role-search')?.isCompleted || false,
          completedAt: roadmapData.milestones.find(m => m.id === 'role-search')?.completedAt || undefined,
          link: '/developer/roles/search',
          priority: 'medium',
          estimatedTime: '20 min'
        },
        {
          id: 'cover-letter',
          title: 'Write AI Cover Letter',
          description: 'Generate your first AI-powered cover letter for job applications',
          icon: User,
          badgeId: 'communicator',
          badgeName: 'Communicator',
          badgeIcon: '✍️',
          isCompleted: roadmapData.milestones.find(m => m.id === 'cover-letter')?.isCompleted || false,
          completedAt: roadmapData.milestones.find(m => m.id === 'cover-letter')?.completedAt || undefined,
          link: '/developer/writing-help',
          priority: 'medium',
          estimatedTime: '10 min'
        }
      ];

      setMilestones(processedMilestones);
      setCompletedCount(roadmapData.completedCount);
      setIsLoading(false);
      
      console.log('🗺️ [OnboardingRoadmap] Roadmap data processed:', {
        totalMilestones: processedMilestones.length,
        completed: roadmapData.completedCount
      });
    } else {
      // Fallback to mock data if no roadmap data provided
      setIsLoading(false);
    }
  }, [roadmapData, profileScore]);

  const handleMilestoneClick = (milestone: RoadmapMilestone) => {
    console.log('🗺️ [OnboardingRoadmap] Milestone clicked:', milestone.title);
    
    if (milestone.link) {
      router.push(milestone.link);
    }
  };

  const overallProgress = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="onboarding-roadmap-loading">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 bg-base-300/50 rounded animate-pulse w-48" />
            <div className="h-4 bg-base-300/30 rounded animate-pulse w-32" />
          </div>
          <div className="w-16 h-16 bg-base-300/50 rounded-full animate-pulse" />
        </div>
        
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-12 bg-base-300/50 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-base-300/50 rounded animate-pulse" />
                <div className="h-3 bg-base-300/30 rounded animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} data-testid="onboarding-roadmap">
      {/* Progress Overview */}
      <div className="flex items-center justify-between" data-testid="roadmap-progress-overview">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-base-content">
            Your Progress
          </h3>
          <p className="text-base-content/70">
            {completedCount} of {milestones.length} milestones completed
          </p>
        </div>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative inline-flex items-center justify-center"
          data-testid="roadmap-progress-circle"
        >
          <div className="w-32 h-32 rounded-full bg-base-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold" data-testid="roadmap-progress-percentage">{Math.round(overallProgress)}%</div>
              <div className="text-sm font-medium text-base-content/70" data-testid="roadmap-progress-label">
                Complete
              </div>
            </div>
          </div>
          <svg className="absolute inset-0 w-32 h-32 -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-base-300"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="60"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-primary"
              strokeDasharray={`${(overallProgress / 100) * 377} 377`}
              strokeLinecap="round"
              initial={{ strokeDasharray: "0 377" }}
              animate={{ strokeDasharray: `${(overallProgress / 100) * 377} 377` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
        </motion.div>
      </div>

      {/* Overall Progress Bar */}
      <div className="space-y-2" data-testid="roadmap-progress-bar">
        <div className="flex justify-between text-sm text-base-content/70">
          <span>Overall Progress</span>
          <span>{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-3" />
      </div>

      {/* Milestone List */}
      <div className="space-y-4" data-testid="roadmap-milestones">
        <AnimatePresence>
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Connecting Line */}
              {index < milestones.length - 1 && (
                <div 
                  className="absolute left-6 top-16 w-0.5 h-8 bg-base-300/50"
                  data-testid={`roadmap-connector-${milestone.id}`}
                />
              )}
              
              <Card
                variant="transparent"
                className={`
                  cursor-pointer transition-all duration-100 
                  bg-base-100/40 backdrop-blur-sm border border-base-300/50
                  hover:bg-base-100/60 hover:border-base-300/70 hover:shadow-lg hover:scale-[1.02]
                  ${milestone.isCompleted ? 'bg-green-50/50 border-green-200/50' : ''}
                `}
                onClick={() => handleMilestoneClick(milestone)}
                data-testid={`roadmap-milestone-${milestone.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    
                    {/* Status Icon */}
                    <div className="flex-shrink-0 pt-1">
                      <motion.div
                        className={`
                          w-12 h-12 rounded-full flex items-center justify-center
                          ${milestone.isCompleted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-base-200 text-base-content border-2 border-base-300'
                          }
                        `}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        data-testid={`roadmap-milestone-icon-${milestone.id}`}
                      >
                        {milestone.isCompleted ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <milestone.icon className="w-6 h-6" />
                        )}
                      </motion.div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-base-content">
                          {milestone.title}
                        </h4>
                        
                        <div className="flex items-center gap-2">
                          <ChevronRight className="w-4 h-4 text-base-content/50" />
                        </div>
                      </div>
                      
                      <p className="text-sm text-base-content/70 mb-3">
                        {milestone.description}
                      </p>
                      
                      {/* Progress Data */}
                      {milestone.progressData && (
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-xs text-base-content/60">
                            <span>{milestone.progressData.label}</span>
                            <span>
                              {milestone.progressData.current}/{milestone.progressData.target}
                            </span>
                          </div>
                          <Progress 
                            value={(milestone.progressData.current / milestone.progressData.target) * 100} 
                            className="h-2" 
                          />
                        </div>
                      )}
                      
                      {/* Badge Reward */}
                      <div className="flex items-center gap-2 text-sm text-base-content/60">
                        <Trophy className="w-4 h-4" />
                        <span>Unlocks:</span>
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          data-testid={`roadmap-milestone-badge-${milestone.id}`}
                        >
                          <span className="mr-1">{milestone.badgeIcon}</span>
                          {milestone.badgeName}
                        </Badge>
                      </div>
                      
                      {/* Completion Status - Simplified */}
                      {milestone.isCompleted && (
                        <div className="mt-2 text-xs text-green-600">
                          ✅ Completed
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Completion Celebration */}
      <AnimatePresence>
        {completedCount === milestones.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center py-8"
            data-testid="roadmap-completion-celebration"
          >
            <div className="space-y-4">
              <div className="text-6xl">🎉</div>
              <h3 className="text-2xl font-bold text-base-content">
                Congratulations!
              </h3>
              <p className="text-base-content/70">
                You've completed all onboarding milestones. You're ready to excel on TechRec!
              </p>
              <Link href="/developer/roles/search">
                <Button variant="default" size="lg" className="mt-4">
                  <Search className="w-4 h-4 mr-2" />
                  Start Job Hunting
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}