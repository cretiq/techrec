import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { uploadFileToS3, getPresignedS3Url, deleteFileFromS3 } from '@/utils/s3Storage'; // Adjust path as necessary
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest'; // Extends jest matchers

// Mock environment variables
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
process.env.AWS_S3_BUCKET_NAME = 'test-bucket';

// Mock the S3Client completely using aws-sdk-client-mock
const s3Mock = mockClient(S3Client);

// Mock the getSignedUrl function (it's not part of S3Client)
// We need jest.mock for this as it's imported separately
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

// Type assertion for the mocked function
const mockedGetSignedUrl = getSignedUrl as jest.MockedFunction<typeof getSignedUrl>;

describe('S3 Storage Utilities', () => {
  beforeEach(() => {
    // Reset mocks before each test
    s3Mock.reset();
    mockedGetSignedUrl.mockClear();
    // Set default mock implementations if needed
    s3Mock.on(PutObjectCommand).resolves({ $metadata: { httpStatusCode: 200 } });
    s3Mock.on(DeleteObjectCommand).resolves({ $metadata: { httpStatusCode: 204 } });
    mockedGetSignedUrl.mockResolvedValue('https://mocked.presigned.url/test-key');
  });

  // --- uploadFileToS3 --- 
  it('should call S3Client.send with PutObjectCommand for uploadFileToS3', async () => {
    const key = 'uploads/test.txt';
    const body = Buffer.from('test content');
    const contentType = 'text/plain';

    await uploadFileToS3(key, body, contentType);

    expect(s3Mock).toHaveReceivedCommandTimes(PutObjectCommand, 1);
    expect(s3Mock).toHaveReceivedCommandWith(PutObjectCommand, {
      Bucket: 'test-bucket',
      Key: key,
      Body: body,
      ContentType: contentType,
    });
  });

  it('should return S3 response on successful upload', async () => {
    const key = 'uploads/test.txt';
    const body = 'test string';
    const contentType = 'text/plain';
    const mockResponse = { ETag: '"mock-etag"' , $metadata: { httpStatusCode: 200 } }; // Example simplified response
    s3Mock.on(PutObjectCommand).resolves(mockResponse);

    const result = await uploadFileToS3(key, body, contentType);

    expect(result).toEqual(mockResponse);
  });

  it('should throw error on S3 upload failure', async () => {
    const key = 'uploads/fail.txt';
    const body = 'test';
    const contentType = 'text/plain';
    const mockError = new Error('S3 Upload Failed');
    s3Mock.on(PutObjectCommand).rejects(mockError);

    await expect(uploadFileToS3(key, body, contentType)).rejects.toThrow(
      'Failed to upload file to S3'
    );
    expect(s3Mock).toHaveReceivedCommandTimes(PutObjectCommand, 1);
  });

  // --- getPresignedS3Url --- 
  it('should call getSignedUrl with correct parameters', async () => {
    const key = 'downloads/report.pdf';
    const expiresIn = 900; // 15 minutes

    await getPresignedS3Url(key, expiresIn);

    // Check if getSignedUrl was called
    expect(mockedGetSignedUrl).toHaveBeenCalledTimes(1);
    // Check the first argument (S3Client instance - difficult to match exactly, check type maybe)
    expect(mockedGetSignedUrl.mock.calls[0][0]).toBeInstanceOf(S3Client);
    // Check the second argument (GetObjectCommand instance)
    expect(mockedGetSignedUrl.mock.calls[0][1]).toBeInstanceOf(GetObjectCommand);
    expect(mockedGetSignedUrl.mock.calls[0][1].input).toEqual({
      Bucket: 'test-bucket',
      Key: key,
    });
    // Check the third argument (options)
    expect(mockedGetSignedUrl.mock.calls[0][2]).toEqual({ expiresIn });
  });

  it('should return the presigned URL on success', async () => {
    const key = 'downloads/image.jpg';
    const expectedUrl = 'https://signed-url.example.com/image.jpg?sig=123';
    mockedGetSignedUrl.mockResolvedValue(expectedUrl);

    const result = await getPresignedS3Url(key);

    expect(result).toBe(expectedUrl);
  });

  it('should throw error if getSignedUrl fails', async () => {
    const key = 'downloads/fail.zip';
    const mockError = new Error('Presigner Failed');
    mockedGetSignedUrl.mockRejectedValue(mockError);

    await expect(getPresignedS3Url(key)).rejects.toThrow(
      'Failed to generate presigned URL'
    );
  });

  // --- deleteFileFromS3 ---
  it('should call S3Client.send with DeleteObjectCommand for deleteFileFromS3', async () => {
    const key = 'to-delete/old-file.log';

    await deleteFileFromS3(key);

    expect(s3Mock).toHaveReceivedCommandTimes(DeleteObjectCommand, 1);
    expect(s3Mock).toHaveReceivedCommandWith(DeleteObjectCommand, {
      Bucket: 'test-bucket',
      Key: key,
    });
  });

  it('should return S3 response on successful delete', async () => {
    const key = 'to-delete/another.tmp';
    const mockResponse = { DeleteMarker: true , $metadata: { httpStatusCode: 204 } }; // Example simplified response
    s3Mock.on(DeleteObjectCommand).resolves(mockResponse);

    const result = await deleteFileFromS3(key);

    expect(result).toEqual(mockResponse);
  });

  it('should throw error on S3 delete failure', async () => {
    const key = 'to-delete/fail.data';
    const mockError = new Error('S3 Delete Failed');
    s3Mock.on(DeleteObjectCommand).rejects(mockError);

    await expect(deleteFileFromS3(key)).rejects.toThrow(
      'Failed to delete file from S3'
    );
    expect(s3Mock).toHaveReceivedCommandTimes(DeleteObjectCommand, 1);
  });
}); 