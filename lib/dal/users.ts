// File: lib/dal/users.ts

import { prisma } from '@/prisma/prisma';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Creates a new developer record in the database with a hashed password.
 * @param email - The user's email address.
 * @param password - The user's raw, plain-text password.
 * @returns The newly created developer object.
 */
export async function createUser(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  return prisma.developer.create({
    data: {
      email: email.toLowerCase(),
      profileEmail: email.toLowerCase(), // Set profileEmail same as email initially
      name: email.split('@')[0], // Use the part before the @ as a default name
      title: 'Software Developer', // Default title
      hashedPassword,
    },
  });
}

/**
 * Retrieves a developer by their email address.
 * @param email - The user's email address.
 * @returns The developer object or null if not found.
 */
export async function getUserByEmail(email: string) {
  return prisma.developer.findUnique({
    where: { email: email.toLowerCase() },
  });
}