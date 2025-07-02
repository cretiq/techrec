import {
  isValidTone,
  isValidRequestType,
  validateCoverLetterRequest,
  CoverLetterValidationError,
  CoverLetterGenerationError,
  WORD_BOUNDS
} from '../coverLetter';

describe('coverLetter types and validation', () => {
  describe('WORD_BOUNDS', () => {
    it('should have correct word boundaries for cover letters', () => {
      expect(WORD_BOUNDS.coverLetter.min).toBe(200);
      expect(WORD_BOUNDS.coverLetter.max).toBe(250);
    });

    it('should have correct word boundaries for outreach messages', () => {
      expect(WORD_BOUNDS.outreach.min).toBe(120);
      expect(WORD_BOUNDS.outreach.max).toBe(150);
    });
  });

  describe('isValidTone', () => {
    it('should return true for valid tones', () => {
      expect(isValidTone('formal')).toBe(true);
      expect(isValidTone('friendly')).toBe(true);
      expect(isValidTone('enthusiastic')).toBe(true);
    });

    it('should return false for invalid tones', () => {
      expect(isValidTone('casual')).toBe(false);
      expect(isValidTone('aggressive')).toBe(false);
      expect(isValidTone('')).toBe(false);
      expect(isValidTone('FORMAL')).toBe(false); // Case sensitive
    });
  });

  describe('isValidRequestType', () => {
    it('should return true for valid request types', () => {
      expect(isValidRequestType('coverLetter')).toBe(true);
      expect(isValidRequestType('outreach')).toBe(true);
    });

    it('should return false for invalid request types', () => {
      expect(isValidRequestType('email')).toBe(false);
      expect(isValidRequestType('letter')).toBe(false);
      expect(isValidRequestType('')).toBe(false);
      expect(isValidRequestType('COVERLETTER')).toBe(false); // Case sensitive
    });
  });

  describe('validateCoverLetterRequest', () => {
    const validRequest = {
      developerProfile: {
        id: 'dev1',
        name: 'John Doe',
        email: 'john@example.com',
        skills: [],
        achievements: []
      },
      roleInfo: {
        title: 'Software Engineer',
        description: 'A great role',
        requirements: ['React', 'TypeScript'],
        skills: ['JavaScript', 'Python']
      },
      companyInfo: {
        name: 'TechCorp',
        location: 'San Francisco',
        remote: true,
        attractionPoints: ['Great culture', 'Innovative products']
      },
      jobSourceInfo: {
        source: 'LinkedIn'
      },
      hiringManager: 'Sarah Johnson',
      achievements: ['Led team of 5', 'Improved performance by 40%'],
      requestType: 'coverLetter' as const,
      tone: 'formal' as const
    };

    it('should validate a complete valid request', () => {
      expect(() => validateCoverLetterRequest(validRequest)).not.toThrow();
      const result = validateCoverLetterRequest(validRequest);
      expect(result.roleInfo.title).toBe('Software Engineer');
      expect(result.companyInfo.name).toBe('TechCorp');
    });

    it('should accept minimal required fields', () => {
      const minimalRequest = {
        developerProfile: validRequest.developerProfile,
        roleInfo: validRequest.roleInfo,
        companyInfo: {
          name: 'TechCorp'
        }
      };

      expect(() => validateCoverLetterRequest(minimalRequest)).not.toThrow();
    });

    it('should reject requests missing required role info', () => {
      const invalidRequest = {
        ...validRequest,
        roleInfo: {
          title: '',
          description: '',
          requirements: [],
          skills: []
        }
      };

      expect(() => validateCoverLetterRequest(invalidRequest)).toThrow();
    });

    it('should reject requests missing company name', () => {
      const invalidRequest = {
        ...validRequest,
        companyInfo: {
          name: '',
          location: 'San Francisco'
        }
      };

      expect(() => validateCoverLetterRequest(invalidRequest)).toThrow();
    });

    it('should accept valid optional fields', () => {
      const requestWithOptionals = {
        ...validRequest,
        tone: 'enthusiastic' as const,
        requestType: 'outreach' as const,
        hiringManager: 'John Smith'
      };

      expect(() => validateCoverLetterRequest(requestWithOptionals)).not.toThrow();
      const result = validateCoverLetterRequest(requestWithOptionals);
      expect(result.tone).toBe('enthusiastic');
      expect(result.requestType).toBe('outreach');
      expect(result.hiringManager).toBe('John Smith');
    });

    it('should handle missing optional fields gracefully', () => {
      const requestWithoutOptionals = {
        developerProfile: validRequest.developerProfile,
        roleInfo: validRequest.roleInfo,
        companyInfo: validRequest.companyInfo
      };

      expect(() => validateCoverLetterRequest(requestWithoutOptionals)).not.toThrow();
      const result = validateCoverLetterRequest(requestWithoutOptionals);
      expect(result.tone).toBeUndefined();
      expect(result.requestType).toBeUndefined();
      expect(result.hiringManager).toBeUndefined();
    });

    it('should validate nested objects correctly', () => {
      const requestWithInvalidNesting = {
        ...validRequest,
        companyInfo: {
          name: 'TechCorp',
          attractionPoints: 'not an array' // Should be array
        }
      };

      expect(() => validateCoverLetterRequest(requestWithInvalidNesting)).toThrow();
    });
  });

  describe('Error classes', () => {
    describe('CoverLetterValidationError', () => {
      it('should create error with correct properties', () => {
        const error = new CoverLetterValidationError('Validation failed', { field: 'test' });
        
        expect(error.message).toBe('Validation failed');
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.meta).toEqual({ field: 'test' });
        expect(error.name).toBe('CoverLetterValidationError');
        expect(error).toBeInstanceOf(Error);
      });

      it('should work without meta data', () => {
        const error = new CoverLetterValidationError('Simple validation error');
        
        expect(error.message).toBe('Simple validation error');
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.meta).toEqual({});
      });
    });

    describe('CoverLetterGenerationError', () => {
      it('should create error with correct properties', () => {
        const error = new CoverLetterGenerationError('Generation failed', { provider: 'gemini' });
        
        expect(error.message).toBe('Generation failed');
        expect(error.code).toBe('GENERATION_ERROR');
        expect(error.meta).toEqual({ provider: 'gemini' });
        expect(error.name).toBe('CoverLetterGenerationError');
        expect(error).toBeInstanceOf(Error);
      });

      it('should work without meta data', () => {
        const error = new CoverLetterGenerationError('Simple generation error');
        
        expect(error.message).toBe('Simple generation error');
        expect(error.code).toBe('GENERATION_ERROR');
        expect(error.meta).toEqual({});
      });
    });
  });
});