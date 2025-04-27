import { PrismaClient, CV, CvStatus } from '@prisma/client';
import { deleteFileFromS3 } from './s3Storage'; // Import S3 delete function

const prisma = new PrismaClient();

export interface CvCreateData {
  developerId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  s3Key: string;
  status?: CvStatus;
  extractedText?: string;
  metadata?: any; // Adjust type as needed
}

export interface CvUpdateData {
  originalName?: string;
  status?: CvStatus;
  extractedText?: string;
  metadata?: any; // Adjust type as needed
}

/**
 * Creates a new CV record in the database.
 */
export const createCV = async (data: CvCreateData): Promise<CV> => {
  console.log('Creating CV record for:', data.originalName);
  try {
    const newCV = await prisma.cV.create({
      data: {
        ...data,
        status: data.status ?? CvStatus.UPLOADING, // Default status if not provided
      },
    });
    console.log('Successfully created CV record with ID:', newCV.id);
    return newCV;
  } catch (error) {
    console.error('Error creating CV record:', error);
    throw new Error('Failed to create CV record');
  }
};

/**
 * Retrieves a CV record by its ID.
 */
export const getCV = async (id: string): Promise<CV | null> => {
  console.log('Retrieving CV record with ID:', id);
  try {
    const cv = await prisma.cV.findUnique({
      where: { id },
    });
    console.log(cv ? 'Found CV record.' : 'CV record not found.');
    return cv;
  } catch (error) {
    console.error('Error retrieving CV record:', error);
    throw new Error('Failed to retrieve CV record');
  }
};

/**
 * Updates a CV record.
 */
export const updateCV = async (id: string, data: CvUpdateData): Promise<CV> => {
  console.log('Updating CV record with ID:', id);
  try {
    const updatedCV = await prisma.cV.update({
      where: { id },
      data,
    });
    console.log('Successfully updated CV record.');
    return updatedCV;
  } catch (error) {
    console.error('Error updating CV record:', error);
    // Consider more specific error handling, e.g., record not found
    throw new Error('Failed to update CV record');
  }
};

/**
 * Deletes a CV record from the database and its corresponding file from S3.
 */
export const deleteCV = async (id: string): Promise<CV> => {
  console.log('Deleting CV record with ID:', id);
  try {
    // First, retrieve the CV to get the S3 key
    const cvToDelete = await prisma.cV.findUnique({ where: { id } });
    if (!cvToDelete) {
      throw new Error(`CV record with ID ${id} not found.`);
    }

    // Delete the file from S3
    console.log('Deleting file from S3 with key:', cvToDelete.s3Key);
    await deleteFileFromS3(cvToDelete.s3Key);
    console.log('Successfully deleted file from S3.');

    // Then, delete the database record
    const deletedCV = await prisma.cV.delete({
      where: { id },
    });
    console.log('Successfully deleted CV record from database.');
    return deletedCV;
  } catch (error) {
    console.error('Error deleting CV:', error);
    // Rethrow or handle specific errors (S3 deletion failure, DB deletion failure)
    throw new Error('Failed to delete CV');
  }
};

/**
 * Interface for CV list filters.
 */
export interface CvListFilters {
  originalName?: string; // For text search
  status?: CvStatus;
  // Add other potential filters: date range, mimeType, etc.
}

/**
 * Lists CVs for a specific developer, optionally with filters and pagination.
 */
export const listCVs = async (
  developerId: string, 
  filters: CvListFilters = {}, 
  // Add pagination options if needed later
  // pagination: { skip?: number; take?: number } = {}
): Promise<CV[]> => {
  console.log('Listing CVs for developer ID:', developerId, 'with filters:', filters);
  
  const whereCondition: any = { developerId };

  if (filters.originalName) {
    whereCondition.originalName = {
      contains: filters.originalName,
      mode: 'insensitive', // Case-insensitive search for MongoDB
    };
  }

  if (filters.status) {
    whereCondition.status = filters.status;
  }

  try {
    const cvs = await prisma.cV.findMany({
      where: whereCondition,
      // Add pagination logic if options are passed
      // skip: pagination.skip,
      // take: pagination.take,
      orderBy: {
        uploadDate: 'desc', // Default sort order
      },
    });
    console.log(`Found ${cvs.length} CVs matching criteria.`);
    return cvs;
  } catch (error) {
    console.error('Error listing CVs:', error);
    throw new Error('Failed to list CVs');
  }
}; 