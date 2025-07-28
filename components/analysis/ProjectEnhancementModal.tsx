'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  CodeBracketIcon, 
  LightBulbIcon, 
  StarIcon,
  ArrowRightIcon,
  XMarkIcon,
  CheckCircleIcon,
  SparklesIcon,
  RocketLaunchIcon,
  DocumentTextIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface ProjectEnhancementModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalYearsExperience: number;
}

interface EnhancementOption {
  id: 'github' | 'brainstorm';
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  features: string[];
  recommended?: boolean;
  pointsCost?: number;
}

/**
 * ProjectEnhancementModal - Two-path selection modal for project enhancement
 * Path 1: Enhance existing GitHub projects
 * Path 2: Brainstorm new project ideas
 */
export const ProjectEnhancementModal: React.FC<ProjectEnhancementModalProps> = ({
  isOpen,
  onClose,
  totalYearsExperience
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedOption, setSelectedOption] = useState<'github' | 'brainstorm' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const enhancementOptions: EnhancementOption[] = [
    {
      id: 'github',
      title: 'Enhance Existing Projects',
      description: 'Transform your GitHub repositories into compelling CV sections',
      icon: CodeBracketIcon,
      route: '/developer/projects/enhance',
      pointsCost: 15,
      features: [
        'Analyze your GitHub repositories',
        'Extract project highlights and impact',
        'Generate professional CV descriptions',
        'Identify gaps and improvement areas'
      ],
      recommended: totalYearsExperience > 0.5 // Recommend for developers with some experience
    },
    {
      id: 'brainstorm',
      title: 'Get New Project Ideas',
      description: 'Discover personalized project ideas tailored to your skills',
      icon: LightBulbIcon,
      route: '/developer/projects/ideas',
      pointsCost: 10,
      features: [
        'Skill-based project recommendations',
        'Step-by-step implementation guides',
        'Real-world problem solving focus',
        'Portfolio-building strategies'
      ],
      recommended: totalYearsExperience <= 0.5 // Recommend for newer developers
    }
  ];

  const handleOptionSelect = (optionId: 'github' | 'brainstorm') => {
    setSelectedOption(optionId);
  };

  const handleGetStarted = async () => {
    if (!selectedOption) return;

    setIsLoading(true);
    
    try {
      const option = enhancementOptions.find(opt => opt.id === selectedOption);
      if (option) {
        router.push(option.route);
      }
    } catch (error) {
      console.error('Error navigating to enhancement page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                    <RocketLaunchIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Enhance Your Portfolio
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Choose how you'd like to boost your project portfolio
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Introduction */}
              <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <SparklesIcon className="w-4 h-4" />
                  <span>Perfect for {totalYearsExperience <= 1 ? 'new' : 'early-career'} developers</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
                  Transform your projects into compelling stories that hiring managers love to see. 
                  Choose the path that best fits your current situation.
                </p>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {enhancementOptions.map((option) => (
                  <motion.div
                    key={option.id}
                    className={`relative cursor-pointer rounded-xl border-2 transition-all duration-300 ${
                      selectedOption === option.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md'
                    }`}
                    onClick={() => handleOptionSelect(option.id)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Recommended badge */}
                    {option.recommended && (
                      <div className="absolute -top-3 -right-3 z-10">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                          <StarIcon className="w-3 h-3" />
                          Recommended
                        </div>
                      </div>
                    )}

                    {/* Selection indicator */}
                    {selectedOption === option.id && (
                      <div className="absolute top-4 right-4">
                        <CheckCircleIcon className="w-6 h-6 text-purple-500" />
                      </div>
                    )}

                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                          <option.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {option.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            {option.description}
                          </p>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2 mb-4">
                        {option.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Points cost */}
                      {option.pointsCost && (
                        <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full w-fit">
                          <SparklesIcon className="w-4 h-4" />
                          <span>{option.pointsCost} points per generation</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Info box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <DocumentTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      How it works
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                      Our AI analyzes your input and generates professional project descriptions 
                      that highlight your technical skills, problem-solving abilities, and impact. 
                      Perfect for CVs, LinkedIn profiles, and portfolio websites.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleGetStarted}
                  disabled={!selectedOption || isLoading}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    selectedOption && !isLoading
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }`}
                  whileHover={selectedOption ? { scale: 1.02 } : {}}
                  whileTap={selectedOption ? { scale: 0.98 } : {}}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <span>Get Started</span>
                      <ArrowRightIcon className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectEnhancementModal;