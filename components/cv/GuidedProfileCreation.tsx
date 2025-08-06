'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui-daisy/card';
import { Button } from '@/components/ui-daisy/button';
import { Input } from '@/components/ui-daisy/input';
import { Textarea } from '@/components/ui-daisy/textarea';
import { Label } from '@/components/ui-daisy/label';
import { Progress } from '@/components/ui-daisy/progress';
import { useToast } from '@/components/ui-daisy/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Award,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Lightbulb,
  Target,
  Zap
} from 'lucide-react';

interface GuidedProfileCreationProps {
  onComplete: (profileData: any) => void;
  onCancel: () => void;
}

interface StepData {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  fields: {
    name: string;
    label: string;
    type: string;
    placeholder: string;
    required?: boolean;
    tip?: string;
  }[];
}

const steps: StepData[] = [
  {
    id: 'contact',
    title: 'Contact Information',
    description: 'Let\'s start with the basics',
    icon: User,
    fields: [
      {
        name: 'name',
        label: 'Full Name',
        type: 'text',
        placeholder: 'John Doe',
        required: true,
        tip: 'Use your professional name as it appears on official documents'
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'john.doe@example.com',
        required: true,
        tip: 'Use a professional email address'
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        placeholder: '+1 (555) 123-4567',
        tip: 'Include country code for international opportunities'
      },
      {
        name: 'location',
        label: 'Location',
        type: 'text',
        placeholder: 'San Francisco, CA, USA',
        tip: 'City and country are usually sufficient'
      }
    ]
  },
  {
    id: 'summary',
    title: 'Professional Summary',
    description: 'Tell your story in 2-3 sentences',
    icon: Target,
    fields: [
      {
        name: 'summary',
        label: 'About You',
        type: 'textarea',
        placeholder: 'Experienced software engineer with 5+ years building scalable web applications...',
        required: true,
        tip: 'Focus on your value proposition: years of experience, key skills, and what you\'re looking for'
      }
    ]
  },
  {
    id: 'experience',
    title: 'Work Experience',
    description: 'Add your most recent role',
    icon: Briefcase,
    fields: [
      {
        name: 'jobTitle',
        label: 'Job Title',
        type: 'text',
        placeholder: 'Senior Software Engineer',
        required: true,
        tip: 'Use the exact title from your contract'
      },
      {
        name: 'company',
        label: 'Company',
        type: 'text',
        placeholder: 'Tech Corp',
        required: true
      },
      {
        name: 'startDate',
        label: 'Start Date',
        type: 'month',
        placeholder: '2020-01',
        required: true
      },
      {
        name: 'endDate',
        label: 'End Date',
        type: 'month',
        placeholder: '2024-01',
        tip: 'Leave empty if current role'
      },
      {
        name: 'responsibilities',
        label: 'Key Achievements',
        type: 'textarea',
        placeholder: '• Led team of 5 engineers\n• Increased performance by 40%\n• Built microservices architecture',
        tip: 'Use bullet points and include metrics when possible'
      }
    ]
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Your academic background',
    icon: GraduationCap,
    fields: [
      {
        name: 'degree',
        label: 'Degree',
        type: 'text',
        placeholder: 'Bachelor of Science in Computer Science',
        required: true
      },
      {
        name: 'institution',
        label: 'Institution',
        type: 'text',
        placeholder: 'Stanford University',
        required: true
      },
      {
        name: 'graduationYear',
        label: 'Graduation Year',
        type: 'text',
        placeholder: '2019',
        required: true,
        tip: 'Just the year is fine'
      }
    ]
  },
  {
    id: 'skills',
    title: 'Skills',
    description: 'List your top technical skills',
    icon: Zap,
    fields: [
      {
        name: 'skills',
        label: 'Skills (comma-separated)',
        type: 'text',
        placeholder: 'JavaScript, React, Node.js, Python, AWS',
        required: true,
        tip: 'Include 5-10 most relevant skills for your target roles'
      }
    ]
  }
];

