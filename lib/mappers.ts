// Placeholder for profile feature mappers 

import {
    Developer, ContactInfo, DeveloperSkill, Skill as PrismaSkill, SkillCategory,
    Experience as PrismaExperience, Education as PrismaEducation, Achievement as PrismaAchievement,
    Application as PrismaApplication, Role as PrismaRole, SavedRole as PrismaSavedRole, CustomRole as PrismaCustomRole
} from '@prisma/client';
import {
    InternalProfile, InternalContactInfo, InternalSkill,
    InternalExperience, InternalEducation, InternalAchievement,
    InternalApplication, InternalSavedRole, InternalCustomRole
} from '../types/types';
import { UpdateProfilePayload } from '../prisma/schemas';

// Define the expected structure returned by Prisma queries
// Adjust this based on the actual include statements used in the service
type PrismaDeveloperWithRelations = Developer & {
    contactInfo: ContactInfo | null;
    developerSkills: (DeveloperSkill & { skill: PrismaSkill & { category: SkillCategory } })[];
    experience: PrismaExperience[];
    education: PrismaEducation[];
    achievements: PrismaAchievement[];
    applications: (PrismaApplication & { role: PrismaRole & { company: { name: string | null } } })[];
    savedRoles: (PrismaSavedRole & { role: PrismaRole & { company: { name: string | null } } })[];
    customRoles: PrismaCustomRole[];
};

/**
 * Maps the Prisma Developer model (with relations) to the internal application profile type.
 */
export function mapPrismaProfileToInternalProfile(developer: PrismaDeveloperWithRelations): InternalProfile {
    const contactInfo: InternalContactInfo | null = developer.contactInfo ? {
        id: developer.contactInfo.id,
        phone: developer.contactInfo.phone,
        address: developer.contactInfo.address, // Keep as address for now
        city: developer.contactInfo.city,
        country: developer.contactInfo.country,
        linkedin: developer.contactInfo.linkedin,
        github: developer.contactInfo.github,
        website: developer.contactInfo.website,
    } : null;

    const skills: InternalSkill[] = developer.developerSkills.map(ds => ({
        id: ds.id, // Use DeveloperSkill ID
        name: ds.skill.name,
        category: ds.skill.category.name,
        level: ds.level,
    }));

    const experience: InternalExperience[] = developer.experience.map(exp => ({
        id: exp.id,
        title: exp.title,
        company: exp.company,
        location: exp.location,
        startDate: exp.startDate.toISOString(),
        endDate: exp.endDate?.toISOString() ?? null,
        current: exp.current,
        responsibilities: exp.responsibilities,
        achievements: exp.achievements,
        teamSize: exp.teamSize,
        techStack: exp.techStack,
    }));

    const education: InternalEducation[] = developer.education.map(edu => ({
        id: edu.id,
        degree: edu.degree,
        institution: edu.institution,
        year: edu.year,
        location: edu.location,
        startDate: edu.startDate.toISOString(),
        endDate: edu.endDate?.toISOString() ?? null,
        gpa: edu.gpa,
        honors: edu.honors,
        activities: edu.activities,
    }));

    const achievements: InternalAchievement[] = developer.achievements.map(ach => ({
        id: ach.id,
        title: ach.title,
        description: ach.description,
        date: ach.date.toISOString(),
        url: ach.url,
        issuer: ach.issuer,
    }));

    const applications: InternalApplication[] = developer.applications.map(app => ({
        id: app.id,
        roleId: app.roleId,
        roleTitle: app.role.title, // Assuming role relation is included
        companyName: app.role.company.name ?? 'Unknown Company', // Assuming company relation is included
        appliedAt: app.appliedAt.toISOString(),
        status: app.status,
    }));

    const savedRoles: InternalSavedRole[] = developer.savedRoles.map(sr => ({
        id: sr.id,
        roleId: sr.roleId,
        roleTitle: sr.role.title, // Assuming role relation is included
        companyName: sr.role.company.name ?? 'Unknown Company', // Assuming company relation is included
        savedAt: sr.createdAt.toISOString(),
        notes: sr.notes,
    }));

    const customRoles: InternalCustomRole[] = developer.customRoles.map(cr => ({
        id: cr.id,
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
        createdAt: cr.createdAt.toISOString(),
        updatedAt: cr.updatedAt.toISOString(),
    }));

    return {
        id: developer.id,
        name: developer.name,
        email: developer.email, // Primary email from Developer model
        profileEmail: developer.profileEmail,
        title: developer.title,
        about: developer.about,
        contactInfo: contactInfo,
        skills: skills,
        experience: experience,
        education: education,
        achievements: achievements,
        applications: applications,
        savedRoles: savedRoles,
        customRoles: customRoles,
    };
}

/**
 * Maps the validated profile update payload to Prisma update arguments.
 * Note: This mapping focuses on the Developer and ContactInfo fields.
 * Handling of related arrays (skills, experience, etc.) is complex and typically
 * done within the service layer due to needing existing state and potential create/update/delete logic.
 * This function provides the basic structure for updating direct fields.
 */
export function mapUpdatePayloadToPrismaArgs(payload: UpdateProfilePayload): {
    developerData: Partial<Omit<Developer, 'id' | 'email' | 'createdAt' | 'updatedAt'>>;
    contactInfoData: Partial<Omit<ContactInfo, 'id' | 'developerId' | 'createdAt' | 'updatedAt'>>;
} {
    const developerData: Partial<Omit<Developer, 'id' | 'email' | 'createdAt' | 'updatedAt'>> = {};
    if (payload.name !== undefined) developerData.name = payload.name;
    if (payload.profileEmail !== undefined) developerData.profileEmail = payload.profileEmail;
    if (payload.title !== undefined) developerData.title = payload.title;
    if (payload.about !== undefined) developerData.about = payload.about;

    const contactInfoData: Partial<Omit<ContactInfo, 'id' | 'developerId' | 'createdAt' | 'updatedAt'>> = {};
    if (payload.contactInfo !== undefined && payload.contactInfo !== null) {
        if (payload.contactInfo.phone !== undefined) contactInfoData.phone = payload.contactInfo.phone;
        if (payload.contactInfo.address !== undefined) contactInfoData.address = payload.contactInfo.address;
        if (payload.contactInfo.city !== undefined) contactInfoData.city = payload.contactInfo.city;
        if (payload.contactInfo.country !== undefined) contactInfoData.country = payload.contactInfo.country;
        if (payload.contactInfo.linkedin !== undefined) contactInfoData.linkedin = payload.contactInfo.linkedin;
        if (payload.contactInfo.github !== undefined) contactInfoData.github = payload.contactInfo.github;
        if (payload.contactInfo.website !== undefined) contactInfoData.website = payload.contactInfo.website;
    }
    
    // Note: Mapping for skills, experience, etc., is omitted here as it's complex
    // and better handled in the service layer where create/update/delete logic resides.

    return { developerData, contactInfoData };
} 