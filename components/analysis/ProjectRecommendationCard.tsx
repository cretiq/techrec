'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CodeBracketIcon, 
  LightBulbIcon, 
  SparklesIcon,
  ChevronRightIcon,
  StarIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ProjectEnhancementModal } from './ProjectEnhancementModal';
import { Badge } from '@/components/ui-daisy/badge';
import { TooltipInfo } from '@/components/ui-daisy/tooltip';

interface ProjectRecommendationCardProps {
  totalYearsExperience: number;
  isJuniorDeveloper: boolean;
  onClose?: () => void;
}

/**
 * ProjectRecommendationCard - Shows project enhancement recommendations for junior developers (≤2 years)
 * Displays targeted content for early-career developers to help improve their portfolios
 */
export const ProjectRecommendationCard: React.FC<ProjectRecommendationCardProps> = ({
  totalYearsExperience,
  isJuniorDeveloper,
  onClose
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleGetStarted = () => {
    setIsModalOpen(true);
  };

  const experienceLabel = totalYearsExperience <= 1 
    ? 'just starting your career' 
    : `${totalYearsExperience} years of experience`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
      className="mb-6"
    >
      <div 
        className="relative bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-700/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          aria-label="Dismiss recommendation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header with sparkles animation */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
              <RocketLaunchIcon className="w-6 h-6 text-white" />
            </div>
            {/* Sparkles animation */}
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <SparklesIcon className="w-4 h-4 text-yellow-400" />
            </motion.div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                🚀 Boost Your Portfolio
              </h3>
              <Badge 
                variant="success" 
                size="sm" 
                pulse 
                leftIcon={<SparklesIcon className="w-3 h-3" />}
              >
                Recommended
              </Badge>
              <TooltipInfo
                content="This feature is especially recommended for early-career developers to showcase their potential and technical growth."
                position="top"
                size="medium"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Perfect for developers with {experienceLabel}
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Since you're {experienceLabel}, let's make your projects shine! 
            Our AI can help you create <strong>compelling project descriptions</strong> that showcase your skills and attract employers.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CodeBracketIcon className="w-4 h-4 text-purple-500" />
              <span>Enhance existing GitHub projects</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <LightBulbIcon className="w-4 h-4 text-purple-500" />
              <span>Get new project ideas</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <StarIcon className="w-4 h-4 text-purple-500" />
              <span>AI-powered CV sections</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <SparklesIcon className="w-4 h-4 text-purple-500" />
              <span>Professional presentation</span>
            </div>
          </div>

          {/* Benefits callout */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-purple-200/50 dark:border-purple-700/50">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <StarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  Why this matters for you
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Early-career developers often have great technical skills but struggle to present them effectively. 
                  Our AI helps you tell compelling stories about your projects that hiring managers love to see.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <motion.button
              onClick={handleGetStarted}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SparklesIcon className="w-5 h-5" />
              <span>Enhance My Projects</span>
              <ChevronRightIcon className="w-4 h-4" />
            </motion.button>
            
            <button
              onClick={handleClose}
              className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>

        {/* Animated background elements */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute top-4 right-20 w-2 h-2 bg-purple-400 rounded-full opacity-40" />
          <div className="absolute bottom-8 left-16 w-1 h-1 bg-indigo-400 rounded-full opacity-60" />
          <div className="absolute top-1/2 left-8 w-1.5 h-1.5 bg-yellow-400 rounded-full opacity-50" />
          <div className="absolute bottom-12 right-12 w-1 h-1 bg-pink-400 rounded-full opacity-40" />
        </motion.div>
      </div>
      
      {/* Project Enhancement Modal */}
      <ProjectEnhancementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        totalYearsExperience={totalYearsExperience}
      />
    </motion.div>
  );
};

export default ProjectRecommendationCard;