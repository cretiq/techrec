/**
 * ProfileUpdateSchema Validation Tests
 * 
 * These tests validate that our API schema correctly handles:
 * 1. Valid profile update payloads
 * 2. Invalid data with proper error messages  
 * 3. Optional field handling
 * 4. Data type validation
 * 5. Edge cases and boundary conditions
 * 
 * This ensures the API contract is bulletproof before data hits the database.
 */

import { ProfileUpdateSchema } from '../types';

describe('ProfileUpdateSchema Validation', () => {
  describe('Valid Profile Data', () => {
    it('should validate complete valid profile data', () => {
      const validProfile = {
        name: 'John Doe',
        title: 'Senior Full Stack Developer',
        profileEmail: 'john.doe@example.com',
        about: 'Experienced developer with 8 years of expertise in web development.',
        contactInfo: {
          phone: '+1-555-0123',
          address: '123 Main Street, San Francisco, CA',
          city: 'San Francisco',
          country: 'United States',
          linkedin: 'https://linkedin.com/in/johndoe',
          github: 'https://github.com/johndoe',
          website: 'https://johndoe.dev'
        },
        skills: [
          {
            name: 'JavaScript',
            category: 'Programming Languages',
            level: 'ADVANCED'
          },
          {
            name: 'React',
            category: 'Frontend Frameworks',
            level: 'EXPERT'
          }
        ],
        experience: [
          {
            title: 'Senior Developer',
            company: 'TechCorp',
            description: 'Lead frontend development team',
            location: 'San Francisco, CA',
            startDate: '2021-01-01T00:00:00.000Z',
            endDate: null,
            current: true,
            responsibilities: ['Lead team', 'Code reviews'],
            achievements: ['Improved performance by 40%'],
            teamSize: 5,
            techStack: ['React', 'Node.js'],
            projects: [
              {
                name: 'E-commerce Platform',
                description: 'Built scalable e-commerce solution',
                technologies: ['React', 'Redux', 'Node.js'],
                teamSize: 3,
                role: 'Lead Developer'
              }
            ]
          }
        ],
        education: [
          {
            degree: 'Bachelor of Computer Science',
            institution: 'UC Berkeley',
            year: '2015',
            location: 'Berkeley, CA',
            startDate: '2011-09-01T00:00:00.000Z',
            endDate: '2015-05-01T00:00:00.000Z',
            gpa: 3.8,
            honors: ['Magna Cum Laude'],
            activities: ['Programming Club']
          }
        ],
        achievements: [
          {
            title: 'AWS Certification',
            description: 'Solutions Architect Professional',
            date: '2022-06-01T00:00:00.000Z',
            url: 'https://aws.amazon.com/certification/',
            issuer: 'Amazon Web Services'
          }
        ]
      };

      const result = ProfileUpdateSchema.safeParse(validProfile);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('John Doe');
        expect(result.data.skills).toHaveLength(2);
        expect(result.data.experience).toHaveLength(1);
      }
    });

    it('should validate minimal required fields only', () => {
      const minimalProfile = {
        name: 'Jane Smith',
        title: 'Developer'
      };

      const result = ProfileUpdateSchema.safeParse(minimalProfile);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Jane Smith');
        expect(result.data.title).toBe('Developer');
        expect(result.data.skills).toEqual([]); // Default empty array
        expect(result.data.experience).toEqual([]); // Default empty array
        expect(result.data.education).toEqual([]); // Default empty array
      }
    });

    it('should handle null values for optional fields', () => {
      const profileWithNulls = {
        name: 'Test User',
        title: 'Developer',
        profileEmail: null,
        about: null,
        contactInfo: null,
        skills: [],
        experience: [],
        education: [],
        achievements: []
      };

      const result = ProfileUpdateSchema.safeParse(profileWithNulls);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.profileEmail).toBeNull();
        expect(result.data.about).toBeNull();
        expect(result.data.contactInfo).toBeNull();
      }
    });
  });

  describe('Required Fields Validation', () => {
    it('should reject missing name field', () => {
      const profileMissingName = {
        title: 'Developer',
        profileEmail: 'test@example.com'
      };

      const result = ProfileUpdateSchema.safeParse(profileMissingName);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            path: ['name'],
            message: 'Name is required'
          })
        );
      }
    });

    it('should reject empty name field', () => {
      const profileEmptyName = {
        name: '',
        title: 'Developer'
      };

      const result = ProfileUpdateSchema.safeParse(profileEmptyName);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            path: ['name'],
            message: 'Name is required'
          })
        );
      }
    });

    it('should reject missing title field', () => {
      const profileMissingTitle = {
        name: 'John Doe',
        profileEmail: 'john@example.com'
      };

      const result = ProfileUpdateSchema.safeParse(profileMissingTitle);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            path: ['title'],
            message: 'Professional title is required'
          })
        );
      }
    });

    it('should reject empty title field', () => {
      const profileEmptyTitle = {
        name: 'John Doe',
        title: ''
      };

      const result = ProfileUpdateSchema.safeParse(profileEmptyTitle);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            path: ['title'],
            message: 'Professional title is required'
          })
        );
      }
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'first+last@company.org',
        'user123@test-domain.com'
      ];

      for (const email of validEmails) {
        const profile = {
          name: 'Test User',
          title: 'Developer',
          profileEmail: email
        };

        const result = ProfileUpdateSchema.safeParse(profile);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user.domain.com',
        'user@domain',
        ''
      ];

      for (const email of invalidEmails) {
        const profile = {
          name: 'Test User',
          title: 'Developer',
          profileEmail: email
        };

        const result = ProfileUpdateSchema.safeParse(profile);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.some(issue => 
            issue.path.includes('profileEmail') && 
            issue.message.includes('email')
          )).toBe(true);
        }
      }
    });

    it('should allow null email', () => {
      const profile = {
        name: 'Test User',
        title: 'Developer',
        profileEmail: null
      };

      const result = ProfileUpdateSchema.safeParse(profile);
      expect(result.success).toBe(true);
    });
  });

  describe('Skills Validation', () => {
    it('should validate skill level enums', () => {
      const validLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
      
      for (const level of validLevels) {
        const profile = {
          name: 'Test User',
          title: 'Developer',
          skills: [
            {
              name: 'JavaScript',
              category: 'Programming',
              level: level
            }
          ]
        };

        const result = ProfileUpdateSchema.safeParse(profile);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid skill levels', () => {
      const invalidLevels = ['NOVICE', 'MASTER', 'BASIC', 'HIGH', ''];
      
      for (const level of invalidLevels) {
        const profile = {
          name: 'Test User',
          title: 'Developer',
          skills: [
            {
              name: 'JavaScript',
              category: 'Programming',
              level: level
            }
          ]
        };

        const result = ProfileUpdateSchema.safeParse(profile);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.some(issue => 
            issue.path.toString().includes('skills') &&
            issue.message.includes('Invalid enum value')
          )).toBe(true);
        }
      }
    });

    it('should require skill name and category', () => {
      const profileMissingSkillName = {
        name: 'Test User',
        title: 'Developer',
        skills: [
          {
            category: 'Programming',
            level: 'ADVANCED'
          }
        ]
      };

      const result = ProfileUpdateSchema.safeParse(profileMissingSkillName);
      expect(result.success).toBe(false);
    });

    it('should handle empty skills array', () => {
      const profile = {
        name: 'Test User',
        title: 'Developer',
        skills: []
      };

      const result = ProfileUpdateSchema.safeParse(profile);
      expect(result.success).toBe(true);
    });
  });

  describe('Experience Validation', () => {
    it('should validate required experience fields', () => {
      const requiredFields = ['title', 'company', 'description', 'startDate'];
      
      for (const missingField of requiredFields) {
        const experienceData = {
          title: 'Developer',
          company: 'TechCorp',
          description: 'Built applications',
          startDate: '2020-01-01T00:00:00.000Z',
          endDate: null,
          current: true,
          responsibilities: [],
          achievements: [],
          teamSize: null,
          techStack: [],
          projects: []
        };

        delete (experienceData as any)[missingField];

        const profile = {
          name: 'Test User',
          title: 'Developer',
          experience: [experienceData]
        };

        const result = ProfileUpdateSchema.safeParse(profile);
        expect(result.success).toBe(false);
      }
    });

    it('should validate date formats in experience', () => {
      const invalidDates = ['2020-13-01', 'invalid-date', '2020/01/01', ''];
      
      for (const invalidDate of invalidDates) {
        const profile = {
          name: 'Test User',
          title: 'Developer',
          experience: [
            {
              title: 'Developer',
              company: 'TechCorp',
              description: 'Built applications',
              startDate: invalidDate,
              endDate: null,
              current: true,
              responsibilities: [],
              achievements: [],
              teamSize: null,
              techStack: []
            }
          ]
        };

        const result = ProfileUpdateSchema.safeParse(profile);
        expect(result.success).toBe(false);
      }
    });

    it('should validate experience projects structure', () => {
      const profile = {
        name: 'Test User',
        title: 'Developer',
        experience: [
          {
            title: 'Developer',
            company: 'TechCorp',
            description: 'Built applications',
            startDate: '2020-01-01T00:00:00.000Z',
            endDate: null,
            current: true,
            responsibilities: [],
            achievements: [],
            teamSize: 5,
            techStack: ['React'],
            projects: [
              {
                name: 'Project A',
                description: 'Cool project',
                technologies: ['React', 'Node.js'],
                teamSize: 3,
                role: 'Lead Dev'
              }
            ]
          }
        ]
      };

      const result = ProfileUpdateSchema.safeParse(profile);
      expect(result.success).toBe(true);
    });

    it('should handle missing optional experience fields', () => {
      const profile = {
        name: 'Test User',
        title: 'Developer',
        experience: [
          {
            title: 'Developer',
            company: 'TechCorp',
            description: 'Built applications',
            startDate: '2020-01-01T00:00:00.000Z',
            current: false
            // Missing: endDate, responsibilities, achievements, etc.
          }
        ]
      };

      const result = ProfileUpdateSchema.safeParse(profile);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.experience[0].responsibilities).toEqual([]);
        expect(result.data.experience[0].achievements).toEqual([]);
      }
    });
  });

  describe('Education Validation', () => {
    it('should validate required education fields', () => {
      const profile = {
        name: 'Test User',
        title: 'Developer',
        education: [
          {
            institution: 'UC Berkeley',
            year: '2020',
            startDate: '2016-09-01T00:00:00.000Z',
            endDate: '2020-05-01T00:00:00.000Z'
            // degree is optional (can be null)
          }
        ]
      };

      const result = ProfileUpdateSchema.safeParse(profile);
      expect(result.success).toBe(true);
    });

    it('should reject education missing required institution', () => {
      const profile = {
        name: 'Test User',
        title: 'Developer',
        education: [
          {
            degree: 'Bachelor of Science',
            year: '2020',
            startDate: '2016-09-01T00:00:00.000Z'
            // Missing institution
          }
        ]
      };

      const result = ProfileUpdateSchema.safeParse(profile);
      expect(result.success).toBe(false);
    });

    it('should validate education date formats', () => {
      const profile = {
        name: 'Test User',
        title: 'Developer',
        education: [
          {
            degree: 'Bachelor of Science',
            institution: 'UC Berkeley',
            year: '2020',
            startDate: 'invalid-date',
            endDate: '2020-05-01T00:00:00.000Z'
          }
        ]
      };

      const result = ProfileUpdateSchema.safeParse(profile);
      expect(result.success).toBe(false);
    });

    it('should handle optional education fields', () => {
      const profile = {
        name: 'Test User',
        title: 'Developer',
        education: [
          {
            degree: null, // Optional
            institution: 'UC Berkeley',
            year: '2020',
            location: null, // Optional
            startDate: '2016-09-01T00:00:00.000Z',
            endDate: null, // Optional
            gpa: null, // Optional
            honors: [], // Default empty array
            activities: [] // Default empty array
          }
        ]
      };

      const result = ProfileUpdateSchema.safeParse(profile);
      expect(result.success).toBe(true);
    });
  });

  describe('Achievements Validation', () => {
    it('should validate required achievement fields', () => {
      const profile = {
        name: 'Test User',
        title: 'Developer',
        achievements: [
          {
            title: 'AWS Certification',
            description: 'Solutions Architect',
            date: '2022-01-01T00:00:00.000Z'
            // url and issuer are optional
          }
        ]
      };

      const result = ProfileUpdateSchema.safeParse(profile);
      expect(result.success).toBe(true);
    });

    it('should reject achievements missing required fields', () => {
      const profile = {
        name: 'Test User',
        title: 'Developer',
        achievements: [
          {
            description: 'Solutions Architect',
            date: '2022-01-01T00:00:00.000Z'
            // Missing required title
          }
        ]
      };

      const result = ProfileUpdateSchema.safeParse(profile);
      expect(result.success).toBe(false);
    });

    it('should validate achievement date formats', () => {
      const profile = {
        name: 'Test User',
        title: 'Developer',
        achievements: [
          {
            title: 'AWS Certification',
            description: 'Solutions Architect',
            date: 'not-a-date'
          }
        ]
      };

      const result = ProfileUpdateSchema.safeParse(profile);
      expect(result.success).toBe(false);
    });
  });

  describe('ContactInfo Validation', () => {
    it('should validate all contactInfo fields as optional', () => {
      const profile = {
        name: 'Test User',
        title: 'Developer',
        contactInfo: {
          phone: null,
          address: null,
          city: null,
          country: null,
          linkedin: null,
          github: null,
          website: null
        }
      };

      const result = ProfileUpdateSchema.safeParse(profile);
      expect(result.success).toBe(true);
    });

    it('should handle missing contactInfo entirely', () => {
      const profile = {
        name: 'Test User',
        title: 'Developer',
        contactInfo: null
      };

      const result = ProfileUpdateSchema.safeParse(profile);
      expect(result.success).toBe(true);
    });

    it('should validate partial contactInfo', () => {
      const profile = {
        name: 'Test User',
        title: 'Developer',
        contactInfo: {
          phone: '+1-555-0123',
          linkedin: 'https://linkedin.com/in/test'
          // Other fields missing - should be ok
        }
      };

      const result = ProfileUpdateSchema.safeParse(profile);
      expect(result.success).toBe(true);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle very long text fields', () => {
      const longText = 'a'.repeat(10000);
      
      const profile = {
        name: longText,
        title: longText,
        about: longText
      };

      const result = ProfileUpdateSchema.safeParse(profile);
      // Should succeed - no length limits defined in schema
      expect(result.success).toBe(true);
    });

    it('should handle special characters in text fields', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?`~';
      
      const profile = {
        name: `John ${specialChars} Doe`,
        title: `Developer ${specialChars}`,
        about: `Bio with ${specialChars} characters`
      };

      const result = ProfileUpdateSchema.safeParse(profile);
      expect(result.success).toBe(true);
    });

    it('should handle unicode characters', () => {
      const profile = {
        name: 'José María González',
        title: 'Développeur Senior',
        about: 'Experienced in 机器学习 and العلوم البيانات'
      };

      const result = ProfileUpdateSchema.safeParse(profile);
      expect(result.success).toBe(true);
    });

    it('should handle large arrays', () => {
      const largeSkillsArray = Array.from({ length: 100 }, (_, i) => ({
        name: `Skill ${i}`,
        category: `Category ${i % 10}`,
        level: 'INTERMEDIATE'
      }));

      const profile = {
        name: 'Test User',
        title: 'Developer',
        skills: largeSkillsArray
      };

      const result = ProfileUpdateSchema.safeParse(profile);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.skills).toHaveLength(100);
      }
    });

    it('should handle deeply nested project structures', () => {
      const profile = {
        name: 'Test User',
        title: 'Developer',
        experience: [
          {
            title: 'Developer',
            company: 'TechCorp',
            description: 'Built applications',
            startDate: '2020-01-01T00:00:00.000Z',
            current: true,
            responsibilities: [],
            achievements: [],
            projects: Array.from({ length: 10 }, (_, i) => ({
              name: `Project ${i}`,
              description: `Description ${i}`,
              technologies: [`Tech${i}A`, `Tech${i}B`, `Tech${i}C`],
              teamSize: i + 1,
              role: `Role ${i}`
            }))
          }
        ]
      };

      const result = ProfileUpdateSchema.safeParse(profile);
      expect(result.success).toBe(true);
    });
  });

  describe('Type Coercion and Sanitization', () => {
    it('should handle string numbers in numeric fields', () => {
      const profile = {
        name: 'Test User',
        title: 'Developer',
        experience: [
          {
            title: 'Developer',
            company: 'TechCorp',
            description: 'Built applications',
            startDate: '2020-01-01T00:00:00.000Z',
            current: true,
            responsibilities: [],
            achievements: [],
            teamSize: '5' as any // String instead of number
          }
        ],
        education: [
          {
            institution: 'UC Berkeley',
            year: '2020',
            startDate: '2016-09-01T00:00:00.000Z',
            gpa: '3.8' as any // String instead of number
          }
        ]
      };

      const result = ProfileUpdateSchema.safeParse(profile);
      
      // Schema might coerce strings to numbers, or it might fail
      // This tests the actual behavior of our schema
      if (result.success) {
        expect(typeof result.data.experience[0].teamSize).toBe('number');
        expect(typeof result.data.education[0].gpa).toBe('number');
      } else {
        // If schema is strict about types, that's also valid behavior
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should handle mixed case in enum values', () => {
      const profile = {
        name: 'Test User',
        title: 'Developer',
        skills: [
          {
            name: 'JavaScript',
            category: 'Programming',
            level: 'advanced' as any // lowercase instead of ADVANCED
          }
        ]
      };

      const result = ProfileUpdateSchema.safeParse(profile);
      
      // Should fail since enum values are case-sensitive
      expect(result.success).toBe(false);
    });
  });
});