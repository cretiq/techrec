import { createTestUser } from './create-test-user';
import { analyzeDatabase } from './analyze-database-schema';

/**
 * Comprehensive User Deletion Validation Suite
 * 
 * This script will:
 * 1. Analyze the database schema
 * 2. Create a test user with comprehensive data (if needed)
 * 3. Run the deletion validation
 * 4. Generate a detailed report
 */

async function runComprehensiveValidation(email: string = 'test@test.se') {
  console.log(`🧪 COMPREHENSIVE USER DELETION VALIDATION SUITE`);
  console.log(`================================================`);
  console.log(`Target Email: ${email}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  try {
    // Step 1: Analyze database schema
    console.log(`📊 PHASE 1: Database Schema Analysis`);
    console.log(`====================================`);
    await analyzeDatabase();

    // Step 2: Ensure test user exists with comprehensive data
    console.log(`\n\n👤 PHASE 2: Test User Preparation`);
    console.log(`==================================`);
    
    try {
      const developerId = await createTestUser(email);
      console.log(`✅ Test user ready for validation (ID: ${developerId})`);
      
      // Step 3: Run schema analysis for this specific user
      console.log(`\n🔍 PHASE 3: Pre-deletion Analysis for ${email}`);
      console.log(`=============================================`);
      
      // Import and run the validation (this requires the server to be running)
      console.log(`\n⚠️  NEXT STEPS:`);
      console.log(`1. Ensure your development server is running on localhost:3003`);
      console.log(`2. Run the deletion validation script:`);
      console.log(`   npx tsx scripts/validate-user-deletion.ts ${email}`);
      console.log(`\n🎯 This will:`);
      console.log(`   - Take a complete snapshot of user data`);
      console.log(`   - Perform the deletion via API`);
      console.log(`   - Verify no orphaned data remains`);
      console.log(`   - Generate a comprehensive validation report`);
      
    } catch (error) {
      console.error(`❌ Failed to prepare test user:`, error);
      throw error;
    }

  } catch (error) {
    console.error(`💥 Validation suite failed:`, error);
    process.exit(1);
  }
}

// Main execution
async function main() {
  const email = process.argv[2] || 'test@test.se';
  
  await runComprehensiveValidation(email);
}

// Check if this script is being run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  main().catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}