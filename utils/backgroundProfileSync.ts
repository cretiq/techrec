/**
 * Background Profile Sync Utility
 * 
 * Automatically syncs CV analysis data to developer profile in background
 * without affecting user experience. Includes comprehensive logging for
 * troubleshooting and error isolation.
 */

import { PrismaClient } from '@prisma/client';
import { ProfileAnalysisData, ContactInfoData, Skill, ExperienceItem, EducationItem, AchievementItem } from '@/types/cv';
import { ProfileUpdatePayload } from '@/types/types';

const prisma = new PrismaClient();

// Debugging configuration
const DEBUG_PROFILE_SYNC = process.env.DEBUG_PROFILE_SYNC === 'true';
const DISABLE_PROFILE_SYNC = process.env.DISABLE_PROFILE_SYNC === 'true';
const PROFILE_SYNC_TIMEOUT = parseInt(process.env.PROFILE_SYNC_TIMEOUT || '10000'); // 10 seconds default
const LOG_PREFIX = '[PROFILE_SYNC]';

/**
 * Debug logging utility
 */
function debugLog(message: string, data?: any) {
  if (DEBUG_PROFILE_SYNC) {
    console.log(`${LOG_PREFIX} ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
}

/**
 * Error logging utility
 */
function errorLog(message: string, error?: any) {
  console.error(`${LOG_PREFIX} ERROR: ${message}`, error);
}

/**
 * Transform CV contact info to profile contact info format
 */
function transformContactInfo(cvContactInfo: ContactInfoData | null | undefined): ProfileUpdatePayload['contactInfo'] {
  debugLog('Transforming contact info', cvContactInfo);
  
  if (!cvContactInfo) {
    debugLog('No contact info to transform');
    return null;
  }

  const transformed = {
    phone: cvContactInfo.phone || null,
    address: cvContactInfo.location || null, // CV uses 'location', profile uses 'address'
    city: null, // CV doesn't have separate city field
    country: null, // CV doesn't have separate country field
    linkedin: cvContactInfo.linkedin || null,
    github: cvContactInfo.github || null,
    website: cvContactInfo.website || null,
  };

  debugLog('Transformed contact info', transformed);
  return transformed;
}

/**
 * Transform CV skills to profile skills format
 */
function transformSkills(cvSkills: Skill[] | null | undefined): ProfileUpdatePayload['skills'] {
  debugLog('Transforming skills', cvSkills);
  
  if (!cvSkills || !Array.isArray(cvSkills)) {
    debugLog('No skills to transform or invalid format');
    return [];
  }

  const transformed = cvSkills
    .filter(skill => skill.name && skill.name.trim() !== '')
    .map(skill => ({
      name: skill.name!,
      category: skill.category || 'General', // Default category if not specified
      level: skill.level || 'INTERMEDIATE', // Default level if not specified
    }));

  debugLog(`Transformed ${transformed.length} skills`, transformed);
  return transformed;
}

/**
 * Transform CV experience to profile experience format
 */
function transformExperience(cvExperience: ExperienceItem[] | null | undefined): ProfileUpdatePayload['experience'] {
  debugLog('Transforming experience', cvExperience);
  
  if (!cvExperience || !Array.isArray(cvExperience)) {
    debugLog('No experience to transform or invalid format');
    return [];
  }

  const transformed = cvExperience
    .filter(exp => exp.title && exp.company)
    .map(exp => {
      // Determine if position is current (no endDate or endDate is null/empty)
      const current = !exp.endDate || exp.endDate.trim() === '';
      
      return {
        title: exp.title!,
        company: exp.company!,
        description: exp.description || '',
        location: exp.location || null,
        startDate: exp.startDate || new Date().toISOString(), // Default to current date if missing
        endDate: current ? null : exp.endDate,
        current,
        responsibilities: exp.responsibilities || [],
        achievements: [], // CV doesn't separate achievements from responsibilities
        teamSize: null, // CV doesn't include team size
        techStack: [], // CV doesn't include tech stack separately
      };
    });

  debugLog(`Transformed ${transformed.length} experience entries`, transformed);
  return transformed;
}

/**
 * Transform CV education to profile education format
 */
function transformEducation(cvEducation: EducationItem[] | null | undefined): ProfileUpdatePayload['education'] {
  debugLog('Transforming education', cvEducation);
  
  if (!cvEducation || !Array.isArray(cvEducation)) {
    debugLog('No education to transform or invalid format');
    return [];
  }

  const transformed = cvEducation
    .filter(edu => edu.institution)
    .map(edu => ({
      degree: edu.degree || null,
      institution: edu.institution!,
      year: edu.year || new Date().getFullYear().toString(), // Default to current year
      location: edu.location || null,
      startDate: edu.startDate || new Date().toISOString(), // Default to current date
      endDate: edu.endDate || null,
      gpa: null, // CV doesn't include GPA
      honors: [], // CV doesn't include honors separately
      activities: [], // CV doesn't include activities separately
    }));

  debugLog(`Transformed ${transformed.length} education entries`, transformed);
  return transformed;
}

/**
 * Transform CV achievements to profile achievements format
 */
function transformAchievements(cvAchievements: AchievementItem[] | null | undefined): ProfileUpdatePayload['achievements'] {
  debugLog('Transforming achievements', cvAchievements);
  
  if (!cvAchievements || !Array.isArray(cvAchievements)) {
    debugLog('No achievements to transform or invalid format');
    return [];
  }

  const transformed = cvAchievements
    .filter(ach => ach.title && ach.description)
    .map(ach => ({
      title: ach.title!,
      description: ach.description!,
      date: ach.date || new Date().toISOString(), // Default to current date
      url: ach.url || null,
      issuer: ach.issuer || null,
    }));

  debugLog(`Transformed ${transformed.length} achievements`, transformed);
  return transformed;
}

/**
 * Transform complete CV analysis data to profile update payload
 */
function transformCvToProfileData(cvAnalysis: ProfileAnalysisData, existingProfile?: any): ProfileUpdatePayload {
  debugLog('Starting CV to profile transformation', { 
    hasContactInfo: !!cvAnalysis.contactInfo,
    skillsCount: cvAnalysis.skills?.length || 0,
    experienceCount: cvAnalysis.experience?.length || 0,
    educationCount: cvAnalysis.education?.length || 0,
    achievementsCount: cvAnalysis.achievements?.length || 0,
  });

  // Use existing profile data as base, override with CV data
  const payload: ProfileUpdatePayload = {
    name: cvAnalysis.contactInfo?.name || existingProfile?.name || 'Unknown',
    title: existingProfile?.title || 'Developer', // Keep existing title or use default
    profileEmail: cvAnalysis.contactInfo?.email || existingProfile?.profileEmail || null,
    about: cvAnalysis.about || existingProfile?.about || null,
    contactInfo: transformContactInfo(cvAnalysis.contactInfo),
    skills: transformSkills(cvAnalysis.skills),
    experience: transformExperience(cvAnalysis.experience),
    education: transformEducation(cvAnalysis.education),
    achievements: transformAchievements(cvAnalysis.achievements),
    customRoles: existingProfile?.customRoles || [], // Preserve existing custom roles
  };

  debugLog('Completed CV to profile transformation', {
    name: payload.name,
    hasContactInfo: !!payload.contactInfo,
    skillsCount: payload.skills?.length || 0,
    experienceCount: payload.experience?.length || 0,
    educationCount: payload.education?.length || 0,
    achievementsCount: payload.achievements?.length || 0,
  });

  return payload;
}

/**
 * Get existing profile data for merging
 */
async function getExistingProfile(developerId: string): Promise<any> {
  debugLog(`Fetching existing profile for developer: ${developerId}`);
  
  try {
    const profile = await prisma.developer.findUnique({
      where: { id: developerId },
      include: {
        contactInfo: true,
        developerSkills: {
          include: {
            skill: {
              include: {
                category: true
              }
            }
          }
        },
        experience: true,
        education: true,
        achievements: true,
        customRoles: true,
      }
    });

    debugLog('Fetched existing profile', { 
      found: !!profile,
      hasContactInfo: !!profile?.contactInfo,
      skillsCount: profile?.developerSkills?.length || 0,
    });

    return profile;
  } catch (error) {
    errorLog('Failed to fetch existing profile', error);
    return null;
  }
}

/**
 * Make internal API call to update profile
 */
async function callProfileUpdateAPI(developerId: string, payload: ProfileUpdatePayload): Promise<boolean> {
  debugLog(`Making internal API call to update profile for developer: ${developerId}`);
  
  try {
    // Construct the full API URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/developer/me/profile`;
    
    debugLog('API call details', {
      url: apiUrl,
      method: 'PUT',
      payloadSize: JSON.stringify(payload).length,
    });

    // Create a mock request with authentication context
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-developer-id': developerId, // Custom header for internal calls
      },
      body: JSON.stringify(payload),
    });

    debugLog('API response status', { status: response.status, ok: response.ok });

    if (!response.ok) {
      const errorText = await response.text();
      errorLog(`Profile update API call failed: ${response.status}`, errorText);
      return false;
    }

    const result = await response.json();
    debugLog('Profile update successful', { updatedProfileId: result.id });
    return true;

  } catch (error) {
    errorLog('Profile update API call threw error', error);
    return false;
  }
}

