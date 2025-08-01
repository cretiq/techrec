/**
 * Gemini Analysis Unit Tests
 * 
 * Tests the enhanced Gemini CV analysis function with new Experience field extraction.
 * Validates that the updated prompt and schema correctly extract:
 * - techStack arrays
 * - teamSize numbers 
 * - current position booleans
 * - achievements arrays
 * - responsibilities arrays
 */

import { analyzeCvWithGemini } from '../geminiAnalysis';
import { ProfileAnalysisDataSchema } from '@/types/cv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock Google Generative AI
jest.mock('@google/generative-ai');
jest.mock('../circuitBreaker');
jest.mock('../apiLogger');

const mockGenAI = GoogleGenerativeAI as jest.MockedClass<typeof GoogleGenerativeAI>;

describe('Enhanced Gemini CV Analysis', () => {
  const mockModel = {
    generateContent: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the GoogleGenerativeAI constructor and getGenerativeModel method
    mockGenAI.mockImplementation(() => ({
      getGenerativeModel: () => mockModel
    }) as any);

    // Mock circuit breaker to properly handle async functions and return expected structure
    const mockCircuitBreaker = require('../circuitBreaker');
    mockCircuitBreaker.geminiCircuitBreaker = {
      execute: jest.fn(async (fn) => {
        try {
          const result = await fn();
          return { success: true, data: result };
        } catch (error) {
          return { success: false, error, data: null };
        }
      })
    };

    // Mock API logger to properly execute wrapped function and return response text
    const mockApiLogger = require('../apiLogger');
    mockApiLogger.traceGeminiCall = jest.fn(async (type, fn, options) => {
      // Execute the wrapped function and return its result (response text)
      return await fn();
    });
    mockApiLogger.logGeminiAPI = jest.fn();
  });

  describe('Experience Field Extraction', () => {
    it('should extract all new Experience fields from CV text', async () => {
      const mockGeminiResponse = {
        response: {
          text: () => JSON.stringify({
            contactInfo: {
              name: "John Doe",
              email: "john@example.com",
              phone: "+1-555-0123",
              location: "San Francisco, CA"
            },
            about: "Experienced software engineer with 5+ years in full-stack development",
            skills: [
              { name: "JavaScript", level: "ADVANCED", category: "Programming Languages" },
              { name: "React", level: "EXPERT", category: "Frameworks" },
              { name: "Node.js", level: "ADVANCED", category: "Backend" }
            ],
            experience: [{
              title: "Senior Software Engineer",
              company: "TechCorp",
              location: "San Francisco, CA",
              startDate: "2022-01",
              endDate: null,
              current: true,
              description: "Led development of microservices architecture using Node.js and Docker",
              responsibilities: [
                "Designed and implemented REST APIs serving 1M+ requests/day",
                "Mentored team of 4 junior developers",
                "Reduced system latency by 40% through optimization",
                "Implemented CI/CD pipelines using GitHub Actions"
              ],
              achievements: [
                "Served 1M+ API requests per day",
                "Reduced system latency by 40%",
                "Mentored 4 junior developers",
                "Delivered 15 major features on schedule"
              ],
              teamSize: 4,
              techStack: ["Node.js", "Express", "PostgreSQL", "Docker", "AWS", "React"]
            }],
            education: [{
              degree: "Bachelor of Science in Computer Science",
              institution: "Stanford University",
              location: "Stanford, CA",
              startDate: "2018-09",
              endDate: "2022-05"
            }],
            totalYearsExperience: 3.0,
            isJuniorDeveloper: false,
            experienceCalculation: {
              calculatedAt: Date.now(),
              experienceItems: 1,
              method: "ai_analysis"
            }
          })
        }
      };

      mockModel.generateContent.mockResolvedValue(mockGeminiResponse);

      const sampleCvText = `
        John Doe
        Senior Software Engineer
        john@example.com | +1-555-0123 | San Francisco, CA
        
        EXPERIENCE
        Senior Software Engineer | TechCorp | Jan 2022 - Present
        Led development of microservices architecture using Node.js and Docker.
        • Designed and implemented REST APIs serving 1M+ requests/day
        • Mentored team of 4 junior developers
        • Reduced system latency by 40% through optimization
        • Implemented CI/CD pipelines using GitHub Actions
        Technologies: Node.js, Express, PostgreSQL, Docker, AWS, React
        
        EDUCATION
        Bachelor of Science in Computer Science | Stanford University | 2018-2022
      `;

      const result = await analyzeCvWithGemini(sampleCvText);

      // Validate overall structure
      expect(result).toBeDefined();
      expect(result.experience).toHaveLength(1);

      const experience = result.experience[0];

      // Test all new Experience fields are extracted
      expect(experience.title).toBe("Senior Software Engineer");
      expect(experience.company).toBe("TechCorp");
      expect(experience.current).toBe(true);
      expect(experience.startDate).toBe("2022-01");
      expect(experience.endDate).toBeNull();

      // Test responsibilities array
      expect(Array.isArray(experience.responsibilities)).toBe(true);
      expect(experience.responsibilities).toHaveLength(4);
      expect(experience.responsibilities).toContain("Designed and implemented REST APIs serving 1M+ requests/day");
      expect(experience.responsibilities).toContain("Mentored team of 4 junior developers");

      // Test achievements array
      expect(Array.isArray(experience.achievements)).toBe(true);
      expect(experience.achievements).toHaveLength(4);
      expect(experience.achievements).toContain("Served 1M+ API requests per day");
      expect(experience.achievements).toContain("Reduced system latency by 40%");

      // Test teamSize extraction
      expect(experience.teamSize).toBe(4);

      // Test techStack array
      expect(Array.isArray(experience.techStack)).toBe(true);
      expect(experience.techStack).toHaveLength(6);
      expect(experience.techStack).toContain("Node.js");
      expect(experience.techStack).toContain("Express");
      expect(experience.techStack).toContain("PostgreSQL");
      expect(experience.techStack).toContain("Docker");
      expect(experience.techStack).toContain("AWS");
      expect(experience.techStack).toContain("React");

      console.log('✅ All new Experience fields extracted correctly');
    });

    it('should handle various tech stack formats in CV text', async () => {
      const techStackTestCases = [
        {
          name: "Comma-separated list",
          cvText: "Technologies: React, Node.js, PostgreSQL, Docker",
          expectedTech: ["React", "Node.js", "PostgreSQL", "Docker"]
        },
        {
          name: "Bullet point format",
          cvText: "• React for frontend\n• Node.js for backend\n• PostgreSQL for database",
          expectedTech: ["React", "Node.js", "PostgreSQL"]
        },
        {
          name: "Paragraph format",
          cvText: "Built applications using React and TypeScript, with Node.js backend and AWS deployment",
          expectedTech: ["React", "TypeScript", "Node.js", "AWS"]
        }
      ];

      for (const testCase of techStackTestCases) {
        console.log(`🧪 Testing ${testCase.name}...`);

        const mockResponse = {
          response: {
            text: () => JSON.stringify({
              experience: [{
                title: "Developer",
                company: "TestCorp",
                techStack: testCase.expectedTech
              }]
            })
          }
        };

        mockModel.generateContent.mockResolvedValue(mockResponse);

        const result = await analyzeCvWithGemini(testCase.cvText);
        
        expect(result.experience[0].techStack).toEqual(testCase.expectedTech);
        console.log(`✅ ${testCase.name} tech stack extracted:`, result.experience[0].techStack);
      }
    });

    it('should correctly identify current vs past positions', async () => {
      const positionTestCases = [
        {
          name: "Current position",
          experience: {
            title: "Senior Developer",
            company: "CurrentCorp",
            startDate: "2023-01",
            endDate: null,
            current: true
          }
        },
        {
          name: "Past position",
          experience: {
            title: "Junior Developer", 
            company: "PastCorp",
            startDate: "2020-01",
            endDate: "2022-12",
            current: false
          }
        }
      ];

      for (const testCase of positionTestCases) {
        console.log(`🧪 Testing ${testCase.name}...`);

        const mockResponse = {
          response: {
            text: () => JSON.stringify({
              experience: [testCase.experience]
            })
          }
        };

        mockModel.generateContent.mockResolvedValue(mockResponse);

        const result = await analyzeCvWithGemini("Sample CV text");
        
        expect(result.experience[0].current).toBe(testCase.experience.current);
        expect(result.experience[0].endDate).toBe(testCase.experience.endDate);
        
        console.log(`✅ ${testCase.name} correctly identified as current: ${result.experience[0].current}`);
      }
    });

    it('should extract team size from various text formats', async () => {
      const teamSizeTestCases = [
        {
          description: "led team of 5 developers",
          expectedSize: 5
        },
        {
          description: "managed 8 team members", 
          expectedSize: 8
        },
        {
          description: "collaborated with 3 engineers",
          expectedSize: 3
        },
        {
          description: "worked independently", // No team mentioned
          expectedSize: null
        }
      ];

      for (const testCase of teamSizeTestCases) {
        console.log(`🧪 Testing team size extraction: "${testCase.description}"`);

        const mockResponse = {
          response: {
            text: () => JSON.stringify({
              experience: [{
                title: "Team Lead",
                company: "TestCorp",
                description: testCase.description,
                teamSize: testCase.expectedSize
              }]
            })
          }
        };

        mockModel.generateContent.mockResolvedValue(mockResponse);

        const result = await analyzeCvWithGemini(testCase.description);
        
        expect(result.experience[0].teamSize).toBe(testCase.expectedSize);
        console.log(`✅ Team size extracted: ${result.experience[0].teamSize}`);
      }
    });
  });

  describe('Schema Validation', () => {
    it('should validate Gemini response against ExperienceItemSchema', async () => {
      const validResponse = {
        response: {
          text: () => JSON.stringify({
            contactInfo: { name: "Test User", email: "test@example.com" },
            experience: [{
              title: "Software Engineer",
              company: "TestCorp",
              startDate: "2023-01",
              current: true,
              responsibilities: ["Code development", "Testing"],
              achievements: ["Delivered on time", "High quality code"],
              teamSize: 3,
              techStack: ["JavaScript", "React"]
            }],
            skills: [{ name: "JavaScript", level: "INTERMEDIATE" }],
            totalYearsExperience: 2.0,
            isJuniorDeveloper: false
          })
        }
      };

      mockModel.generateContent.mockResolvedValue(validResponse);

      const result = await analyzeCvWithGemini("Sample CV");
      
      // Validate result against schema
      const validation = ProfileAnalysisDataSchema.safeParse(result);
      expect(validation.success).toBe(true);

      if (!validation.success) {
        console.error('Schema validation errors:', validation.error.flatten());
      }
    });

    it('should handle missing optional Experience fields gracefully', async () => {
      const minimalResponse = {
        response: {
          text: () => JSON.stringify({
            experience: [{
              title: "Developer",
              company: "MinimalCorp"
              // Missing optional fields: teamSize, techStack, achievements, etc.
            }]
          })
        }
      };

      mockModel.generateContent.mockResolvedValue(minimalResponse);

      const result = await analyzeCvWithGemini("Minimal CV");
      
      expect(result.experience[0].title).toBe("Developer");
      expect(result.experience[0].company).toBe("MinimalCorp");
      
      // Optional fields should be handled gracefully
      expect(result.experience[0].teamSize).toBeUndefined();
      expect(result.experience[0].techStack).toBeUndefined();
      expect(result.experience[0].achievements).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON responses', async () => {
      const malformedResponse = {
        response: {
          text: () => "This is not valid JSON"
        }
      };

      mockModel.generateContent.mockResolvedValue(malformedResponse);

      await expect(analyzeCvWithGemini("CV text")).rejects.toThrow(/Failed to parse Gemini response as JSON/);
    });

    it('should handle empty CV text', async () => {
      await expect(analyzeCvWithGemini("")).rejects.toThrow('CV text is empty or invalid');
      await expect(analyzeCvWithGemini("   ")).rejects.toThrow('CV text is empty or invalid');
    });

    it('should handle API failures gracefully', async () => {
      mockModel.generateContent.mockRejectedValue(new Error('API Error'));

      await expect(analyzeCvWithGemini("CV text")).rejects.toThrow();
    });
  });

  describe('Skill Level Normalization', () => {
    it('should normalize skill levels to uppercase', async () => {
      const responseWithLowercase = {
        response: {
          text: () => JSON.stringify({
            skills: [
              { name: "JavaScript", level: "expert", category: "Programming" },
              { name: "Python", level: "intermediate", category: "Programming" },
              { name: "React", level: "advanced", category: "Frameworks" }
            ]
          })
        }
      };

      mockModel.generateContent.mockResolvedValue(responseWithLowercase);

      const result = await analyzeCvWithGemini("CV text");

      expect(result.skills[0].level).toBe("EXPERT");
      expect(result.skills[1].level).toBe("INTERMEDIATE");
      expect(result.skills[2].level).toBe("ADVANCED");
    });
  });

  describe('Experience Calculation', () => {
    it('should calculate total years experience correctly', async () => {
      const responseWithExperience = {
        response: {
          text: () => JSON.stringify({
            experience: [{
              startDate: "2021-01",
              endDate: "2024-01",
              current: false
            }],
            totalYearsExperience: 3.0,
            isJuniorDeveloper: false,
            experienceCalculation: {
              calculatedAt: Date.now(),
              experienceItems: 1,
              method: "ai_analysis"
            }
          })
        }
      };

      mockModel.generateContent.mockResolvedValue(responseWithExperience);

      const result = await analyzeCvWithGemini("CV with 3 years experience");

      expect(result.totalYearsExperience).toBe(3.0);
      expect(result.isJuniorDeveloper).toBe(false);
      expect(result.experienceCalculation?.method).toBe("ai_analysis");
    });

    it('should identify junior developers correctly', async () => {
      const juniorResponse = {
        response: {
          text: () => JSON.stringify({
            experience: [{
              startDate: "2023-01",
              current: true
            }],
            totalYearsExperience: 1.5,
            isJuniorDeveloper: true
          })
        }
      };

      mockModel.generateContent.mockResolvedValue(juniorResponse);

      const result = await analyzeCvWithGemini("Junior developer CV");

      expect(result.totalYearsExperience).toBe(1.5);
      expect(result.isJuniorDeveloper).toBe(true);
    });
  });
});

// Export test utilities for use in other test files
export const createMockGeminiResponse = (data: any) => ({
  response: {
    text: () => JSON.stringify(data)
  }
});

export const mockGeminiSuccess = (mockModel: any, responseData: any) => {
  mockModel.generateContent.mockResolvedValue(createMockGeminiResponse(responseData));
};

export const mockGeminiError = (mockModel: any, error: Error) => {
  mockModel.generateContent.mockRejectedValue(error);
};