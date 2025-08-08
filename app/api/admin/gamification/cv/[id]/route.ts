import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCV, deleteCV } from '@/utils/cvOperations';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simple admin check - consistent with other admin endpoints
const ADMIN_EMAILS = [
  'filipmellqvist255@gmail.com',
  'admin@techrec.com',
  'admin@test.com',
  // Add more admin emails as needed
];

// DELETE /api/admin/gamification/cv/[id] - Admin CV deletion
// Query params:
// - deleteProfileData=true - Also delete extracted profile data (contactInfo, skills, experience, education)
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const { id } = params;
  
  // Check for deleteProfileData query parameter
  const url = new URL(request.url);
  const deleteProfileData = url.searchParams.get('deleteProfileData') === 'true';
  
  try {
    console.log(`[Admin CV Delete] Received DELETE request for CV ID: ${id}, deleteProfileData: ${deleteProfileData}`);
    
    // Session validation
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('[Admin CV Delete] Authentication failed - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin access check
    if (!ADMIN_EMAILS.includes(session.user.email)) {
      console.log(`[Admin CV Delete] Forbidden - ${session.user.email} is not an admin`);
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Verify CV exists and get metadata for audit logging
    const existingCv = await getCV(id);
    if (!existingCv) {
      console.log(`[Admin CV Delete] CV not found: ${id}`);
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    // Get developer info for audit trail
    const developer = await prisma.developer.findUnique({
      where: { id: existingCv.developerId },
      select: { id: true, name: true, email: true }
    });

    // Audit log metadata
    const auditData = {
      adminEmail: session.user.email,
      adminAction: 'CV_DELETION',
      timestamp: new Date().toISOString(),
      targetDeveloper: developer ? {
        id: developer.id,
        name: developer.name,
        email: developer.email
      } : null,
      cvMetadata: {
        id: existingCv.id,
        filename: existingCv.filename,
        originalName: existingCv.originalName,
        size: existingCv.size,
        uploadDate: existingCv.uploadDate,
        status: existingCv.status
      }
    };

    console.log('[Admin CV Delete] Audit trail:', JSON.stringify(auditData, null, 2));

    // Track what was deleted
    const deletedData: any = {
      cv: true,
      s3File: true
    };

    // If requested, delete profile data BEFORE deleting the CV
    if (deleteProfileData && existingCv.developerId) {
      console.log(`[Admin CV Delete] Deleting profile data for developer: ${existingCv.developerId}`);
      
      try {
        // Use transaction to ensure all profile data is deleted atomically
        const profileDeletion = await prisma.$transaction(async (tx) => {
          // Delete contact info
          const contactInfo = await tx.contactInfo.deleteMany({
            where: { developerId: existingCv.developerId }
          });
          
          // Delete developer skills
          const developerSkills = await tx.developerSkill.deleteMany({
            where: { developerId: existingCv.developerId }
          });
          
          // Delete experience
          const experience = await tx.experience.deleteMany({
            where: { developerId: existingCv.developerId }
          });
          
          // Delete education
          const education = await tx.education.deleteMany({
            where: { developerId: existingCv.developerId }
          });
          
          // Delete achievements
          const achievements = await tx.achievement.deleteMany({
            where: { developerId: existingCv.developerId }
          });
          
          // Delete personal projects
          const personalProjects = await tx.personalProject.deleteMany({
            where: { developerId: existingCv.developerId }
          });
          
          // Delete personal project portfolios (and their enhancements via cascade)
          const personalProjectPortfolios = await tx.personalProjectPortfolio.deleteMany({
            where: { developerId: existingCv.developerId }
          });
          // Note: PersonalProjectEnhancement records are automatically deleted via cascade
          
          return {
            contactInfo: contactInfo.count,
            developerSkills: developerSkills.count,
            experience: experience.count,
            education: education.count,
            achievements: achievements.count,
            personalProjects: personalProjects.count,
            personalProjectPortfolios: personalProjectPortfolios.count
          };
        });
        
        deletedData.profileData = profileDeletion;
        console.log('[Admin CV Delete] Profile data deletion counts:', profileDeletion);
        
      } catch (profileError) {
        console.error('[Admin CV Delete] Error deleting profile data:', profileError);
        // Continue with CV deletion even if profile deletion fails
        deletedData.profileDataError = profileError instanceof Error ? profileError.message : 'Unknown error';
      }
    }

    // Perform CV deletion using existing infrastructure
    await deleteCV(id);
    
    console.log(`[Admin CV Delete] Successfully deleted CV: ${id} by admin: ${session.user.email}`);
    
    return NextResponse.json({
      success: true,
      message: deleteProfileData 
        ? 'CV and associated profile data deleted successfully' 
        : 'CV deleted successfully',
      deletedData,
      auditTrail: auditData
    });

  } catch (error) {
    console.error(`[Admin CV Delete] Error deleting CV ID ${id}:`, error);
    
    // Specific error handling
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: 'CV not found' }, { status: 404 });
      }
      if (error.message.includes('S3')) {
        return NextResponse.json({ 
          error: 'Failed to delete CV file from storage', 
          details: error.message 
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to delete CV', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}