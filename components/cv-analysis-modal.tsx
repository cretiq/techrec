'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CVAnalysis, Skill, Experience, Education, Achievement } from '@/lib/cv-analysis';
import { useToast } from '@/components/ui/use-toast';

interface CVAnalysisModalProps {
  analysis: CVAnalysis;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (analysis: CVAnalysis) => void;
}

export function CVAnalysisModal({ analysis, isOpen, onClose, onConfirm }: CVAnalysisModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(analysis);
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update profile',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review CV Analysis</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="font-semibold mb-2">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p>{analysis.name || 'Not found'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Title</p>
                <p>{analysis.title || 'Not found'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p>{analysis.location || 'Not found'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{analysis.email || 'Not found'}</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="font-semibold mb-2">Skills</h3>
            <div className="grid grid-cols-2 gap-4">
              {analysis.skills.map((skill: Skill, index: number) => (
                <div key={index} className="border p-3 rounded">
                  <p className="font-medium">{skill.name}</p>
                  <p className="text-sm text-gray-500">Level: {skill.level || 'Not specified'}</p>
                  <p className="text-sm text-gray-500">Experience: {skill.yearsOfExperience || 0} years</p>
                </div>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <h3 className="font-semibold mb-2">Experience</h3>
            <div className="space-y-4">
              {analysis.experience.map((exp: Experience, index: number) => (
                <div key={index} className="border p-3 rounded">
                  <p className="font-medium">{exp.title} at {exp.company}</p>
                  <p className="text-sm text-gray-500">{exp.location}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(exp.startDate).toLocaleDateString()} - {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Not specified'}
                  </p>
                  <p className="text-sm mt-2">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <h3 className="font-semibold mb-2">Education</h3>
            <div className="space-y-4">
              {analysis.education.map((edu: Education, index: number) => (
                <div key={index} className="border p-3 rounded">
                  <p className="font-medium">{edu.institution}</p>
                  <p className="text-sm text-gray-500">{edu.degree}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(edu.startDate).toLocaleDateString()} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Not specified'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h3 className="font-semibold mb-2">Achievements</h3>
            <div className="space-y-4">
              {analysis.achievements.map((achievement: Achievement, index: number) => (
                <div key={index} className="border p-3 rounded">
                  <p className="font-medium">{achievement.title}</p>
                  <p className="text-sm text-gray-500">{new Date(achievement.date).toLocaleDateString()}</p>
                  <p className="text-sm mt-2">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Profile'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 