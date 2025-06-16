import { analyzeCvWithGPT } from './gptAnalysis';
import { analyzeCvWithGemini } from './geminiAnalysis';
import { generateCoverLetterContent } from '../lib/generation/coverLetterGenerator';
import { generateCoverLetterContentWithGemini } from '../lib/generation/geminiCoverLetterGenerator';
import { CoverLetterGenerationParams } from '../lib/generation/coverLetterGenerator';
import { GeminiCoverLetterGenerationParams } from '../lib/generation/geminiCoverLetterGenerator';

export type AIProvider = 'openai' | 'gemini';

export const getDefaultProvider = (): AIProvider => {
  return (process.env.DEFAULT_AI_PROVIDER as AIProvider) || 'openai';
};

export const analyzeCvWithProvider = async (cvText: string, provider?: AIProvider) => {
  const selectedProvider = provider || getDefaultProvider();
  
  switch (selectedProvider) {
    case 'gemini':
      return await analyzeCvWithGemini(cvText);
    case 'openai':
    default:
      return await analyzeCvWithGPT(cvText);
  }
};

export const generateCoverLetterWithProvider = async (
  params: CoverLetterGenerationParams | GeminiCoverLetterGenerationParams, 
  provider?: AIProvider
) => {
  const selectedProvider = provider || getDefaultProvider();
  
  switch (selectedProvider) {
    case 'gemini':
      return await generateCoverLetterContentWithGemini(params as GeminiCoverLetterGenerationParams);
    case 'openai':
    default:
      return await generateCoverLetterContent(params as CoverLetterGenerationParams);
  }
};

export const selectAIProvider = (taskType: string): { provider: AIProvider; model: string } => {
  const provider = getDefaultProvider();
  
  const models = {
    openai: {
      analysis: 'gpt-4o-mini',
      generation: 'gpt-4o-mini',
      outreach: 'gpt-4o-mini'
    },
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
  const selectedProvider = provider || getDefaultProvider();
  
  const endpoints = {
    openai: {
      cvImprovement: '/api/cv-improvement',
      generateCoverLetter: '/api/generate-cover-letter',
      optimizeCv: '/api/optimize-cv',
      generateOutreach: '/api/generate-outreach',
      cvUpload: '/api/cv/upload',
    },
    gemini: {
      cvImprovement: '/api/cv-improvement-gemini',
      generateCoverLetter: '/api/generate-cover-letter-gemini',
      optimizeCv: '/api/optimize-cv-gemini',
      generateOutreach: '/api/generate-outreach-gemini',
      cvUpload: '/api/cv/upload-gemini',
    }
  };
  
  return endpoints[selectedProvider];
}; 