/**
 * Alternative direct database update (fallback if API approach doesn't work)
 */
async function updateProfileDirectly(developerId: string, payload: ProfileUpdatePayload): Promise<boolean> {
  debugLog(`Direct database profile update for developer: ${developerId}`);
  
  try {
    // Update the profile with validated data (replicating the API logic)
    const updatedProfile = await prisma.developer.update({
      where: { id: developerId },
      data: {
        name: payload.name,
        title: payload.title,
        profileEmail: payload.profileEmail,
        about: payload.about,
        contactInfo: payload.contactInfo ? {
          upsert: {
            create: {
              phone: payload.contactInfo.phone,
              address: payload.contactInfo.address,
              city: payload.contactInfo.city,
              country: payload.contactInfo.country,
              linkedin: payload.contactInfo.linkedin,
              github: payload.contactInfo.github,
              website: payload.contactInfo.website,
            },
            update: {
              phone: payload.contactInfo.phone,
              address: payload.contactInfo.address,
              city: payload.contactInfo.city,
              country: payload.contactInfo.country,
              linkedin: payload.contactInfo.linkedin,
              github: payload.contactInfo.github,
              website: payload.contactInfo.website
            }
          }
        } : undefined,
        developerSkills: {
          deleteMany: {},
          create: await Promise.all(payload.skills?.map(async skill => {
            // First ensure the skill category exists
            const category = await prisma.skillCategory.upsert({
              where: { name: skill.category },
              create: { name: skill.category },
              update: {}
            });

            return {
              skill: {
                connectOrCreate: {
                  where: { name: skill.name },
                  create: { 
                    name: skill.name,
                    category: {
                      connect: { id: category.id }
                    }
                  }
                }
              },
              level: skill.level as any
            };
          }) || [])
        },
        experience: {
          deleteMany: {},
          create: payload.experience?.map(exp => {
            // Safely parse dates, handling invalid date strings
            const startDate = exp.startDate ? new Date(exp.startDate) : new Date();
            const endDate = exp.endDate && exp.endDate !== 'Present' && exp.endDate.trim() !== '' 
              ? new Date(exp.endDate) 
              : null;
            
            // Validate dates are not invalid
            return {
              ...exp,
              startDate: isNaN(startDate.getTime()) ? new Date() : startDate,
              endDate: endDate && isNaN(endDate.getTime()) ? null : endDate
            };
          }) || []
        },
        education: {
          deleteMany: {},
          create: payload.education?.map(edu => ({
            ...edu,
            startDate: new Date(edu.startDate),
            endDate: edu.endDate ? new Date(edu.endDate) : null
          })) || []
        },
        achievements: {
          deleteMany: {},
          create: payload.achievements?.map(ach => ({
            ...ach,
            date: new Date(ach.date)
          })) || []
        }
      },
    });

    debugLog('Direct profile update successful', { updatedProfileId: updatedProfile.id });
    return true;

  } catch (error) {
    errorLog('Direct profile update failed', error);
    return false;
  }
}

