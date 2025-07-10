// components/roles/ProfileCompletionPrompt.tsx
// Component to prompt users to complete their profile for match scoring

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui-daisy/button';
import { Card, CardContent } from '@/components/ui-daisy/card';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ProfileCompletionPromptProps {
  className?: string;
  onClose?: () => void;
  variant?: 'inline' | 'overlay' | 'banner';
  size?: 'sm' | 'md' | 'lg';
}

const ProfileCompletionPrompt: React.FC<ProfileCompletionPromptProps> = ({
  className,
  onClose,
  variant = 'inline',
  size = 'md'
}) => {
  const router = useRouter();
  
  const handleCompleteProfile = () => {
    router.push('/developer/profile?tab=skills&highlight=matching');
    onClose?.();
  };
  
  const sizeClasses = {
    sm: 'p-3 space-y-2',
    md: 'p-4 space-y-3',
    lg: 'p-6 space-y-4'
  };
  
  const textSizeClasses = {
    sm: { title: 'text-sm', description: 'text-xs', button: 'text-xs' },
    md: { title: 'text-base', description: 'text-sm', button: 'text-sm' },
    lg: { title: 'text-lg', description: 'text-base', button: 'text-base' }
  };
  
  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };
  
  const content = (
    <div className={cn(sizeClasses[size])}>
      {/* Icon and Title */}
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0 p-2 bg-primary/10 rounded-full">
          <User className={cn(iconSizeClasses[size], "text-primary")} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-semibold text-base-content leading-tight",
            textSizeClasses[size].title
          )}>
            Complete Profile for Matches
          </h3>
          <p className={cn(
            "text-base-content/70 leading-relaxed",
            textSizeClasses[size].description
          )}>
            Add your skills to see compatibility scores for each role
          </p>
        </div>
      </div>
      
      {/* Action Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            {/* Sample match circles */}
            <div className="w-6 h-6 bg-green-100 border-2 border-green-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-green-700">85</span>
            </div>
            <div className="w-6 h-6 bg-yellow-100 border-2 border-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-yellow-700">62</span>
            </div>
            <div className="w-6 h-6 bg-red-100 border-2 border-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-red-700">34</span>
            </div>
          </div>
          <span className={cn(
            "text-base-content/60 font-medium",
            textSizeClasses[size].description
          )}>
            See scores like these
          </span>
        </div>
        
        <Button
          onClick={handleCompleteProfile}
          size={size === 'sm' ? 'sm' : 'default'}
          variant="default"
          className={cn(
            "shrink-0 group",
            textSizeClasses[size].button
          )}
          data-testid="profile-completion-prompt-button"
        >
          Add Skills
          <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </div>
  );
  
  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "w-full bg-gradient-to-r from-primary/5 to-primary/10",
          "border border-primary/20 rounded-lg",
          className
        )}
        data-testid="profile-completion-prompt-banner"
      >
        {content}
      </motion.div>
    );
  }
  
  if (variant === 'overlay') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50",
          className
        )}
        onClick={onClose}
        data-testid="profile-completion-prompt-overlay"
      >
        <Card 
          className="w-full max-w-md bg-base-100 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <CardContent className="p-0">
            {content}
          </CardContent>
        </Card>
      </motion.div>
    );
  }
  
  // Default inline variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
      data-testid="profile-completion-prompt-inline"
    >
      <Card className="bg-base-100/60 backdrop-blur-sm border border-primary/20">
        <CardContent className="p-0">
          {content}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfileCompletionPrompt;