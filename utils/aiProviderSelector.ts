import { analyzeCvWithGemini } from './geminiAnalysis';
import { generateCoverLetterContentWithGemini } from '../lib/generation/geminiCoverLetterGenerator';
import { GeminiCoverLetterGenerationParams } from '../lib/generation/geminiCoverLetterGenerator';
import { getGeminiModel } from '@/lib/modelConfig';

export type AIProvider = 'gemini';

export const getDefaultProvider = (): AIProvider => {
  return 'gemini';
};

export const analyzeCvWithProvider = async (cvText: string, provider?: AIProvider) => {
  return await analyzeCvWithGemini(cvText);
};

export const generateCoverLetterWithProvider = async (
  params: GeminiCoverLetterGenerationParams, 
  provider?: AIProvider
) => {
  return await generateCoverLetterContentWithGemini(params);
};

export const selectAIProvider = (taskType: string): { provider: AIProvider; model: string } => {
  const provider = getDefaultProvider();
  
  // Map task types to model use cases
  const taskTypeMap: Record<string, Parameters<typeof getGeminiModel>[0]> = {
    'analysis': 'cv-analysis',
    'generation': 'cover-letter',
    'outreach': 'outreach',
    'cv-improvement': 'cv-improvement',
    'cv-optimization': 'cv-optimization'
  };
  
  const useCase = taskTypeMap[taskType] || 'general';
  const model = getGeminiModel(useCase);
  
  return {
    provider,
    model
  };
};

export const getProviderEndpoints = (provider?: AIProvider) => {
  // Always return Gemini endpoints since we only use Gemini now
  return {
    cvImprovement: '/api/cv-improvement',
    generateCoverLetter: '/api/generate-cover-letter',
    optimizeCv: '/api/optimize-cv',
    generateOutreach: '/api/generate-outreach',
    cvUpload: '/api/cv/upload',
  };
}; 