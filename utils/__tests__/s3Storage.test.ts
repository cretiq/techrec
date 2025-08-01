import { uploadFileToS3, getPresignedS3Url, deleteFileFromS3 } from '@/utils/s3Storage';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Mock environment variables
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
process.env.AWS_S3_BUCKET_NAME = 'test-bucket';

// Mock AWS SDK modules using factory pattern
jest.mock('@aws-sdk/client-s3', () => {
  const mockSend = jest.fn();
  const mockS3Client = {
    send: mockSend,
  };
  const mockPutObjectCommand = jest.fn();
  const mockGetObjectCommand = jest.fn();
  const mockDeleteObjectCommand = jest.fn();

  return {
    S3Client: jest.fn().mockImplementation(() => mockS3Client),
    PutObjectCommand: mockPutObjectCommand,
    GetObjectCommand: mockGetObjectCommand,
    DeleteObjectCommand: mockDeleteObjectCommand,
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => {
  const mockGetSignedUrl = jest.fn();
  return {
    getSignedUrl: mockGetSignedUrl,
  };
});

// Get the mocked functions
const mockS3Client = new S3Client({}) as jest.Mocked<S3Client>;
const mockPutObjectCommand = PutObjectCommand as jest.MockedClass<typeof PutObjectCommand>;
const mockGetObjectCommand = GetObjectCommand as jest.MockedClass<typeof GetObjectCommand>;
const mockDeleteObjectCommand = DeleteObjectCommand as jest.MockedClass<typeof DeleteObjectCommand>;
const mockGetSignedUrl = getSignedUrl as jest.MockedFunction<typeof getSignedUrl>;

describe('S3 Storage Utilities', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    (mockS3Client.send as jest.Mock).mockResolvedValue({ $metadata: { httpStatusCode: 200 } });
    mockGetSignedUrl.mockResolvedValue('https://mocked.presigned.url/test-key');
  });

  describe('uploadFileToS3', () => {
    it('should call S3Client.send with PutObjectCommand for file upload', async () => {
      const key = 'uploads/test.txt';
      const body = Buffer.from('test content');
      const contentType = 'text/plain';

      const expectedResponse = { ETag: '"mock-etag"', $metadata: { httpStatusCode: 200 } };
      (mockS3Client.send as jest.Mock).mockResolvedValue(expectedResponse);

      const result = await uploadFileToS3(key, body, contentType);

      expect(mockPutObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: key,
        Body: body,
        ContentType: contentType,
      });
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle string body content', async () => {
      const key = 'uploads/test.txt';
      const body = 'test string content';
      const contentType = 'text/plain';

      await uploadFileToS3(key, body, contentType);

      expect(mockPutObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: key,
        Body: body,
        ContentType: contentType,
      });
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    });

    it('should throw error on S3 upload failure', async () => {
      const key = 'uploads/fail.txt';
      const body = 'test';
      const contentType = 'text/plain';
      const mockError = new Error('S3 Upload Failed');
      
      (mockS3Client.send as jest.Mock).mockRejectedValue(mockError);

      await expect(uploadFileToS3(key, body, contentType)).rejects.toThrow('Failed to upload file to S3');
      expect(mockPutObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: key,
        Body: body,
        ContentType: contentType,
      });
    });
  });

  describe('getPresignedS3Url', () => {
    it('should generate presigned URL for file access', async () => {
      const key = 'uploads/test.txt';
      const expectedUrl = 'https://test-bucket.s3.amazonaws.com/uploads/test.txt?presigned=true';
      
      mockGetSignedUrl.mockResolvedValue(expectedUrl);

      const result = await getPresignedS3Url(key);

      expect(mockGetObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: key,
      });
      expect(mockGetSignedUrl).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedUrl);
    });

    it('should handle presigned URL generation failure', async () => {
      const key = 'uploads/fail.txt';
      const mockError = new Error('Presigned URL generation failed');
      
      mockGetSignedUrl.mockRejectedValue(mockError);

      await expect(getPresignedS3Url(key)).rejects.toThrow('Failed to generate presigned URL');
      expect(mockGetObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: key,
      });
    });

    it('should use default expiration time', async () => {
      const key = 'uploads/test.txt';
      
      await getPresignedS3Url(key);

      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.any(Object), // The S3Client instance
        expect.any(Object), // The GetObjectCommand instance
        { expiresIn: 3600 } // Default 1 hour expiration
      );
    });
  });

  describe('deleteFileFromS3', () => {
    it('should call S3Client.send with DeleteObjectCommand', async () => {
      const key = 'uploads/test.txt';
      const expectedResponse = { $metadata: { httpStatusCode: 204 } };
      
      (mockS3Client.send as jest.Mock).mockResolvedValue(expectedResponse);

      const result = await deleteFileFromS3(key);

      expect(mockDeleteObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: key,
      });
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle S3 deletion failure', async () => {
      const key = 'uploads/fail.txt';
      const mockError = new Error('S3 Delete Failed');
      
      (mockS3Client.send as jest.Mock).mockRejectedValue(mockError);

      await expect(deleteFileFromS3(key)).rejects.toThrow('Failed to delete file from S3');
      expect(mockDeleteObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: key,
      });
    });

    it('should return successful deletion response', async () => {
      const key = 'uploads/delete-me.txt';
      const mockResponse = { 
        DeleteMarker: true,
        $metadata: { httpStatusCode: 204 }
      };
      
      (mockS3Client.send as jest.Mock).mockResolvedValue(mockResponse);

      const result = await deleteFileFromS3(key);

      expect(result).toEqual(mockResponse);
      expect(mockDeleteObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: key,
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network timeout errors', async () => {
      const key = 'uploads/timeout.txt';
      const body = 'test content';
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      
      (mockS3Client.send as jest.Mock).mockRejectedValue(timeoutError);

      await expect(uploadFileToS3(key, body, 'text/plain')).rejects.toThrow('Failed to upload file to S3');
    });

    it('should handle AWS credential errors', async () => {
      const key = 'uploads/auth-fail.txt';
      const credentialError = new Error('InvalidAccessKeyId');
      credentialError.name = 'InvalidAccessKeyId';
      
      (mockS3Client.send as jest.Mock).mockRejectedValue(credentialError);

      await expect(deleteFileFromS3(key)).rejects.toThrow('Failed to delete file from S3');
    });

    it('should handle bucket not found errors', async () => {
      const key = 'uploads/bucket-missing.txt';
      const bucketError = new Error('NoSuchBucket');
      bucketError.name = 'NoSuchBucket';
      
      mockGetSignedUrl.mockRejectedValue(bucketError);

      await expect(getPresignedS3Url(key)).rejects.toThrow('Failed to generate presigned URL');
    });
  });

  describe('Environment Configuration', () => {
    it('should use environment variables for bucket configuration', async () => {
      const key = 'uploads/env-test.txt';
      const body = 'test content';

      await uploadFileToS3(key, body, 'text/plain');

      expect(mockPutObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket', // From process.env.AWS_S3_BUCKET_NAME
        Key: key,
        Body: body,
        ContentType: 'text/plain',
      });
    });
  });
});