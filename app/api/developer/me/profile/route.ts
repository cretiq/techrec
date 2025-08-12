// Placeholder for profile feature API route (/api/developer/me/profile) 
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProfileByUserId } from '@/utils/profile';
import { prisma } from '@/prisma/prisma';
import { ProfileUpdateSchema } from '@/types/types';
import { SkillLevel } from '@prisma/client';
import { deleteFileFromS3 } from '@/utils/s3Storage';

/**
 * GET handler to fetch the current authenticated user's profile.
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            console.log("[API /profile/me] Unauthorized access attempt.");
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = session.user.id;
        console.log(`[API /profile/me] GET request for user ID: ${userId}`);

        const profile = await getProfileByUserId(userId);

        if (!profile) {
             console.log(`[API /profile/me] Profile not found for user ID: ${userId}`);
            // Consider if creating a default profile here is desired, or just return 404
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        // Get additional gamification and count data
        const developer = await prisma.developer.findUnique({
            where: { id: userId },
            select: {
                totalXP: true,
                currentLevel: true,
                subscriptionTier: true,
                subscriptionStatus: true,
                monthlyPoints: true,
                pointsUsed: true,
                pointsEarned: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        cvs: true,
                        developerSkills: true,
                        experience: true
                    }
                }
            }
        });

        // Combine the profile with gamification data
        const enhancedProfile = {
            ...profile,
            totalXP: developer?.totalXP || 0,
            currentLevel: developer?.currentLevel || 1,
            subscriptionTier: developer?.subscriptionTier || 'FREE',
            subscriptionStatus: developer?.subscriptionStatus || 'ACTIVE',
            monthlyPoints: developer?.monthlyPoints || 0,
            pointsUsed: developer?.pointsUsed || 0,
            pointsEarned: developer?.pointsEarned || 0,
            createdAt: developer?.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: developer?.updatedAt?.toISOString() || new Date().toISOString(),
            cvCount: developer?._count?.cvs || 0,
            skillsCount: developer?._count?.developerSkills || 0,
            experienceCount: developer?._count?.experience || 0
        };

        console.log(`[API /profile/me] Profile fetched successfully for user ID: ${userId}`);
        return NextResponse.json(enhancedProfile);

    } catch (error) {
        console.error('[API /profile/me] GET Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

/**
 * PUT handler to update the current authenticated user's profile.
 */
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        
        // Validate the request body against our schema
        const result = ProfileUpdateSchema.safeParse(body);
        
        if (!result.success) {
            console.warn('Invalid update payload:', result.error.issues);
            return NextResponse.json(
                { 
                    error: 'Invalid request body',
                    details: result.error.issues.map(issue => ({
                        path: issue.path.join('.'),
                        message: issue.message
                    }))
                },
                { status: 400 }
            );
        }

        const validatedData = result.data;

        // Update the profile with validated data
        const updatedProfile = await prisma.developer.update({
            where: { id: session.user.id },
            data: {
                name: validatedData.name,
                title: validatedData.title,
                profileEmail: validatedData.profileEmail,
                about: validatedData.about,
                contactInfo: validatedData.contactInfo ? {
                    upsert: {
                        create: {
                            phone: validatedData.contactInfo.phone,
                            address: validatedData.contactInfo.address,
                            city: validatedData.contactInfo.city,
                            country: validatedData.contactInfo.country,
                            linkedin: validatedData.contactInfo.linkedin,
                            github: validatedData.contactInfo.github,
                            website: validatedData.contactInfo.website,
                        },
                        update: {
                            phone: validatedData.contactInfo.phone,
                            address: validatedData.contactInfo.address,
                            city: validatedData.contactInfo.city,
                            country: validatedData.contactInfo.country,
                            linkedin: validatedData.contactInfo.linkedin,
                            github: validatedData.contactInfo.github,
                            website: validatedData.contactInfo.website
                        }
                    }
                } : undefined,
                developerSkills: {
                    deleteMany: {},
                    create: await Promise.all(validatedData.skills.map(async skill => {
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
                            level: skill.level as SkillLevel
                        };
                    }))
                },
                experience: {
                    deleteMany: {},
                    create: validatedData.experience.map(exp => ({
                        ...exp,
                        startDate: new Date(exp.startDate),
                        endDate: exp.endDate ? new Date(exp.endDate) : null
                    }))
                },
                education: {
                    deleteMany: {},
                    create: validatedData.education.map(edu => ({
                        ...edu,
                        startDate: new Date(edu.startDate),
                        endDate: edu.endDate ? new Date(edu.endDate) : null
                    }))
                },
                achievements: {
                    deleteMany: {},
                    create: validatedData.achievements.map(ach => ({
                        ...ach,
                        date: new Date(ach.date)
                    }))
                }
            },
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
                achievements: true
            }
        });

        return NextResponse.json(updatedProfile);
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}

