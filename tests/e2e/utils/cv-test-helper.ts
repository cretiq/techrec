import { Page, expect } from '@playwright/test';

/**
 * CV Test Helper - Manages CV state for upload tests
 * Ensures clean state by removing existing CVs before tests
 */
export class CVTestHelper {
  constructor(private page: Page) {}

  /**
   * Ensures clean CV state for upload tests
   * Deletes any existing CV for the current authenticated user
   */
  async ensureCleanCVState(): Promise<void> {
    console.log('🧹 Cleaning CV state for test user...');
    
    try {
      // First check if user has any CV data
      const profileResponse = await this.page.request.get('/api/developer/me/profile');
      
      if (!profileResponse.ok()) {
        console.log('⚠️ Could not fetch profile - user may not be authenticated');
        return;
      }

      const profileData = await profileResponse.json();
      
      // Debug: Log what profile data exists
      console.log('📋 Current profile data keys:', Object.keys(profileData));
      console.log('📋 Has experience data:', !!profileData.experience && profileData.experience.length > 0);
      console.log('📋 Has education data:', !!profileData.education && profileData.education.length > 0);
      console.log('📋 Has skills data:', !!profileData.skills && profileData.skills.length > 0);
      console.log('📋 Has achievements data:', !!profileData.achievements && profileData.achievements.length > 0);
      console.log('📋 Has applications data:', !!profileData.applications && profileData.applications.length > 0);
      console.log('📋 Has savedRoles data:', !!profileData.savedRoles && profileData.savedRoles.length > 0);
      console.log('📋 Has contactInfo data:', !!profileData.contactInfo);
      console.log('📋 Profile completeness:', profileData.profileCompleteness);
      
      // If user has a CV, get the CV ID and delete it using admin endpoint (like you did manually)
      if (profileData.cvId) {
        console.log(`🗑️ Found existing CV with ID: ${profileData.cvId}`);
        console.log('🔧 Using admin endpoint for complete CV deletion (like manual process)...');
        
        const deleteResponse = await this.page.request.delete(`/api/admin/gamification/cv/${profileData.cvId}?deleteProfileData=false`);
        
        if (deleteResponse.ok() || deleteResponse.status() === 204) {
          console.log('✅ Existing CV deleted successfully via admin endpoint');
        } else {
          console.log(`⚠️ Admin CV deletion failed: ${deleteResponse.status()}`);
          // Fall back to regular endpoint
          console.log('🔄 Falling back to regular CV deletion endpoint...');
          const fallbackResponse = await this.page.request.delete(`/api/cv/${profileData.cvId}`);
          if (fallbackResponse.ok() || fallbackResponse.status() === 204) {
            console.log('✅ CV deleted via fallback endpoint');
          } else {
            console.log(`⚠️ Fallback CV deletion also failed: ${fallbackResponse.status()}`);
          }
        }
      } else {
        console.log('✅ No CV ID found in profile');
      }
      
      // Clean up all profile data that might cause profile section to show
      await this.cleanupAllProfileData(profileData);

      // Force clean contactInfo via direct deletion if it exists
      if (profileData.contactInfo) {
        console.log('🗑️ Force deleting contactInfo via direct API...');
        try {
          await this.page.request.delete(`/api/developer/me/contactinfo`);
        } catch (error) {
          console.log('⚠️ ContactInfo deletion failed:', error);
        }
      }

      // Also clean up profile CV reference
      await this.cleanupViaProfileReset();

    } catch (error) {
      console.log('⚠️ Error during CV cleanup:', error);
      // Continue with test - may still work if state is actually clean
    }
  }

  /**
   * Comprehensive cleanup of all profile data that might cause profile section to show
   */
  private async cleanupAllProfileData(profileData: any): Promise<void> {
    console.log('🧹 Performing comprehensive profile data cleanup...');
    
    try {
      // Clear all experiences
      if (profileData.experience && profileData.experience.length > 0) {
        console.log(`🗑️ Clearing ${profileData.experience.length} experience records...`);
        for (const exp of profileData.experience) {
          if (exp.id) {
            await this.page.request.delete(`/api/developer/me/experience/${exp.id}`);
          }
        }
      }

      // Clear all education
      if (profileData.education && profileData.education.length > 0) {
        console.log(`🗑️ Clearing ${profileData.education.length} education records...`);
        for (const edu of profileData.education) {
          if (edu.id) {
            await this.page.request.delete(`/api/developer/me/education/${edu.id}`);
          }
        }
      }

      // Clear all skills
      if (profileData.skills && profileData.skills.length > 0) {
        console.log(`🗑️ Clearing ${profileData.skills.length} skill records...`);
        for (const skill of profileData.skills) {
          if (skill.id) {
            await this.page.request.delete(`/api/developer/me/skills/${skill.id}`);
          }
        }
      }

      console.log('✅ Comprehensive profile cleanup completed');
    } catch (error) {
      console.log('⚠️ Comprehensive cleanup failed:', error);
    }
  }

