import OpenAI from 'openai';
import { z } from 'zod';
import { CvAnalysisDataSchema } from '@/types/cv';

// Initialize OpenAI client (requires OPENAI_API_KEY environment variable)
const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY || '',
    dangerouslyAllowBrowser: process.env.NODE_ENV === 'development',
});

const gptModel = process.env.GPT_MODEL || "gpt-4.1-nano-2025-04-14";

// Helper to measure elapsed time
const getElapsedTime = (start: [number, number]) => {
  const [seconds, nanoseconds] = process.hrtime(start);
  return seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds
};

// Helper to estimate tokens in text
const estimateTokenCount = (text: string): number => {
  // GPT tokens are roughly 4 characters on average
  return Math.ceil(text.length / 4);
};

// Helper to format Zod schema for GPT consumption
const formatSchemaForGPT = (schema: z.ZodType<any>) => {
  const schemaObj = schema._def;
  
  // Convert Zod schema to a more GPT-friendly format
  const formatZodType = (zodType: any): any => {
    if (!zodType) return "string";
    if (zodType instanceof z.ZodString) return "string";
    if (zodType instanceof z.ZodBoolean) return "boolean";
    if (zodType instanceof z.ZodArray) return [formatZodType(zodType._def.type)];
    if (zodType instanceof z.ZodObject) {
      const shape = zodType._def.shape?.();
      return shape ? Object.fromEntries(
        Object.entries(shape).map(([key, value]) => [key, formatZodType(value)])
      ) : {};
    }
    if (zodType instanceof z.ZodEnum) return zodType._def.values.join("|");
    if (zodType instanceof z.ZodOptional || zodType instanceof z.ZodNullable) {
      return formatZodType(zodType._def.innerType);
    }
    return "string"; // fallback
  };

  return formatZodType(schema);
};

// Create example data based on schema
const createExampleFromSchema = (schema: any): any => {
  if (typeof schema === 'string') {
    if (schema.includes('|')) {
      return schema.split('|')[0];
    }
    return schema === 'string' ? 'example text' : schema;
  }
  if (Array.isArray(schema)) {
    return [createExampleFromSchema(schema[0])];
  }
  if (typeof schema === 'object') {
    const example: any = {};
    Object.entries(schema).forEach(([key, value]) => {
      example[key] = createExampleFromSchema(value);
    });
    return example;
  }
  return '';
};

// Helper function to recursively correct string booleans in the parsed data
const correctStringBooleans = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(correctStringBooleans);
  }
  if (data && typeof data === 'object') {
    const corrected: any = {};
    for (const key in data) {
      if (key === 'isNew' && typeof data[key] === 'string') {
        if (data[key].toLowerCase() === 'true') {
          corrected[key] = true;
        } else if (data[key].toLowerCase() === 'false') {
          corrected[key] = false;
        } else {
          corrected[key] = data[key]; // Keep original if not 'true'/'false'
        }
      } else {
        corrected[key] = correctStringBooleans(data[key]);
      }
    }
    return corrected;
  }
  return data;
};

/**
 * Analyzes CV text using OpenAI GPT and returns structured data.
 * Includes retry logic for API failures.
 * 
 * @param cvText The CV text content to analyze
 * @returns Structured CV data matching CvAnalysisDataSchema
 * @throws If analysis fails after retries or validation fails
 */
