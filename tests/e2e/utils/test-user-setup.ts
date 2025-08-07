import { prisma } from '@/prisma/prisma';
import bcrypt from 'bcrypt';

/**
 * Test user setup for E2E tests
 * Creates/manages test users for authentication testing
 */

export interface TestUser {
  id: string;
  email: string;
  password: string;
  name: string;
}

export const TEST_USERS = {
  junior_developer: {
    email: 'junior@test.techrec.com',
    password: 'testpass123',
    name: 'Junior Test Developer'
  },
  experienced_developer: {
    email: 'senior@test.techrec.com', 
    password: 'testpass123',
    name: 'Senior Test Developer'
  },
  new_user: {
    email: 'newbie@test.techrec.com',
    password: 'testpass123', 
    name: 'New Test User'
  },
  cv_upload_clean: {
    email: 'cv-upload-test@test.techrec.com',
    password: 'testpass123',
    name: 'CV Upload Test User'
  },
  cv_upload_1: {
    email: 'cv-upload-1@test.techrec.com',
    password: 'testpass123',
    name: 'CV Upload Test User 1'
  },
  cv_upload_2: {
    email: 'cv-upload-2@test.techrec.com',
    password: 'testpass123',
    name: 'CV Upload Test User 2'
  },
  cv_upload_3: {
    email: 'cv-upload-3@test.techrec.com',
    password: 'testpass123',
    name: 'CV Upload Test User 3'
  }
} as const;

export async function createTestUser(userType: keyof typeof TEST_USERS): Promise<TestUser> {
  const userData = TEST_USERS[userType];
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  try {
    // Try to find existing user first
    let user = await prisma.developer.findUnique({
      where: { email: userData.email }
    });

    if (!user) {
      // Create new test user
      user = await prisma.developer.create({
        data: {
          email: userData.email,
          profileEmail: userData.email,
          name: userData.name,
          title: userType === 'junior_developer' ? 'Junior Developer' : 
                 userType === 'experienced_developer' ? 'Senior Developer' :
                 userType === 'cv_upload_clean' ? 'Test CV Upload User' : 'Developer',
          hashedPassword
        }
      });
    } else {
      // Update existing user's password
      user = await prisma.developer.update({
        where: { email: userData.email },
        data: { hashedPassword }
      });
    }

    return {
      id: user.id,
      email: userData.email,
      password: userData.password,
      name: userData.name
    };
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
}

export async function cleanupTestUsers(): Promise<void> {
  try {
    const testEmails = Object.values(TEST_USERS).map(user => user.email);
    
    await prisma.developer.deleteMany({
      where: {
        email: {
          in: testEmails
        }
      }
    });
    
    console.log('Test users cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up test users:', error);
  }
}

export async function ensureTestUsersExist(): Promise<void> {
  console.log('Setting up test users...');
  
  for (const userType of Object.keys(TEST_USERS) as Array<keyof typeof TEST_USERS>) {
    await createTestUser(userType);
  }
  
  console.log('Test users setup complete');
} 