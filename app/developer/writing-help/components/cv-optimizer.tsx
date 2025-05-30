"use client"

import { useState, useRef, ChangeEvent } from 'react';
import {  Button  } from '@/components/ui-daisy/button';
import {  Card  } from '@/components/ui-daisy/card';
import { Textarea } from "@/components/ui-daisy/textarea";
import { useAuth } from '@/app/hooks/useAuth';
import { cn } from '@/lib/utils';

interface Suggestion {
  original: string;
  improved: string;
  accepted?: boolean;
}

interface CVOptimizerProps {
  className?: string;
}

export function CVOptimizer({ className }: CVOptimizerProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [cvText, setCvText] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCvText(text);
      };
      reader.readAsText(file);
    }
  };

  const optimizeCV = async () => {
    if (!cvText || !jobDescription) return;
    
    setIsOptimizing(true);
    // Mock suggestions for now
    const mockSuggestions: Suggestion[] = [
      {
        original: "Developed web applications",
        improved: "Engineered scalable web solutions that increased user engagement by 45%"
      },
      {
        original: "Managed team projects",
        improved: "Led cross-functional teams of 8+ developers, delivering projects 20% ahead of schedule"
      }
    ];
    
    setTimeout(() => {
      setSuggestions(mockSuggestions);
      setIsOptimizing(false);
    }, 2000);
  };

  const handleSuggestion = (index: number, accept: boolean) => {
    setSuggestions(prev => prev.map((s, i) => 
      i === index ? { ...s, accepted: accept } : s
    ));
  };

  const exportOptimizedCV = () => {
    let optimizedText = cvText;
    suggestions.forEach(s => {
      if (s.accepted) {
        optimizedText = optimizedText.replace(s.original, s.improved);
      }
    });

    const blob = new Blob([optimizedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized-cv.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
        <div className="space-y-4">
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.doc,.docx,.pdf"
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              Upload CV
            </Button>
            {file && <p className="mt-2 text-sm text-gray-600">Uploaded: {file.name}</p>}
          </div>
          <Textarea
            placeholder="Paste your CV text here..."
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            className="min-h-[200px] bg-white/80"
          />
        </div>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
        <Textarea
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="min-h-[150px] bg-white/80"
        />
      </Card>

      <Button
        onClick={optimizeCV}
        disabled={!cvText || !jobDescription || isOptimizing}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
      >
        {isOptimizing ? 'Optimizing...' : 'Optimize CV'}
      </Button>

      {suggestions.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
          <h3 className="text-lg font-semibold mb-4">Suggested Improvements</h3>
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="p-3 bg-white/80 rounded-lg">
                <p className="text-sm text-gray-600">Original:</p>
                <p className="mb-2">{suggestion.original}</p>
                <p className="text-sm text-gray-600">Improved:</p>
                <p className="mb-3">{suggestion.improved}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSuggestion(index, true)}
                    disabled={suggestion.accepted === true}
                    variant="outline"
                    className="flex-1"
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={() => handleSuggestion(index, false)}
                    disabled={suggestion.accepted === false}
                    variant="outline"
                    className="flex-1"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button
            onClick={exportOptimizedCV}
            className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          >
            Export Optimized CV
          </Button>
        </Card>
      )}
    </div>
  );
} 