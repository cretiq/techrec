'use client';

import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui-daisy/progress';
import { Button } from '@/components/ui-daisy/button';
import { 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  Sparkles,
  Target,
  Zap,
  ChevronRight,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui-daisy/use-toast';
import { useSelector } from 'react-redux';
import { selectSuggestionsLoading, selectSuggestionsStats, selectSuggestionsError } from '@/lib/features/suggestionsSlice';
import { useSuggestionsFetcher } from '@/components/suggestions/SuggestionManager';
import { GamificationDashboard } from '@/components/gamification/GamificationDashboard';

import { ProfileAnalysisData } from '@/types/cv';

interface ProfileScoringSidebarProps {
  analysisData: ProfileAnalysisData;
}

interface SectionScore {
  name: string;
  score: number;
  icon: React.ElementType;
  quickWin?: string;
  id: string; // For navigation
  sectionIcon: React.ElementType; // Different icon for navigation
}

export function ProfileScoringSidebar({ analysisData }: ProfileScoringSidebarProps) {
  const [activeSection, setActiveSection] = useState<string>('contact-info');
  const { toast } = useToast();
  
  // Redux selectors for suggestions state
  const isLoadingSuggestions = useSelector(selectSuggestionsLoading);
  const suggestionsStats = useSelector(selectSuggestionsStats);
  const suggestionsError = useSelector(selectSuggestionsError);
  
  // Suggestion fetcher hook
  const { fetchSuggestions } = useSuggestionsFetcher();

  // Calculate section scores with navigation data
  const calculateSectionScores = (): SectionScore[] => {
    const scores: SectionScore[] = [];

    // Contact Info
    if (analysisData?.contactInfo) {
      const contactFields = Object.values(analysisData.contactInfo).filter(Boolean).length;
      const totalFields = 7; // name, email, phone, location, linkedin, github, website
      const score = Math.round((contactFields / totalFields) * 100);
      scores.push({
        name: 'Contact Info',
        score,
        icon: AlertCircle,
        sectionIcon: User,
        id: 'contact-info',
        quickWin: score < 100 ? 'Add missing contact details' : undefined
      });
    }

    // About/Summary
    if (analysisData?.about !== undefined) {
      const aboutLength = analysisData.about?.length || 0;
      const score = aboutLength > 200 ? 100 : Math.round((aboutLength / 200) * 100);
      scores.push({
        name: 'Summary',
        score,
        icon: AlertCircle,
        sectionIcon: FileText,
        id: 'about',
        quickWin: score < 100 ? 'Write a compelling summary' : undefined
      });
    }

    // Skills
    if (analysisData?.skills) {
      const skillCount = analysisData.skills.length;
      const score = skillCount >= 10 ? 100 : Math.round((skillCount / 10) * 100);
      scores.push({
        name: 'Skills',
        score,
        icon: AlertCircle,
        sectionIcon: Award,
        id: 'skills',
        quickWin: score < 100 ? `Add ${10 - skillCount} more skills` : undefined
      });
    }

    // Experience
    if (analysisData?.experience) {
      const expCount = analysisData.experience.length;
      const hasDetails = analysisData.experience.some((exp: any) => 
        exp.responsibilities?.length > 0
      );
      const score = expCount > 0 ? (hasDetails ? 100 : 70) : 0;
      scores.push({
        name: 'Experience',
        score,
        icon: AlertCircle,
        sectionIcon: Briefcase,
        id: 'experience',
        quickWin: score < 100 ? 'Add job responsibilities and achievements' : undefined
      });
    }

    // Education
    if (analysisData?.education) {
      const eduCount = analysisData.education.length;
      const score = eduCount > 0 ? 100 : 0;
      scores.push({
        name: 'Education',
        score,
        icon: AlertCircle,
        sectionIcon: GraduationCap,
        id: 'education',
        quickWin: score < 100 ? 'Add your education history' : undefined
      });
    }

    return scores;
  };

  const sectionScores = calculateSectionScores();
  const overallScore = Math.round(
    sectionScores.reduce((sum, section) => sum + section.score, 0) / sectionScores.length
  );

  // Scroll detection for active section highlighting
  useEffect(() => {
    const handleScroll = () => {
      const sections = sectionScores.map(s => s.id);
      let currentSection = sections[0];

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Section is considered active if it's in the top half of the viewport
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= 0) {
            currentSection = sectionId;
          }
        }
      }

      setActiveSection(currentSection);
    };

    // Throttle scroll events
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [sectionScores]);

  // Navigation handler
  const handleSectionClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  // Determine score quality
  const getScoreQuality = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 75) return { label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (score >= 60) return { label: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { label: 'Needs Work', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const scoreQuality = getScoreQuality(overallScore);

  // Get quick wins
  const quickWins = sectionScores.filter(s => s.quickWin).slice(0, 3);

  // Handle AI suggestion generation
  const handleGetSuggestions = async () => {
    try {
      console.log('🤖 [ProfileScoringSidebar] Starting AI suggestion generation...');
      
      // Prepare request payload with full CV data
      const requestPayload = {
        contactInfo: analysisData?.contactInfo,
        about: analysisData?.about,
        skills: analysisData?.skills,
        experience: analysisData?.experience,
        education: analysisData?.education,
        achievements: analysisData?.achievements,
        cv: analysisData?.cv
      };

      console.log('📊 [ProfileScoringSidebar] CV data structure:', {
        hasContactInfo: !!analysisData?.contactInfo,
        hasAbout: !!analysisData?.about,
        skillsCount: analysisData?.skills?.length || 0,
        experienceCount: analysisData?.experience?.length || 0,
        educationCount: analysisData?.education?.length || 0,
        achievementsCount: analysisData?.achievements?.length || 0
      });

      // Use the suggestion fetcher
      await fetchSuggestions(requestPayload);

    } catch (error: any) {
      console.error('❌ [ProfileScoringSidebar] AI suggestion generation failed:', error);
      // Error handling is done in the useSuggestionsFetcher hook
    }
  };

  return (
    <div className="space-y-6" data-testid="profile-scoring-sidebar">
      {/* Overall Score */}
      <div className="text-center" data-testid="profile-overall-score">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative inline-flex items-center justify-center"
          data-testid="profile-score-circle"
        >
          <div className="w-32 h-32 rounded-full bg-base-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold" data-testid="profile-score-percentage">{overallScore}%</div>
              <div className={cn("text-sm font-medium", scoreQuality.color)} data-testid="profile-score-quality">
                {scoreQuality.label}
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
              strokeDasharray={`${(overallScore / 100) * 377} 377`}
              strokeLinecap="round"
              initial={{ strokeDasharray: "0 377" }}
              animate={{ strokeDasharray: `${(overallScore / 100) * 377} 377` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
        </motion.div>
      </div>

      {/* Quick Wins */}
      {quickWins.length > 0 && (
        <div className="space-y-3" data-testid="profile-quick-wins">
          <h4 className="text-sm font-semibold flex items-center gap-2" data-testid="profile-quick-wins-title">
            <Zap className="h-4 w-4 text-yellow-500" data-testid="profile-quick-wins-icon" />
            Quick Wins
          </h4>
          <div className="space-y-2" data-testid="profile-quick-wins-list">
            {quickWins.map((win, index) => (
              <motion.div
                key={win.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                data-testid={`profile-quick-win-${win.id}`}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 px-3 hover:bg-primary/10"
                  data-testid={`profile-quick-win-button-${win.id}`}
                >
                  <ChevronRight className="h-3 w-3 mr-2 flex-shrink-0" data-testid={`profile-quick-win-icon-${win.id}`} />
                  <span className="text-xs" data-testid={`profile-quick-win-text-${win.id}`}>{win.quickWin}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}


      {/* Section Breakdown */}
      <div className="space-y-3" data-testid="profile-progress-overview">
        <h4 className="text-sm font-semibold" data-testid="profile-progress-title">Progress Overview</h4>
        <div className="space-y-4" data-testid="profile-progress-list">
          {sectionScores.map((section, index) => {
            const isActive = activeSection === section.id;
            return (
              <motion.button
                key={section.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSectionClick(section.id)}
                className={cn(
                  "w-full text-left p-4 rounded-lg transition-all duration-100 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 cursor-pointer",
                  "bg-brand-muted backdrop-blur-sm border border-brand-sharp space-y-3",
                  isActive 
                    ? "bg-primary/10 border-primary/30 shadow-md" 
                    : "hover:bg-base-200/60 hover:border-base-300/70 hover:shadow-sm hover:translate-y-[-1px]"
                )}
                data-testid={`profile-progress-${section.id}`}
                data-active={isActive}
              >
                <div className="flex items-center justify-between" data-testid={`profile-progress-header-${section.id}`}>
                  <div className="flex items-center gap-3">
                    <section.sectionIcon className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} data-testid={`profile-progress-icon-${section.id}`} />
                    <span className={cn(
                      "font-medium",
                      isActive ? "text-primary" : "text-base-content"
                    )} data-testid={`profile-progress-name-${section.id}`}>
                      {section.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-lg font-bold",
                      section.score === 100 ? "text-green-600" : 
                      section.score >= 70 ? "text-blue-600" :
                      section.score >= 50 ? "text-yellow-600" : "text-red-600"
                    )} data-testid={`profile-progress-percentage-${section.id}`}>
                      {section.score}%
                    </span>
                    {section.score === 100 && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" data-testid={`profile-progress-complete-icon-${section.id}`} />
                    )}
                  </div>
                </div>
                <div className="relative" data-testid={`profile-progress-bar-${section.id}`}>
                  <Progress 
                    value={section.score} 
                    className="h-3"
                    data-testid={`profile-progress-bar-fill-${section.id}`}
                  />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Enhanced AI Suggestions Section */}
      <div className="pt-4 space-y-4" data-testid="profile-actions">
        {/* Suggestions Statistics */}
        <AnimatePresence>
          {(suggestionsStats.total > 0 || isLoadingSuggestions) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div 
                className="p-3 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-lg border border-primary/20"
                data-testid="profile-suggestions-stats"
              >
                {isLoadingSuggestions ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="relative w-8 h-8"
                      >
                        <div className="absolute inset-0 border-2 border-primary/30 rounded-full"></div>
                        <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        {/* Orbital dots */}
                        <motion.div
                          className="absolute top-0 left-1/2 w-1 h-1 bg-primary rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          style={{ transformOrigin: '0 16px' }}
                        />
                        <motion.div
                          className="absolute top-1/2 left-0 w-1 h-1 bg-secondary rounded-full"
                          animate={{ rotate: -360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          style={{ transformOrigin: '16px 0' }}
                        />
                      </motion.div>
                      <div>
                        <p className="text-sm font-semibold text-primary">Analyzing Your CV...</p>
                        <p className="text-xs text-base-content/60">AI is finding improvement opportunities</p>
                      </div>
                    </div>
                    
                    {/* Animated progress bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-base-content/60">
                        <span>Progress</span>
                        <span>Usually takes 5-10 seconds</span>
                      </div>
                      <div className="relative h-2 bg-base-300 rounded-full overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 8, ease: "easeInOut" }}
                        />
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">AI Suggestions Ready</span>
                      <div className="flex gap-1">
                        {suggestionsStats.pending > 0 && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                            {suggestionsStats.pending} pending
                          </span>
                        )}
                        {suggestionsStats.accepted > 0 && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            {suggestionsStats.accepted} applied
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-base-content/60">
                      {suggestionsStats.total} suggestions found • {suggestionsStats.highPriority} high priority
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Get Suggestions Button */}
        <motion.div
          whileHover={{ scale: isLoadingSuggestions ? 1 : 1.02 }}
          whileTap={{ scale: isLoadingSuggestions ? 1 : 0.98 }}
          className="relative"
        >
          {/* Orbital rings when loading */}
          {isLoadingSuggestions && (
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                className="absolute inset-0 border-2 border-primary/30 rounded-lg"
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.3, 0.1, 0.3]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute inset-0 border-2 border-secondary/30 rounded-lg"
                animate={{ 
                  scale: [1, 1.03, 1],
                  opacity: [0.4, 0.2, 0.4]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              />
            </div>
          )}
          
          <Button
            variant="default"
            size="sm"
            className="w-full relative overflow-hidden"
            onClick={handleGetSuggestions}
            disabled={isLoadingSuggestions}
            data-testid="profile-action-get-suggestions"
          >
            {/* Pulse wave effect when loading */}
            {isLoadingSuggestions && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            
            <div className="relative z-10 flex items-center justify-center">
              {isLoadingSuggestions ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.div>
                  <span data-testid="profile-action-get-suggestions-loading">
                    Getting Suggestions...
                  </span>
                </>
              ) : (
                <>
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Sparkles className="h-4 w-4 mr-2" data-testid="profile-action-get-suggestions-icon" />
                  </motion.div>
                  <span data-testid="profile-action-get-suggestions-text">
                    {suggestionsStats.total > 0 ? 'Refresh Suggestions' : 'Improve Everything'}
                  </span>
                </>
              )}
            </div>
          </Button>
        </motion.div>
        
        {/* Complete Profile Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            // TODO: Navigate to first incomplete section
            console.log('Complete profile');
          }}
          data-testid="profile-action-complete-profile"
        >
          <Target className="h-4 w-4 mr-2" data-testid="profile-action-complete-profile-icon" />
          Complete Profile
        </Button>
      </div>

      {/* Gamification Section */}
      <GamificationDashboard variant="sidebar" data-testid="profile-gamification-section" />
    </div>
  );
}