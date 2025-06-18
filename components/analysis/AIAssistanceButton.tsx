'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui-daisy/button';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface AIAssistanceButtonProps {
  section: string;
  currentData: any;
  isEmpty?: boolean;
  onImprovement: (improvedData: any) => void;
  className?: string;
}

export function AIAssistanceButton({ 
  section, 
  currentData, 
  isEmpty = false, 
  onImprovement, 
  className 
}: AIAssistanceButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleAIAssistance = async () => {
    setIsProcessing(true);
    
    try {
      // TODO: Implement actual AI API call
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock improvement based on section
      let improvedData = currentData;
      
      switch (section) {
        case 'about':
          if (isEmpty) {
            improvedData = "Experienced software engineer with 5+ years of expertise in full-stack development, specializing in React, Node.js, and cloud technologies. Passionate about building scalable applications and leading cross-functional teams to deliver exceptional user experiences.";
          } else {
            improvedData = currentData + " Known for driving innovation and mentoring junior developers while maintaining high code quality standards.";
          }
          break;
          
        case 'experience':
          if (isEmpty) {
            improvedData = [{
              title: "Software Engineer",
              company: "Your Company",
              description: "Led development of key features and improvements",
              responsibilities: [
                "Developed and maintained web applications using modern frameworks",
                "Collaborated with cross-functional teams to deliver high-quality software",
                "Implemented best practices for code quality and testing"
              ]
            }];
          } else {
            // Enhance existing experience
            improvedData = currentData.map((exp: any) => ({
              ...exp,
              responsibilities: [
                ...exp.responsibilities,
                "Mentored junior developers and conducted code reviews",
                "Optimized application performance and reduced load times by 40%"
              ]
            }));
          }
          break;
          
        case 'skills':
          if (isEmpty) {
            improvedData = [
              { name: "JavaScript", category: "Programming", level: "ADVANCED" },
              { name: "React", category: "Frontend", level: "ADVANCED" },
              { name: "Node.js", category: "Backend", level: "INTERMEDIATE" },
              { name: "AWS", category: "Cloud", level: "INTERMEDIATE" },
              { name: "Git", category: "Tools", level: "ADVANCED" }
            ];
          } else {
            // Add complementary skills
            const newSkills = [
              { name: "TypeScript", category: "Programming", level: "INTERMEDIATE" },
              { name: "Docker", category: "DevOps", level: "INTERMEDIATE" }
            ];
            improvedData = [...currentData, ...newSkills];
          }
          break;
          
        default:
          improvedData = currentData;
      }
      
      onImprovement(improvedData);
      
      toast({
        title: "AI Enhancement Complete!",
        description: `Your ${section} section has been improved with AI suggestions.`,
      });
      
    } catch (error) {
      console.error('AI assistance error:', error);
      toast({
        title: "AI Enhancement Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleAIAssistance}
      disabled={isProcessing}
      className={cn(
        "transition-all duration-200",
        isProcessing && "opacity-75",
        className
      )}
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Enhancing...
        </>
      ) : (
        <>
          {isEmpty ? (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Write this for me
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Improve with AI
            </>
          )}
        </>
      )}
    </Button>
  );
}