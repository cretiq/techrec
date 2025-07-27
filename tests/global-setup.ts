import { ensureTestUsersExist } from './e2e/utils/test-user-setup';

async function globalSetup() {
  console.log('🚀 Running E2E test global setup...');
  
  try {
    // Ensure test users exist in the database
    await ensureTestUsersExist();
    console.log('✅ Global setup completed successfully');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}

export default globalSetup; 