/**
 * Main function to sync CV data to developer profile
 * 
 * @param developerId - The developer's ID
 * @param analysisData - The CV analysis data to sync
 * @returns Promise<void> - Silent operation, errors are logged but not thrown
 */
export async function syncCvDataToProfile(developerId: string, analysisData: ProfileAnalysisData): Promise<void> {
  const startTime = Date.now();
  debugLog(`Starting background profile sync for developer: ${developerId}`);
  
  // Check if profile sync is disabled
  if (DISABLE_PROFILE_SYNC) {
    debugLog('Profile sync is disabled via environment variable DISABLE_PROFILE_SYNC');
    return;
  }
  
  try {
    // Wrap the entire sync operation in a timeout
    await Promise.race([
      performSync(developerId, analysisData, startTime),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile sync timeout')), PROFILE_SYNC_TIMEOUT)
      )
    ]);
  } catch (error) {
    const duration = Date.now() - startTime;
    if (error instanceof Error && error.message === 'Profile sync timeout') {
      errorLog(`Background profile sync timed out after ${PROFILE_SYNC_TIMEOUT}ms (actual: ${duration}ms)`);
    } else {
      errorLog(`Background profile sync threw unexpected error after ${duration}ms`, error);
    }
  }
}

/**
 * Internal sync function with timeout protection
 */
