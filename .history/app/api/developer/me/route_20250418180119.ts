import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Achievement, Application, CustomRole, DeveloperProfile, Education, Experience, SavedRole, Skill } from '@/types/developer';
import { SkillLevel } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log("Fetching developer profile for user:", session.user.id)

    const developer = await prisma.developer.findUnique({
      where: { id: session.user.id },
      include: {
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
        applications: true,
        savedRoles: true,
        contactInfo: true,
        customRoles: true
      }
    });

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 });
    }

    const skills: Skill[] = developer.developerSkills.map(skill => ({
      id: skill.id,
      name: skill.skill.name,
      category: skill.skill.category?.name || 'Other',
      level: skill.level
    }));

    const achievements: Achievement[] = developer.achievements.map(achievement => ({
      id: achievement.id,
      title: achievement.title || '',
      description: achievement.description,
      date: achievement.date.toISOString(),
      url: achievement.url || null,
      issuer: achievement.issuer || null
    }));

    const experiences: Experience[] = developer.experience.map(exp => ({
      id: exp.id,
      title: exp.title || '',
      company: exp.company,
      description: exp.description,
      location: exp.location || null,
      startDate: exp.startDate.toISOString(),
      endDate: exp.endDate?.toISOString() || null,
      current: exp.current,
      responsibilities: exp.responsibilities || [],
      achievements: exp.achievements || [],
      teamSize: exp.teamSize || null,
      techStack: exp.techStack || []
    }));

    const educationList: Education[] = developer.education.map(edu => ({
      id: edu.id,
      degree: edu.degree || null,
      institution: edu.institution,
      year: edu.year,
      location: edu.location || null,
      startDate: edu.startDate.toISOString(),
      endDate: edu.endDate?.toISOString() || null,
      gpa: edu.gpa || null,
      honors: edu.honors || [],
      activities: edu.activities || []
    }));

    const applications: Application[] = developer.applications.map(app => ({
      id: app.id,
      roleId: app.roleId,
      title: app.roleId,
      description: app.coverLetter || '',
      date: app.appliedAt.toISOString(),
      status: app.status
    }));

    const savedRoles: SavedRole[] = developer.savedRoles.map(role => ({
      id: role.id,
      roleId: role.roleId,
      title: role.roleId,
      description: role.notes || '',
      date: role.createdAt.toISOString(),
      notes: role.notes || null
    }));
    
    const customRoles: CustomRole[] = developer.customRoles.map(role => ({
      id: role.id,
      title: role.title,
      description: role.description,
      requirements: role.requirements || [],
      skills: role.skills || [],
      location: role.location,
      salary: role.salary || null,
      type: role.type,
      remote: role.remote,
      visaSponsorship: role.visaSponsorship,
      companyName: role.companyName || null,
      url: role.url || null,
      originalRoleId: role.originalRoleId || null,
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString()
    }));

    const mappedDeveloper: DeveloperProfile = {
      name: developer.name || '',
      email: developer.profileEmail || developer.email || '',
      title: developer.title || '',
      about: developer.about || '',
      phone: developer.contactInfo?.phone || null,
      location: developer.contactInfo?.address || null,
      linkedin: developer.contactInfo?.linkedin || null,
      github: developer.contactInfo?.github || null,
      portfolio: developer.contactInfo?.website || null,
      skills: skills,
      achievements: achievements,
      experience: experiences,
      education: educationList,
      applications: applications,
      savedRoles: savedRoles,
      customRoles: customRoles,
      totalExperience: undefined
    };

    return NextResponse.json(mappedDeveloper);
  } catch (error) {
    console.error('Error fetching developer profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch developer profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile: DeveloperProfile = await request.json();
    console.log("Updating developer profile with data:", profile);
    
    // Upsert Developer fields first
    await prisma.developer.upsert({
      where: {
        id: session.user.id
      },
      create: {
        id: session.user.id, // Ensure ID is provided on create if not defaulting
        title: profile.title || '',
        profileEmail: profile.email || '',
        name: profile.name || '',
        email: profile.email || '',
        about: profile.about || '',
        // Add other required fields for Developer creation here with defaults
      },
      update: {
        title: profile.title || null, // Allow setting back to null on update if desired
        about: profile.about || null,
        profileEmail: profile.email || null,
        name: profile.name || undefined, // Use undefined to avoid overwriting if not provided
        // email is unique, typically shouldn't be updated here without care
      }
    });

    // Upsert ContactInfo fields
    await prisma.contactInfo.upsert({
      where: {
        developerId: session.user.id
      },
      create: {
        developerId: session.user.id,
        phone: profile.phone || null,
        address: profile.location || null, // Map location to address
        // city, state, country aren't directly in DeveloperProfile, handle if needed
        linkedin: profile.linkedin || null,
        github: profile.github || null,
        website: profile.portfolio || null // Map portfolio to website
      },
      update: {
        phone: profile.phone || null,
        address: profile.location || null,
        linkedin: profile.linkedin || null,
        github: profile.github || null,
        website: profile.portfolio || null
      }
    });

    // Handle skills update (Added - Example, replace/delete logic might be complex)
    if (profile.skills) {
      // 1. Find existing DeveloperSkills for the user
      const existingDevSkills = await prisma.developerSkill.findMany({
        where: { developerId: session.user.id },
        select: { id: true, skillId: true },
      });
      const existingSkillIds = new Set(existingDevSkills.map(ds => ds.skillId));

      // 2. Prepare incoming skills (ensure they exist in Skill table or create them)
      // This part needs careful handling: Find or create Skill records based on name/category
      // For simplicity, this example assumes skills in profile.skills are valid and reference existing Skill records by name/id
      // A real implementation would need robust findOrCreate logic for Skill entities.

      const incomingSkillsData = await Promise.all(profile.skills.map(async (skill: Skill) => {
        // Find the actual Skill record based on name/category provided in profile.skills
        const dbSkill = await prisma.skill.findFirst({ 
          where: { name: skill.name /* AND category name if available */ } 
        });
        if (!dbSkill) {
          console.warn(`Skill '${skill.name}' not found, skipping.`);
          return null; // Skip if skill doesn't exist
        }
        return { skillId: dbSkill.id, level: skill.level }; 
      }));

      const validIncomingSkills = incomingSkillsData.filter(s => s !== null) as { skillId: string; level: SkillLevel }[];
      const incomingSkillIds = new Set(validIncomingSkills.map(s => s.skillId));

      // 3. Determine skills to add, update, or remove
      const skillsToAdd = validIncomingSkills.filter(s => !existingSkillIds.has(s.skillId));
      const skillsToUpdate = validIncomingSkills.filter(s => existingSkillIds.has(s.skillId));
      const skillsToRemove = existingDevSkills.filter(ds => !incomingSkillIds.has(ds.skillId));

      // 4. Perform database operations
      if (skillsToRemove.length > 0) {
        await prisma.developerSkill.deleteMany({
          where: { id: { in: skillsToRemove.map(ds => ds.id) } },
        });
      }
      if (skillsToAdd.length > 0) {
        await prisma.developerSkill.createMany({
          data: skillsToAdd.map(s => ({
            developerId: session.user.id,
            skillId: s.skillId,
            level: s.level,
          })),
        });
      }
      for (const skillToUpdate of skillsToUpdate) {
        await prisma.developerSkill.updateMany({
          where: {
            developerId: session.user.id,
            skillId: skillToUpdate.skillId,
          },
          data: {
            level: skillToUpdate.level,
          },
        });
      }
    }

    // Handle experience
    if (profile.experience) {
      // Delete existing experience first
      await prisma.experience.deleteMany({
        where: { developerId: session.user.id }
      });

      // Only create new entries if the array is not empty
      if (Array.isArray(profile.experience) && profile.experience.length > 0) {
        await prisma.experience.createMany({
          data: profile.experience.map((exp: Experience) => ({
            developerId: session.user.id,
            title: exp.title,
            company: exp.company,
            description: exp.description,
            location: exp.location || null,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : null,
            current: exp.current,
            responsibilities: exp.responsibilities || [],
            achievements: exp.achievements || [],
            teamSize: exp.teamSize || null,
            techStack: exp.techStack || []
          }))
        });
      }
    }

    // Handle education
    if (profile.education) {
      // Delete existing education
      await prisma.education.deleteMany({
        where: { developerId: session.user.id }
      });
      
      // Only create if array is not empty
      if (Array.isArray(profile.education) && profile.education.length > 0) {
        await prisma.education.createMany({
          data: profile.education.map((edu: Education) => ({
            developerId: session.user.id,
            degree: edu.degree || null,
            institution: edu.institution,
            year: edu.year,
            location: edu.location || null,
            startDate: new Date(edu.startDate),
            endDate: edu.endDate ? new Date(edu.endDate) : null,
            gpa: edu.gpa || null,
            honors: edu.honors || [],
            activities: edu.activities || []
          }))
        });
      }
    }

    // Handle achievements
    if (profile.achievements) {
      // Delete existing achievements
      await prisma.achievement.deleteMany({
        where: { developerId: session.user.id }
      });

      // Only create if array is not empty
      if (Array.isArray(profile.achievements) && profile.achievements.length > 0) {
        await prisma.achievement.createMany({
          data: profile.achievements.map((achievement: Achievement) => ({
            developerId: session.user.id,
            title: achievement.title,
            description: achievement.description,
            date: new Date(achievement.date),
            url: achievement.url || null,
            issuer: achievement.issuer || null
          }))
        });
      }
    }

    // Fetch the complete updated developer with all relations
    const finalDeveloper = await prisma.developer.findUnique({
      where: { id: session.user.id },
      include: {
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
        applications: true,
        savedRoles: true,
        contactInfo: true,
        customRoles: true
      }
    });

    if (!finalDeveloper) {
      throw new Error('Failed to fetch updated developer');
    }

    // Map the developer data to match DeveloperProfile interface (aligned with GET handler)
    const mappedSkills: Skill[] = finalDeveloper.developerSkills.map(skill => ({
      id: skill.id,
      name: skill.skill.name,
      category: skill.skill.category?.name || 'Other',
      level: skill.level
    }));

    const mappedAchievements: Achievement[] = finalDeveloper.achievements.map(achievement => ({
      id: achievement.id,
      title: achievement.title || '',
      description: achievement.description,
      date: achievement.date.toISOString(),
      url: achievement.url || null,
      issuer: achievement.issuer || null
    }));

    const mappedExperience: Experience[] = finalDeveloper.experience.map(exp => ({
      id: exp.id,
      title: exp.title || '',
      company: exp.company,
      description: exp.description,
      location: exp.location || null,
      startDate: exp.startDate.toISOString(),
      endDate: exp.endDate?.toISOString() || null,
      current: exp.current,
      responsibilities: exp.responsibilities || [],
      achievements: exp.achievements || [],
      teamSize: exp.teamSize || null,
      techStack: exp.techStack || []
    }));

    const mappedEducation: Education[] = finalDeveloper.education.map(edu => ({
      id: edu.id,
      degree: edu.degree || null,
      institution: edu.institution,
      year: edu.year,
      location: edu.location || null,
      startDate: edu.startDate.toISOString(),
      endDate: edu.endDate?.toISOString() || null,
      gpa: edu.gpa || null,
      honors: edu.honors || [],
      activities: edu.activities || []
    }));

    const mappedApplications: Application[] = finalDeveloper.applications.map(app => ({
      id: app.id,
      roleId: app.roleId,
      title: app.roleId,
      description: app.coverLetter || '',
      date: app.appliedAt.toISOString(),
      status: app.status
    }));

    const mappedSavedRoles: SavedRole[] = finalDeveloper.savedRoles.map(role => ({
      id: role.id,
      roleId: role.roleId,
      title: role.roleId,
      description: role.notes || '',
      date: role.createdAt.toISOString(),
      notes: role.notes || null
    }));
    
    const mappedCustomRoles: CustomRole[] = finalDeveloper.customRoles.map(role => ({
      id: role.id,
      title: role.title,
      description: role.description,
      requirements: role.requirements || [],
      skills: role.skills || [],
      location: role.location,
      salary: role.salary || null,
      type: role.type,
      remote: role.remote,
      visaSponsorship: role.visaSponsorship,
      companyName: role.companyName || null,
      url: role.url || null,
      originalRoleId: role.originalRoleId || null,
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString()
    }));

    const mappedDeveloper: DeveloperProfile = {
      name: finalDeveloper.name || '',
      email: finalDeveloper.profileEmail || finalDeveloper.email || '',
      title: finalDeveloper.title || '',
      about: finalDeveloper.about || '',
      phone: finalDeveloper.contactInfo?.phone || null,
      location: finalDeveloper.contactInfo?.address || null,
      linkedin: finalDeveloper.contactInfo?.linkedin || null,
      github: finalDeveloper.contactInfo?.github || null,
      portfolio: finalDeveloper.contactInfo?.website || null,
      skills: mappedSkills,
      achievements: mappedAchievements,
      experience: mappedExperience,
      education: mappedEducation,
      applications: mappedApplications,
      savedRoles: mappedSavedRoles,
      customRoles: mappedCustomRoles,
      totalExperience: undefined
    };

    return NextResponse.json(mappedDeveloper);
  } catch (error) {
    console.error('Error updating developer profile:', error);
    return NextResponse.json(
      { error: 'Failed to update developer profile' },
      { status: 500 }
    );
  }
} 