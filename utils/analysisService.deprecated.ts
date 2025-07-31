import { PrismaClient, AnalysisStatus, CV } from '@prisma/client';
import { downloadS3FileAsBuffer } from './s3Storage';
import { v4 as uuidv4 } from 'uuid';
import { analyzeCvWithGemini } from './geminiAnalysis';
// Redis cache will be handled dynamically for server-side only
import { parseFileContent } from './fileParsers';

const prisma = new PrismaClient();
const ANALYSIS_CACHE_PREFIX = 'cv_analysis:';

// Helper to get memory usage in MB
const getMemoryUsage = () => {
  const used = process.memoryUsage();
  return {
    heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
    heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
    rss: Math.round(used.rss / 1024 / 1024 * 100) / 100
  };
};

// Helper to measure elapsed time
const getElapsedTime = (start: [number, number]) => {
  const [seconds, nanoseconds] = process.hrtime(start);
  return seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds
};

/**
 * Performs the full CV analysis process for a given record ID.
 * - Sets status to ANALYZING.
 * - Downloads file from S3.
 * - Parses file content.
 * - Analyzes content with GPT.
 * - Updates record with result (COMPLETED or FAILED).
 * - Updates cache on success.
 * 
 * @param analysisRecordId The ID of the CvAnalysis record to process.
 * @throws If any step fails after recoverable errors.
 */
