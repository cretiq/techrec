// Placeholder for profile feature service layer 

import { prisma } from '@/prisma/prisma';
import { Prisma, SkillLevel, SortOrder } from '@prisma/client';
import {
    mapPrismaProfileToInternalProfile,
    mapUpdatePayloadToPrismaArgs
} from '@/lib/mappers';
import { InternalProfile } from '@/types/types';
import { UpdateProfilePayload } from '@/prisma/schemas';

// Define the Prisma include object needed for fetching the full profile
const profileInclude = {
    contactInfo: true,
    developerSkills: {
        include: {
            skill: { include: { category: true } }
        }
    },
    experience: true,
    education: true,
    achievements: true,
    applications: {
        include: { role: { include: { company: { select: { name: true } } } } }
    },
    savedRoles: {
        include: { role: { include: { company: { select: { name: true } } } } }
    },
    customRoles: true,
    // Include CVs with MVP content for cover letter generation
    cvs: {
        select: {
            id: true,
            filename: true,
            originalName: true,
            uploadDate: true,
            status: true,
            improvementScore: true,
            mvpContent: true,
            mvpRawData: true
        },
        orderBy: {
            uploadDate: SortOrder.desc
        },
        take: 1 // Get only the most recent CV
    }
};

/**
 * Fetches the full developer profile for a given user ID.
 * 
 * @param userId The ID of the developer.
 * @returns The internal representation of the developer profile, or null if not found.
 * @throws Error if there's a database issue.
 */
export async function getProfileByUserId(userId: string): Promise<InternalProfile | null> {
    try {
        console.log(`[ProfileService] Fetching profile for user ID: ${userId}`);
        const developer = await prisma.developer.findUnique({
            where: { id: userId },
            include: profileInclude
        });

        if (!developer) {
            console.log(`[ProfileService] Profile not found for user ID: ${userId}`);
            return null;
        }

        console.log(`[ProfileService] Profile found, mapping to internal type.`);
        // We need to assert the type here because Prisma's inferred type based on includes isn't perfectly matching our manual one
        // This is safe as long as `profileInclude` matches the expectations of the mapper.
        return mapPrismaProfileToInternalProfile(developer as any);
    } catch (error) {
        console.error(`[ProfileService] Error fetching profile for user ID ${userId}:`, error);
        // Re-throw a more specific error or handle appropriately
        throw new Error('Failed to fetch developer profile.');
    }
}

/**
 * Updates the developer profile for a given user ID based on the provided payload.
 * Handles updates to Developer fields, ContactInfo, and related arrays (Skills, Experience, etc.).
 * 
 * @param userId The ID of the developer to update.
 * @param payload The validated update payload.
 * @returns The updated internal representation of the developer profile.
 * @throws Error if the profile doesn't exist or if there's a database issue.
 */