export function GuidedProfileCreation({ onComplete, onCancel }: GuidedProfileCreationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const progress = ((currentStep + 1) / steps.length) * 100;
  const step = steps[currentStep];

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep = () => {
    const currentErrors: Record<string, string> = {};
    const currentStepData = steps[currentStep];

    currentStepData.fields.forEach(field => {
      if (field.required && !formData[field.name]?.trim()) {
        currentErrors[field.name] = `${field.label} is required`;
      }
    });

    setErrors(currentErrors);
    return Object.keys(currentErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Transform data and complete
      const profileData = {
        contactInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          location: formData.location
        },
        about: formData.summary,
        experience: formData.jobTitle ? [{
          title: formData.jobTitle,
          company: formData.company,
          startDate: formData.startDate,
          endDate: formData.endDate || null,
          current: !formData.endDate,
          description: '',
          responsibilities: formData.responsibilities?.split('\n').filter(Boolean) || []
        }] : [],
        education: formData.degree ? [{
          degree: formData.degree,
          institution: formData.institution,
          year: formData.graduationYear,
          startDate: new Date(`${formData.graduationYear}-01-01`),
          endDate: new Date(`${formData.graduationYear}-12-31`)
        }] : [],
        skills: formData.skills?.split(',').map((s: string) => ({
          name: s.trim(),
          category: 'Technical',
          level: 'INTERMEDIATE'
        })) || []
      };

      onComplete(profileData);
      toast({
        title: 'Profile Created!',
        description: 'Your profile has been created successfully',
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="guided-profile-creation-modal">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl"
        data-testid="guided-profile-creation-container"
      >
        <Card variant="transparent" className="backdrop-blur-md" data-testid="guided-profile-creation-card">
          <CardHeader data-testid="guided-profile-creation-header">
            <div className="flex items-center justify-between mb-4" data-testid="guided-profile-creation-header-content">
              <div className="flex items-center gap-3" data-testid="guided-profile-creation-step-info">
                <div className="p-2 bg-primary/10 rounded-lg" data-testid="guided-profile-creation-step-icon-container">
                  <step.icon className="h-6 w-6 text-primary" data-testid={`guided-profile-creation-step-icon-${step.id}`} />
                </div>
                <div data-testid="guided-profile-creation-step-text">
                  <CardTitle data-testid={`guided-profile-creation-step-title-${step.id}`}>{step.title}</CardTitle>
                  <CardDescription data-testid={`guided-profile-creation-step-description-${step.id}`}>{step.description}</CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                data-testid="guided-profile-creation-cancel-button"
              >
                Cancel
              </Button>
            </div>
            <Progress value={progress} className="h-2" data-testid="guided-profile-creation-progress" />
            <p className="text-xs text-muted-foreground mt-2" data-testid="guided-profile-creation-step-counter">
              Step {currentStep + 1} of {steps.length}
            </p>
          </CardHeader>

          <CardContent className="space-y-6" data-testid="guided-profile-creation-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
                data-testid={`guided-profile-creation-step-${step.id}`}
              >
                {step.fields.map(field => (
                  <div key={field.name} className="space-y-2" data-testid={`guided-profile-creation-field-${field.name}`}>
                    <Label htmlFor={field.name} data-testid={`guided-profile-creation-label-${field.name}`}>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1" data-testid={`guided-profile-creation-required-${field.name}`}>*</span>}
                    </Label>
                    
                    {field.type === 'textarea' ? (
                      <Textarea
                        id={field.name}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className={errors[field.name] ? 'border-red-500' : ''}
                        rows={4}
                        data-testid={`guided-profile-creation-textarea-${field.name}`}
                      />
                    ) : (
                      <Input
                        id={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className={errors[field.name] ? 'border-red-500' : ''}
                        data-testid={`guided-profile-creation-input-${field.name}`}
                      />
                    )}
                    
                    {errors[field.name] && (
                      <p className="text-xs text-red-500" data-testid={`guided-profile-creation-error-${field.name}`}>{errors[field.name]}</p>
                    )}
                    
                    {field.tip && (
                      <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg" data-testid={`guided-profile-creation-tip-${field.name}`}>
                        <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" data-testid={`guided-profile-creation-tip-icon-${field.name}`} />
                        <p className="text-xs text-muted-foreground" data-testid={`guided-profile-creation-tip-text-${field.name}`}>{field.tip}</p>
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between pt-4" data-testid="guided-profile-creation-navigation">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                data-testid="guided-profile-creation-previous-button"
              >
                <ChevronLeft className="h-4 w-4 mr-2" data-testid="guided-profile-creation-previous-icon" />
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90"
                data-testid="guided-profile-creation-next-button"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    Complete
                    <Check className="h-4 w-4 ml-2" data-testid="guided-profile-creation-complete-icon" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" data-testid="guided-profile-creation-next-icon" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}