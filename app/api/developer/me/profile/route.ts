// Placeholder for profile feature API route (/api/developer/me/profile) 
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProfileByUserId, updateProfile } from '@/utils/profile';
import { prisma } from '@/prisma/prisma';
import { ProfileUpdateSchema } from '@/types/types';
import { SkillLevel } from '@prisma/client';

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

        console.log(`[API /profile/me] Profile fetched successfully for user ID: ${userId}`);
        return NextResponse.json(profile);

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