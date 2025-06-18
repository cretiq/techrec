'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui-daisy/button';
import { 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  Sparkles,
  Target,
  Zap,
  ChevronRight 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProfileScoringSidebarProps {
  analysisData: any; // TODO: Use proper CvAnalysisData type
}

interface SectionScore {
  name: string;
  score: number;
  icon: React.ElementType;
  quickWin?: string;
}

export function ProfileScoringSidebar({ analysisData }: ProfileScoringSidebarProps) {
  // Calculate section scores
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
        quickWin: score < 100 ? 'Add your education history' : undefined
      });
    }

    return scores;
  };

  const sectionScores = calculateSectionScores();
  const overallScore = Math.round(
    sectionScores.reduce((sum, section) => sum + section.score, 0) / sectionScores.length
  );

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

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative inline-flex items-center justify-center"
        >
          <div className="w-32 h-32 rounded-full bg-base-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold">{overallScore}%</div>
              <div className={cn("text-sm font-medium", scoreQuality.color)}>
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
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            Quick Wins
          </h4>
          <div className="space-y-2">
            {quickWins.map((win, index) => (
              <motion.div
                key={win.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 px-3 hover:bg-primary/10"
                >
                  <ChevronRight className="h-3 w-3 mr-2 flex-shrink-0" />
                  <span className="text-xs">{win.quickWin}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Section Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Section Breakdown</h4>
        <div className="space-y-3">
          {sectionScores.map((section, index) => (
            <motion.div
              key={section.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="space-y-1"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{section.name}</span>
                <span className={cn(
                  "font-medium",
                  section.score === 100 ? "text-green-600" : "text-base-content"
                )}>
                  {section.score}%
                </span>
              </div>
              <div className="relative">
                <Progress 
                  value={section.score} 
                  className="h-2"
                />
                {section.score === 100 && (
                  <CheckCircle2 className="absolute -right-1 -top-1 h-4 w-4 text-green-600" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* One-Click Actions */}
      <div className="pt-4 space-y-2">
        <Button
          variant="default"
          size="sm"
          className="w-full"
          onClick={() => {
            // TODO: Implement AI optimization
            console.log('Optimize with AI');
          }}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Optimize with AI
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            // TODO: Navigate to first incomplete section
            console.log('Complete profile');
          }}
        >
          <Target className="h-4 w-4 mr-2" />
          Complete Profile
        </Button>
      </div>
    </div>
  );
}