export const analyzeCvWithGPT = async (cvText: string): Promise<z.infer<typeof CvAnalysisDataSchema>> => {
  const MAX_RETRIES = 3;
  const startTime = process.hrtime();
  const timings: Record<string, number> = {};
  let currentAttempt = 1;
  let lastError: Error | null = null;
  
  // Format schema for GPT
  const schemaStructure = formatSchemaForGPT(CvAnalysisDataSchema);
  const exampleData = createExampleFromSchema(schemaStructure);
  
  const estimatedInputTokens = estimateTokenCount(cvText);
  console.log(`Starting CV analysis with GPT`, {
    textLength: cvText.length,
    estimatedTokens: estimatedInputTokens,
    timestamp: new Date().toISOString(),
    // schemaStructure: JSON.stringify(schemaStructure, null, 2) // Optional: reduce noise if schema is stable
  });

  while (currentAttempt <= MAX_RETRIES) {
    const attemptStart = process.hrtime();
    try {
      console.log(`Attempt ${currentAttempt}/${MAX_RETRIES} starting`, {
        attempt: currentAttempt,
        elapsedMs: getElapsedTime(startTime),
        timestamp: new Date().toISOString()
      });

      // *** Construct the Request Payload ***
      const requestPayload: OpenAI.Chat.ChatCompletionCreateParams = {
          model: gptModel,
          messages: [
              {
                  role: "system",
                  content: `You are a CV analysis expert. Analyze the provided CV text and extract key information into a structured format. Follow these guidelines:
                  - Extract all relevant information that matches the schema exactly
                  - Use consistent date formats (YYYY-MM-DD)
                  - For skills:
                    - Each skill must have name, category, and level
                    - Normalize skill levels to: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
                  - Include relevant context and details in descriptions
                  - Never return null values - use empty string if no data available
                  - All array fields must be arrays, even if empty
                  - Boolean fields (like 'isNew') must be actual booleans (true or false), NOT strings ("true" or "false").
                  
                  Required JSON structure (derived from Zod schema):
                  ${JSON.stringify(schemaStructure, null, 2)}
                  
                  Example of valid response:
                  ${JSON.stringify(exampleData, null, 2)}
                  
                  Important:
                  - Follow the schema structure EXACTLY
                  - Do not change the sentences or text of the original CV text.
                  - All fields must match the types shown
                  - Boolean fields MUST be true or false, not strings.
                  - Arrays must always be arrays, never objects
                  - Use empty strings instead of null
                  - Dates must be YYYY-MM-DD format
                  - Skill levels must be one of: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT`
              },
              {
                  role: "user",
                  content: cvText
              }
          ],
          temperature: 0.1,
          response_format: { type: "json_object" }
      };

      // *** Log the Full Request Payload ***
      // *** Make the API Call ***
      const completion = await openai.chat.completions.create(requestPayload);

      // *** Log the Full Response Object ***
      console.log('[GPT Response] Received completion object:', JSON.stringify(completion, null, 2));

      const completionTime = getElapsedTime(attemptStart);
      timings[`attempt_${currentAttempt}`] = completionTime;

      if (!completion.choices[0]?.message?.content) {
        console.error(`Empty GPT response content`, {
          attempt: currentAttempt,
          elapsedMs: completionTime,
          completion: completion // Log full completion object on error too
        });
        throw new Error('Empty response content from GPT');
      }

      console.log(`GPT response received`, {
        attempt: currentAttempt,
        elapsedMs: completionTime,
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens,
        responseLength: completion.choices[0].message.content.length,
        finishReason: completion.choices[0].finish_reason
      });

      // Parse JSON response
      const parseStart = process.hrtime();
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(completion.choices[0].message.content);
        console.log(`JSON parse successful`, {
          attempt: currentAttempt,
          elapsedMs: getElapsedTime(parseStart),
          responseKeys: Object.keys(parsedResponse),
          arrayFields: {
            skills: Array.isArray(parsedResponse?.skills),
            experience: Array.isArray(parsedResponse?.experience),
            education: Array.isArray(parsedResponse?.education),
            achievements: Array.isArray(parsedResponse?.achievements)
          }
        });
      } catch (parseError) {
        console.error(`JSON parse error`, {
          attempt: currentAttempt,
          error: parseError instanceof Error ? parseError.message : 'Unknown error',
          content: completion.choices[0].message.content,
          elapsedMs: getElapsedTime(parseStart)
        });
        throw new Error('Failed to parse GPT response as JSON');
      }
      timings.jsonParse = getElapsedTime(parseStart);

      // Post-processing: Correct string booleans before validation
      const preprocessStart = process.hrtime();
      const correctedData = correctStringBooleans(parsedResponse);
      timings.preprocess = getElapsedTime(preprocessStart);
      console.log(`Pre-validation processing completed`, {
        attempt: currentAttempt,
        elapsedMs: timings.preprocess,
        changesMade: JSON.stringify(parsedResponse) !== JSON.stringify(correctedData)
      });

      // Validate against schema using corrected data
      const validateStart = process.hrtime();
      const validationResult = CvAnalysisDataSchema.safeParse(correctedData);
      timings.validation = getElapsedTime(validateStart);

      if (!validationResult.success) {
        const errorDetails = validationResult.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
          received: err.path.reduce((obj, key) => obj?.[key], correctedData)
        }));

        console.error(`Schema validation failed`, {
          attempt: currentAttempt,
          errors: errorDetails,
          receivedData: correctedData,
          validationTime: timings.validation,
          errorPaths: errorDetails.map(e => e.path).join(', ')
        });

        // Log specific validation issues
        errorDetails.forEach(error => {
          console.error(`Validation error detail:`, {
            path: error.path,
            message: error.message,
            received: error.received,
            suggestion: getSuggestionForError(error)
          });
        });

        throw new Error(`GPT response failed schema validation: ${errorDetails.map(e => `${e.path}: ${e.message}`).join('; ')}`);
      }

      const totalTime = getElapsedTime(startTime);
      console.log(`CV analysis completed successfully`, {
        attempts: currentAttempt,
        totalElapsedMs: totalTime,
        timings,
        tokenUsage: {
          prompt: completion.usage?.prompt_tokens,
          completion: completion.usage?.completion_tokens,
          total: completion.usage?.total_tokens
        },
        dataStats: {
          skillsCount: validationResult.data.skills?.length || 0,
          experienceCount: validationResult.data.experience?.length || 0,
          educationCount: validationResult.data.education?.length || 0,
          achievementsCount: validationResult.data.achievements?.length || 0,
          hasContactInfo: !!validationResult.data.contactInfo,
          aboutLength: validationResult.data.about?.length || 0
        }
      });

      return validationResult.data;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`Analysis attempt ${currentAttempt} failed`, {
        attempt: currentAttempt,
        error: lastError.message,
        stack: lastError.stack,
        elapsedMs: getElapsedTime(attemptStart),
        timings
      });

      if (currentAttempt === MAX_RETRIES) {
        console.error(`All analysis attempts failed`, {
          totalAttempts: MAX_RETRIES,
          totalElapsedMs: getElapsedTime(startTime),
          timings,
          finalError: lastError.message,
          allErrors: lastError.stack
        });
        throw new Error(`CV analysis failed after ${MAX_RETRIES} attempts: ${lastError.message}`);
      }

      // Exponential backoff before retry
      const backoffMs = Math.min(1000 * Math.pow(2, currentAttempt - 1), 8000);
      console.log(`Retrying after backoff`, {
        attempt: currentAttempt,
        nextAttempt: currentAttempt + 1,
        backoffMs,
        previousError: lastError.message
      });
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      currentAttempt++;
    }
  }

  throw new Error('Unexpected end of analysis function');
};

// Helper function to provide suggestions for common validation errors
const getSuggestionForError = (error: { path: string; code: string; received: any }) => {
  switch (error.code) {
    case 'invalid_type':
      if (error.received === null) {
        return 'Use empty string instead of null';
      }
      if (typeof error.received === 'object') {
        return 'Ensure correct data structure (array vs object)';
      }
      return `Ensure correct data type is used`;
    
    case 'invalid_string':
      if (error.path.includes('date')) {
        return 'Use YYYY-MM-DD format';
      }
      if (error.path.includes('email')) {
        return 'Use valid email format';
      }
      if (error.path.includes('url') || error.path.includes('website')) {
        return 'Use valid URL format with http(s)://';
      }
      return 'Ensure string meets validation requirements';
    
    case 'invalid_enum_value':
      if (error.path.includes('level')) {
        return 'Use one of: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT';
      }
      return 'Use one of the allowed enum values';
    
    default:
      return 'Check value matches schema requirements';
  }
}; 