  /**
   * Alternative cleanup method - resets profile data
   */
  private async cleanupViaProfileReset(): Promise<void> {
    console.log('🔄 Attempting profile reset cleanup...');
    
    try {
      // Reset key profile fields that might block uploads
      const resetData = {
        cvId: null,
        lastAnalysisId: null,
        profileCompleteness: 0,
        // Also reset basic info to ensure clean state
        name: null,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        summary: '',
        title: '',
        about: '',
        contactInfo: null,
        // Clear profile data that might trigger profile section display
        profileEmail: null
      };

      const response = await this.page.request.patch('/api/developer/me/profile', {
        data: resetData
      });

      if (response.ok()) {
        console.log('✅ Profile reset completed');
      } else {
        console.log(`⚠️ Profile reset response: ${response.status()}`);
      }
    } catch (error) {
      console.log('⚠️ Profile reset failed:', error);
    }
  }

  /**
   * Clean up any uploaded files from previous tests
   */
  private async cleanupUploadedFiles(): Promise<void> {
    try {
      // This would call an admin endpoint to clean up orphaned files
      // For now, we'll skip this as it requires admin permissions
      console.log('📁 File cleanup skipped (requires admin permissions)');
    } catch (error) {
      // Silent fail - file cleanup is nice-to-have
    }
  }

  /**
   * Verifies user has no existing CV before upload test
   * This ensures the upload form is visible and ready
   */
  async verifyNoExistingCV(): Promise<void> {
    console.log('🔍 Verifying clean CV state...');
    
    await this.page.goto('/developer/cv-management');
    await this.page.waitForLoadState('networkidle');

    // Wait a moment for any async loading to complete
    await this.page.waitForTimeout(1000);

    // Should see upload section (entry form)
    const uploadSection = this.page.locator('[data-testid="cv-management-entry-section"]');
    const profileSection = this.page.locator('[data-testid="cv-management-profile-section"]');

    // Check what's actually visible
    const uploadVisible = await uploadSection.isVisible();
    const profileVisible = await profileSection.isVisible();

    console.log(`📋 Upload section visible: ${uploadVisible}`);
    console.log(`👤 Profile section visible: ${profileVisible}`);

    if (profileVisible) {
      throw new Error('❌ User still has existing CV data - cleanup failed. Please check CV deletion API or run manual cleanup.');
    }

    if (!uploadVisible) {
      throw new Error('❌ Neither upload nor profile section visible - page may not have loaded correctly.');
    }

    console.log('✅ Verified clean CV state - upload form is ready');
  }

  /**
   * Helper to verify upload components are available
   */
  async verifyUploadComponentsReady(): Promise<void> {
    console.log('🔍 Verifying upload components are ready...');

    // Check for key upload elements
    const dropzone = this.page.locator('[data-testid="cv-management-upload-dropzone"]');
    const fileInput = this.page.locator('[data-testid="cv-management-upload-file-input"]');

    await expect(dropzone).toBeVisible({ timeout: 5000 });
    await expect(fileInput).toBeAttached();

    console.log('✅ Upload components are ready');
  }

  /**
   * Complete preparation for CV upload tests
   * Combines all necessary setup steps
   */
  async prepareForUploadTest(): Promise<void> {
    console.log('🚀 Preparing environment for CV upload test...');
    
    // Step 1: Clean any existing CV data
    await this.ensureCleanCVState();
    
    // Step 2: Navigate and verify clean state
    await this.verifyNoExistingCV();
    
    // Step 3: Verify upload components are ready
    await this.verifyUploadComponentsReady();
    
    console.log('✅ CV upload test environment ready');
  }

  /**
   * Utility to check if user currently has a CV
   */
  async userHasExistingCV(): Promise<boolean> {
    await this.page.goto('/developer/cv-management');
    await this.page.waitForLoadState('networkidle');
    
    const profileSection = this.page.locator('[data-testid="cv-management-profile-section"]');
    return await profileSection.isVisible();
  }
}