export const processCvAnalysis = async (analysisRecordId: string): Promise<void> => {
  const startTime = process.hrtime();
  const timings: Record<string, number> = {};
  let currentStep = 'initialization';
  let recordToProcess: CvAnalysis | null = null;

  console.log(`[processCvAnalysis] Starting process for Analysis ID: ${analysisRecordId}...`, {
    timestamp: new Date().toISOString(),
    memory: getMemoryUsage()
  });

  try {
    // 1. Fetch the record
    currentStep = 'fetch_record';
    const fetchStart = process.hrtime();
    recordToProcess = await prisma.cvAnalysis.findUnique({
      where: { id: analysisRecordId },
    });
    timings.fetchRecord = getElapsedTime(fetchStart);

    if (!recordToProcess) {
      console.error(`[Analysis ${analysisRecordId}] Record not found`, {
        step: currentStep,
        elapsedMs: getElapsedTime(startTime)
      });
      throw new Error(`Analysis record ${analysisRecordId} not found.`);
    }

    console.log(`[Analysis ${analysisRecordId}] Record fetched`, {
      step: currentStep,
      elapsedMs: timings.fetchRecord,
      status: recordToProcess.status,
      mimeType: recordToProcess.mimeType,
      fileSize: recordToProcess.size
    });

    // 2. Check status
    currentStep = 'status_check';
    if (recordToProcess.status === AnalysisStatus.COMPLETED || recordToProcess.status === AnalysisStatus.FAILED) {
      console.log(`[Analysis ${analysisRecordId}] Already processed`, {
        step: currentStep,
        status: recordToProcess.status,
        elapsedMs: getElapsedTime(startTime)
      });
      return;
    }

    // 3. Update status to ANALYZING
    currentStep = 'status_update';
    const updateStart = process.hrtime();
    await prisma.cvAnalysis.update({
      where: { id: analysisRecordId },
      data: { status: AnalysisStatus.ANALYZING, analyzedAt: new Date() }
    });
    timings.statusUpdate = getElapsedTime(updateStart);

    console.log(`[Analysis ${analysisRecordId}] Status updated to ANALYZING`, {
      step: currentStep,
      elapsedMs: timings.statusUpdate
    });

    // 4. Download file from S3
    currentStep = 'download';
    if (!recordToProcess.s3Key) {
      throw new Error(`Record ${analysisRecordId} is missing S3 key.`);
    }

    const downloadStart = process.hrtime();
    console.log(`[Analysis ${analysisRecordId}] Starting file download`, {
      step: currentStep,
      s3Key: recordToProcess.s3Key
    });

    const fileBuffer = await downloadS3FileAsBuffer(recordToProcess.s3Key);
    timings.download = getElapsedTime(downloadStart);

    console.log(`[Analysis ${analysisRecordId}] File downloaded`, {
      step: currentStep,
      elapsedMs: timings.download,
      bufferSize: fileBuffer.length,
      memory: getMemoryUsage()
    });

    // 5. Parse content
    currentStep = 'parse';
    const parseStart = process.hrtime();
    console.log(`[Analysis ${analysisRecordId}] Starting content parsing`, {
      step: currentStep,
      mimeType: recordToProcess.mimeType
    });

    const parseResult = await parseFileContent(fileBuffer, recordToProcess.mimeType);
    const parsedText = parseResult.text;
    timings.parse = getElapsedTime(parseStart);

    console.log(`[Analysis ${analysisRecordId}] Content parsed`, {
      step: currentStep,
      elapsedMs: timings.parse,
      textLength: parsedText.length,
      numPages: parseResult.metadata?.numPages,
      memory: getMemoryUsage()
    });

    // 6. Perform Gemini Analysis
    const gptStart = process.hrtime();
    console.log(`[Analysis ${analysisRecordId}] Starting Gemini analysis...`);

    let analysisResult;
    try {
      analysisResult = await analyzeCvWithGemini(parsedText);
      timings.geminiAnalysis = getElapsedTime(gptStart);

      console.log(`[Analysis ${analysisRecordId}] Gemini analysis completed.`, {
        elapsedMs: timings.geminiAnalysis,
        resultSize: JSON.stringify(analysisResult).length,
        memory: getMemoryUsage()
      });
    } catch (geminiError) {
      console.error(`[Analysis ${analysisRecordId}] Error during Gemini analysis`, {
        step: currentStep,
        error: geminiError instanceof Error ? geminiError.message : 'Unknown error',
        stack: geminiError instanceof Error ? geminiError.stack : undefined,
        elapsedMs: getElapsedTime(gptStart),
        memory: getMemoryUsage()
      });
      throw new Error(`Gemini analysis failed: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}`);
    }

    // 7. Update DB with results
    currentStep = 'save_results';
    const saveStart = process.hrtime();
    await prisma.cvAnalysis.update({
      where: { id: analysisRecordId },
      data: {
        status: AnalysisStatus.COMPLETED,
        analysisResult: analysisResult,
        errorMessage: null,
        analyzedAt: new Date(),
      },
    });
    timings.saveResults = getElapsedTime(saveStart);

    console.log(`[Analysis ${analysisRecordId}] Results saved to DB`, {
      step: currentStep,
      elapsedMs: timings.saveResults
    });

    // 8. Update Cache
    currentStep = 'cache_update';
    if (recordToProcess.fileHash) {
      const cacheStart = process.hrtime();
      const cacheKey = `${ANALYSIS_CACHE_PREFIX}${recordToProcess.fileHash}`;
      // Cache analysis result (server-side only)
      if (typeof window === 'undefined') {
        try {
          const { setCache } = await import('@/lib/redis');
          await setCache(cacheKey, analysisResult);
        } catch (cacheError) {
          console.warn('Failed to cache analysis result:', cacheError);
        }
      }
      timings.cacheUpdate = getElapsedTime(cacheStart);

      console.log(`[Analysis ${analysisRecordId}] Cache updated`, {
        step: currentStep,
        elapsedMs: timings.cacheUpdate,
        cacheKey
      });
    }

    const totalTime = getElapsedTime(startTime);
    console.log(`[Analysis ${analysisRecordId}] Process completed successfully`, {
      totalElapsedMs: totalTime,
      timings,
      memory: getMemoryUsage()
    });

  } catch (error) {
    const errorTime = getElapsedTime(startTime);
    console.error(`[Analysis ${analysisRecordId}] Error during processing`, {
      step: currentStep,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      elapsedMs: errorTime,
      timings,
      memory: getMemoryUsage()
    });

    // Update status to FAILED
    try {
      await prisma.cvAnalysis.update({
        where: { id: analysisRecordId },
        data: {
          status: AnalysisStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : 'Unknown error occurred during analysis',
          analyzedAt: new Date(),
        },
      });
      console.log(`[Analysis ${analysisRecordId}] Status updated to FAILED`, {
        step: 'error_handling'
      });
    } catch (updateError) {
      console.error(`[Analysis ${analysisRecordId}] Failed to update status to FAILED`, {
        step: 'error_handling',
        error: updateError instanceof Error ? updateError.message : 'Unknown error'
      });
    }

    throw error; // Re-throw to be handled by caller
  }
}; 