import { analyzeCvWithGemini } from './geminiAnalysis';
import { generateCoverLetterContentWithGemini } from '../lib/generation/geminiCoverLetterGenerator';
import { GeminiCoverLetterGenerationParams } from '../lib/generation/geminiCoverLetterGenerator';

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
  
  const models = {
    gemini: {
      analysis: 'gemini-1.5-flash',
      generation: 'gemini-1.5-flash',
      outreach: 'gemini-1.5-flash'
    }
  };
  
  return {
    provider,
    model: models[provider][taskType as keyof typeof models[typeof provider]] || models[provider].generation
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