/**
 * DELETE handler to clear all profile data for the current authenticated user.
 * This deletes CV files, skills, experience, education, achievements, and contact info.
 * Similar to what the admin clear profile functionality does.
 */
export async function DELETE() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const developerId = session.user.id;
        console.log(`[API /profile/me] DELETE request for user ID: ${developerId}`);

        // Use a transaction to ensure all deletions happen atomically
        const result = await prisma.$transaction(async (tx) => {
            // First, get all CVs to delete from S3 later
            const cvs = await tx.cV.findMany({
                where: { developerId },
                select: { id: true, s3Key: true, filename: true }
            });

            // Delete all CV-related data atomically
            const deletionCounts = {
                cvs: await tx.cV.deleteMany({ where: { developerId } }),
                skills: await tx.developerSkill.deleteMany({ where: { developerId } }),
                experience: await tx.experience.deleteMany({ where: { developerId } }),
                education: await tx.education.deleteMany({ where: { developerId } }),
                achievements: await tx.achievement.deleteMany({ where: { developerId } }),
                contactInfo: await tx.contactInfo.deleteMany({ where: { developerId } }),
                
                // Add missing CV-derived data deletion
                personalProjects: await tx.personalProject.deleteMany({ where: { developerId } }),
                personalProjectPortfolios: await tx.personalProjectPortfolio.deleteMany({ where: { developerId } }),
                
                // ExperienceProject will be auto-deleted by CASCADE relationship
                // No need for manual deletion as the broken line 250-252 attempted
            };

            // Reset basic profile fields (keep required name field)
            await tx.developer.update({
                where: { id: developerId },
                data: {
                    title: null,
                    profileEmail: null,
                    about: null,
                    // Keep gamification data intact (XP, points, badges, streak)
                }
            });

            return { cvs, deletionCounts };
        });

        // DELETE S3 FILES after successful database transaction
        const s3DeletionResults = [];
        for (const cv of result.cvs) {
            if (cv.s3Key) {
                try {
                    await deleteFileFromS3(cv.s3Key);
                    s3DeletionResults.push({ key: cv.s3Key, status: 'deleted' });
                    console.log(`✅ [API /profile/me] S3 file deleted: ${cv.s3Key}`);
                } catch (s3Error) {
                    s3DeletionResults.push({ key: cv.s3Key, status: 'failed', error: s3Error.message });
                    console.error(`❌ [API /profile/me] Failed to delete S3 file ${cv.s3Key}:`, s3Error);
                }
            }
        }

        console.log(`[API /profile/me] Profile data cleared successfully for user ID: ${developerId}`, {
            database: result.deletionCounts,
            s3Files: s3DeletionResults
        });
        
        return NextResponse.json({ 
            success: true,
            message: 'All profile data and files cleared successfully',
            deletedCounts: {
                cvs: result.deletionCounts.cvs.count,
                skills: result.deletionCounts.skills.count,
                experience: result.deletionCounts.experience.count,
                education: result.deletionCounts.education.count,
                achievements: result.deletionCounts.achievements.count,
                contactInfo: result.deletionCounts.contactInfo.count,
                personalProjects: result.deletionCounts.personalProjects.count,
                personalProjectPortfolios: result.deletionCounts.personalProjectPortfolios.count,
            },
            s3FilesDeleted: s3DeletionResults.filter(r => r.status === 'deleted').length,
            s3FilesFailed: s3DeletionResults.filter(r => r.status === 'failed').length
        });

    } catch (error) {
        console.error('[API /profile/me] DELETE Error:', error);
        return NextResponse.json({ error: 'Failed to clear profile data' }, { status: 500 });
    }
} 