async function performSync(developerId: string, analysisData: ProfileAnalysisData, startTime: number): Promise<void> {
    // Validate inputs
    if (!developerId || typeof developerId !== 'string') {
      errorLog('Invalid developerId provided', { developerId });
      return;
    }

    if (!analysisData || typeof analysisData !== 'object') {
      errorLog('Invalid analysisData provided', { analysisData });
      return;
    }

    debugLog('Input validation passed', {
      developerId,
      hasContactInfo: !!analysisData.contactInfo,
      hasSkills: !!analysisData.skills,
      hasExperience: !!analysisData.experience,
    });

    // Get existing profile for merging
    const existingProfile = await getExistingProfile(developerId);
    
    // Transform CV data to profile format
    const profilePayload = transformCvToProfileData(analysisData, existingProfile);
    
    // Attempt profile update using direct database approach (more reliable for background operations)
    const success = await updateProfileDirectly(developerId, profilePayload);
    
    const duration = Date.now() - startTime;
    
    if (success) {
      debugLog(`Background profile sync completed successfully in ${duration}ms`);
    } else {
      errorLog(`Background profile sync failed after ${duration}ms`);
    }
}

/**
 * Sync CV data from a CV analysis record ID
 * 
 * @param developerId - The developer's ID
 * @param analysisId - The CV analysis record ID
 * @returns Promise<void> - Silent operation, errors are logged but not thrown
 */
export async function syncCvDataFromAnalysisId(developerId: string, analysisId: string): Promise<void> {
  debugLog(`Syncing CV data from analysis ID: ${analysisId} for developer: ${developerId}`);
  
  try {
    // Fetch the analysis record
    const analysisRecord = await prisma.cvAnalysis.findUnique({
      where: { id: analysisId },
      select: { 
        developerId: true, 
        analysisResult: true 
      }
    });

    if (!analysisRecord) {
      errorLog('CV analysis record not found', { analysisId });
      return;
    }

    // Verify ownership
    if (analysisRecord.developerId !== developerId) {
      errorLog('Developer ID mismatch', { 
        expectedDeveloperId: developerId, 
        actualDeveloperId: analysisRecord.developerId 
      });
      return;
    }

    // Extract analysis data
    const analysisData = analysisRecord.analysisResult as ProfileAnalysisData;
    
    if (!analysisData) {
      errorLog('No analysis result data found', { analysisId });
      return;
    }

    // Sync the data
    await syncCvDataToProfile(developerId, analysisData);

  } catch (error) {
    errorLog('Failed to sync CV data from analysis ID', error);
  }
}

export default {
  syncCvDataToProfile,
  syncCvDataFromAnalysisId,
};