export async function updateProfile(userId: string, payload: UpdateProfilePayload): Promise<InternalProfile> {
    console.log(`[ProfileService] Updating profile for user ID: ${userId}`);

    // Use a transaction to ensure atomicity
    const updatedDeveloper = await prisma.$transaction(async (tx) => {
        // 1. Map basic Developer and ContactInfo fields from payload
        const { developerData, contactInfoData } = mapUpdatePayloadToPrismaArgs(payload);

        // 2. Update Developer record
        await tx.developer.update({
            where: { id: userId },
            data: developerData,
        });
        console.log(`[ProfileService] Updated base developer fields.`);

        // 3. Upsert ContactInfo record
        if (payload.contactInfo !== undefined) { // Only update if contactInfo is explicitly in payload
            await tx.contactInfo.upsert({
                where: { developerId: userId },
                create: {
                    developerId: userId,
                    ...contactInfoData
                },
                update: contactInfoData,
            });
            console.log(`[ProfileService] Upserted contact info.`);
        }

        // 4. Handle related arrays (Skills, Experience, Education, Achievements)
        // This uses a delete-and-recreate strategy for simplicity, matching the old API.
        // More sophisticated diffing logic could be implemented for performance if needed.

        // Skills Update
        if (payload.skills !== undefined) {
            console.log(`[ProfileService] Updating skills...`);
            await tx.developerSkill.deleteMany({ where: { developerId: userId } });
            if (payload.skills.length > 0) {
                // We need to find the actual Skill IDs based on name/category provided
                // This requires fetching Skill records first.
                // For simplicity, assuming payload.skills contain valid STRUCTURE but maybe not valid foreign keys yet.
                // A robust implementation needs findOrCreate logic for Skills.
                // Simplified example: Create DeveloperSkill links assuming Skill exists (will fail if not).
                // WARNING: This simplified approach requires skills to exist in the Skill table!
                const skillData = await Promise.all(payload.skills.map(async (skill) => {
                    const dbSkill = await tx.skill.findFirst({ where: { name: skill.name /* Add category if needed */ } });
                    if (!dbSkill) {
                        console.warn(`[ProfileService] Skill '${skill.name}' not found in DB. Cannot link.`);
                        return null;
                    }
                    return {
                        developerId: userId,
                        skillId: dbSkill.id,
                        level: skill.level,
                    };
                }));
                
                // Explicitly type the filtered array to match Prisma expectations
                const validSkillData: Prisma.DeveloperSkillCreateManyInput[] = skillData
                    .filter((s): s is { developerId: string; skillId: string; level: SkillLevel } => s !== null);

                if (validSkillData.length > 0) {
                    await tx.developerSkill.createMany({
                        data: validSkillData, // Now correctly typed
                        // skipDuplicates: true, // Commented out due to potential type issue with MongoDB provider
                    });
                    console.log(`[ProfileService] Created ${validSkillData.length} skill links.`);
                }
            }
        }

        // Experience Update
        if (payload.experience !== undefined) {
            console.log(`[ProfileService] Updating experience...`);
            await tx.experience.deleteMany({ where: { developerId: userId } });
            if (payload.experience.length > 0) {
                await tx.experience.createMany({
                    data: payload.experience.map(exp => ({
                        developerId: userId,
                        title: exp.title,
                        company: exp.company,
                        description: exp.description || '',
                        location: exp.location,
                        startDate: new Date(exp.startDate),
                        endDate: exp.endDate ? new Date(exp.endDate) : null,
                        current: exp.current,
                        responsibilities: exp.responsibilities,
                        achievements: exp.achievements,
                        teamSize: exp.teamSize,
                        techStack: exp.techStack,
                    }))
                });
                console.log(`[ProfileService] Created ${payload.experience.length} experience records.`);
            }
        }

        // Education Update
        if (payload.education !== undefined) {
            console.log(`[ProfileService] Updating education...`);
            await tx.education.deleteMany({ where: { developerId: userId } });
            if (payload.education.length > 0) {
                await tx.education.createMany({
                    data: payload.education.map(edu => ({
                        developerId: userId,
                        degree: edu.degree,
                        institution: edu.institution,
                        year: edu.year,
                        location: edu.location,
                        startDate: new Date(edu.startDate),
                        endDate: edu.endDate ? new Date(edu.endDate) : null,
                        gpa: edu.gpa,
                        honors: edu.honors,
                        activities: edu.activities,
                    }))
                });
                 console.log(`[ProfileService] Created ${payload.education.length} education records.`);
            }
        }

        // Achievements Update
        if (payload.achievements !== undefined) {
            console.log(`[ProfileService] Updating achievements...`);
            await tx.achievement.deleteMany({ where: { developerId: userId } });
            if (payload.achievements.length > 0) {
                await tx.achievement.createMany({
                    data: payload.achievements.map(ach => ({
                        developerId: userId,
                        title: ach.title,
                        description: ach.description,
                        date: new Date(ach.date),
                        url: ach.url,
                        issuer: ach.issuer,
                    }))
                });
                 console.log(`[ProfileService] Created ${payload.achievements.length} achievement records.`);
            }
        }
        
        // Custom Roles Update (Handle similarly if included in profile update)
        if (payload.customRoles !== undefined) {
             console.log(`[ProfileService] Updating custom roles...`);
             await tx.customRole.deleteMany({ where: { developerId: userId }});
             if(payload.customRoles.length > 0) {
                 await tx.customRole.createMany({
                     data: payload.customRoles.map(cr => ({
                         developerId: userId,
                         title: cr.title,
                         description: cr.description,
                         requirements: cr.requirements,
                         skills: cr.skills,
                         location: cr.location,
                         salary: cr.salary,
                         type: cr.type,
                         remote: cr.remote,
                         visaSponsorship: cr.visaSponsorship,
                         companyName: cr.companyName,
                         url: cr.url,
                         originalRoleId: cr.originalRoleId,
                         // createdAt/updatedAt are handled by Prisma
                     }))
                 });
                 console.log(`[ProfileService] Created ${payload.customRoles.length} custom role records.`);
             }
        }

        // 5. Fetch the final, updated developer record within the transaction
        const finalDeveloper = await tx.developer.findUnique({
            where: { id: userId },
            include: profileInclude,
        });

        if (!finalDeveloper) {
            // Should not happen if the initial update succeeded, but good practice to check
            throw new Error('Developer profile disappeared during transaction.');
        }
        console.log(`[ProfileService] Fetched final profile within transaction.`);
        return finalDeveloper;
    });

    console.log(`[ProfileService] Profile update transaction completed for user ID: ${userId}`);
    // 6. Map the final result back to the internal type
    return mapPrismaProfileToInternalProfile(updatedDeveloper as any); // Assert type as before
} 