# MVP CV Upload Implementation Plan

## Executive Summary

This document outlines the implementation plan for a simplified MVP CV upload feature that extracts and stores CV content as plain text/markdown instead of structured JSON. This approach enables rapid deployment while maintaining AI suggestion capabilities through full-text context analysis.

**Key Benefits:**
- 50% reduction in complexity
- <10s processing time
- Environment toggle for instant on/off
- Zero impact on existing flow
- Faster time to market

---

## Architecture Overview

### Current Flow (Complex)
```
Upload → S3 → Parse → Gemini (JSON) → Validate → Database Sync → Redux → Display
```

### MVP Flow (Simplified)
```
Upload → S3 → Gemini (Markdown) → Store Text → Display
```

---

## Implementation Phases

### Phase 1: Core Infrastructure (Day 1-2)

#### 1.1 Environment Toggle System
```typescript
// .env.local
ENABLE_MVP_CV_UPLOAD=true

// utils/featureFlags.ts
export const useMvpCvUpload = () => {
  return process.env.ENABLE_MVP_CV_UPLOAD === 'true';
};

export const getMvpRedirectPath = () => {
  return useMvpCvUpload() ? '/developer/cv-mvp' : '/developer/cv-management';
};
```

#### 1.2 Database Schema Updates
```prisma
model CV {
  // Existing fields preserved...
  
  // MVP-specific fields
  mvpExtractedContent String?  @db.String    // Plain text/markdown content
  mvpAnalysisVersion  Int?     @default(1)   // Track MVP version
  mvpSuggestions      Json?                  // Store AI suggestions
  mvpMetadata         Json?                  // Basic metadata
  mvpLastEdited       DateTime?              // Track manual edits
}
```

### Phase 2: Backend Services (Day 2-3)

#### 2.1 MVP Extraction Service
```typescript
// utils/mvpExtraction.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiModel } from '@/lib/modelConfig';

export class MvpExtractionService {
  private genAI: GoogleGenerativeAI;
  
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
  }

  async extractAsMarkdown(filePath: string): Promise<{
    success: boolean;
    content?: string;
    metadata?: {
      wordCount: number;
      characterCount: number;
      sectionsDetected: string[];
    };
    error?: string;
  }> {
    const model = this.genAI.getGenerativeModel({ 
      model: getGeminiModel('mvp-extraction')
    });

    const prompt = `
      Extract and format the content of this CV/resume in clean markdown format.
      
      Requirements:
      1. Preserve the exact structure and organization from the document
      2. Use proper markdown headers (# ## ###) for sections
      3. Use lists (- or *) for bullet points
      4. Use **bold** for emphasis and important information
      5. Maintain professional formatting and readability
      6. Include ALL content - do not summarize or omit anything
      7. Keep original section names and ordering
      
      Do NOT:
      - Analyze or restructure the content
      - Add your own commentary
      - Create new sections
      - Summarize or condense information
      
      Return the CV content in clean, well-formatted markdown.
    `;

    try {
      const startTime = Date.now();
      const result = await model.generateContent([prompt, filePath]);
      const content = result.response.text();
      
      // Extract metadata
      const wordCount = content.split(/\s+/).length;
      const characterCount = content.length;
      const sections = this.detectSections(content);
      
      return {
        success: true,
        content,
        metadata: {
          wordCount,
          characterCount,
          sectionsDetected: sections
        }
      };
    } catch (error) {
      console.error('MVP extraction failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  private detectSections(content: string): string[] {
    const headerRegex = /^#{1,3}\s+(.+)$/gm;
    const sections: string[] = [];
    let match;
    
    while ((match = headerRegex.exec(content)) !== null) {
      sections.push(match[1]);
    }
    
    return sections;
  }
}
```

#### 2.2 MVP Upload API Route
```typescript
// app/api/cv/mvp-upload/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { uploadFileToS3 } from '@/utils/s3Storage';
import { MvpExtractionService } from '@/utils/mvpExtraction';
import { prisma } from '@/lib/prisma';
import { AnalysisStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    // Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Validation (reuse existing)
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload to S3
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const s3Key = `cvs/${session.user.id}/${Date.now()}-${file.name}`;
    await uploadFileToS3(s3Key, fileBuffer, file.type);

    // Extract with MVP service
    const extractionService = new MvpExtractionService();
    const extraction = await extractionService.extractAsMarkdown(s3Key);

    if (!extraction.success) {
      return NextResponse.json({ 
        error: 'Extraction failed', 
        details: extraction.error 
      }, { status: 500 });
    }

    // Store in database
    const cv = await prisma.cv.create({
      data: {
        developerId: session.user.id,
        filename: s3Key,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        s3Key: s3Key,
        status: AnalysisStatus.COMPLETED,
        mvpExtractedContent: extraction.content,
        mvpAnalysisVersion: 1,
        mvpMetadata: extraction.metadata
      }
    });

    // Cache in Redis for session
    await cacheInRedis(session.user.id, cv.id, extraction.content);

    return NextResponse.json({
      success: true,
      cvId: cv.id,
      content: extraction.content,
      metadata: extraction.metadata
    });
  } catch (error) {
    console.error('MVP upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed',
      details: error.message 
    }, { status: 500 });
  }
}
```

#### 2.3 MVP Suggestions Service
```typescript
// utils/mvpSuggestions.ts
export async function generateMvpSuggestions(
  cvText: string,
  jobDescription?: string,
  targetRole?: string
): Promise<{
  overallScore: number;
  assessment: string;
  improvements: string[];
  missingSections: string[];
  keywords: string[];
  formattingTips: string[];
}> {
  const prompt = `
    You are an expert CV reviewer and career coach. Review this CV and provide actionable improvement suggestions.
    
    ${jobDescription ? `Target Job Description:\n${jobDescription}\n` : ''}
    ${targetRole ? `Target Role: ${targetRole}\n` : ''}
    
    CV Content:
    ${cvText}
    
    Provide a comprehensive review with:
    
    1. Overall Score (0-100) - Be realistic and constructive
    2. Overall Assessment (2-3 sentences) - Key strengths and main areas for improvement
    3. Top 5 Specific Improvements - With concrete examples of what to change
    4. Missing Sections - What's typically expected but not present
    5. Keywords to Add - For ATS optimization based on the role/industry
    6. Formatting Tips - To improve readability and professional appearance
    
    Format your response as JSON with these exact keys:
    {
      "overallScore": number,
      "assessment": "string",
      "improvements": ["string", ...],
      "missingSections": ["string", ...],
      "keywords": ["string", ...],
      "formattingTips": ["string", ...]
    }
  `;

  const model = genAI.getGenerativeModel({ 
    model: getGeminiModel('mvp-suggestions'),
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    }
  });

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  // Parse JSON response
  return JSON.parse(response);
}
```

### Phase 3: Frontend Components (Day 3-4)

#### 3.1 MVP Page Component
```typescript
// app/developer/cv-mvp/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { MvpUploadForm } from '@/components/cv-mvp/MvpUploadForm';
import { MvpContentDisplay } from '@/components/cv-mvp/MvpContentDisplay';
import { MvpSuggestionPanel } from '@/components/cv-mvp/MvpSuggestionPanel';
import { Card } from '@/components/ui-daisy/card';
import { Button } from '@/components/ui-daisy/button';
import { useSelector, useDispatch } from 'react-redux';
import { setMvpContent, setMvpSuggestions } from '@/lib/features/mvpAnalysisSlice';

export default function MvpCvPage() {
  const dispatch = useDispatch();
  const { extractedContent, suggestions } = useSelector(state => state.mvpAnalysis);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const handleUploadSuccess = (data: any) => {
    dispatch(setMvpContent({
      cvId: data.cvId,
      content: data.content,
      metadata: data.metadata
    }));
  };

  const handleGetSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const response = await fetch('/api/cv/mvp-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText: extractedContent })
      });
      
      const suggestions = await response.json();
      dispatch(setMvpSuggestions(suggestions));
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">MVP CV Management</h1>
        <p className="text-gray-600">
          Simplified CV upload with AI-powered suggestions
        </p>
      </div>

      {!extractedContent ? (
        <Card variant="glass">
          <MvpUploadForm onSuccess={handleUploadSuccess} />
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MvpContentDisplay 
              content={extractedContent}
              isEditing={isEditing}
              onEdit={setIsEditing}
              onSave={(content) => {
                dispatch(setMvpContent({ content }));
                setIsEditing(false);
              }}
            />
          </div>
          
          <div className="lg:col-span-1">
            <Card variant="elevated" className="sticky top-4">
              <div className="p-4">
                <Button
                  onClick={handleGetSuggestions}
                  loading={loadingSuggestions}
                  className="w-full mb-4"
                >
                  Get AI Suggestions
                </Button>
                
                {suggestions && (
                  <MvpSuggestionPanel suggestions={suggestions} />
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
```

#### 3.2 Redux Slice for MVP
```typescript
// lib/features/mvpAnalysisSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MvpAnalysisState {
  cvId: string | null;
  extractedContent: string | null;
  metadata: any | null;
  suggestions: any | null;
  isEditing: boolean;
  lastSaved: string | null;
}

const initialState: MvpAnalysisState = {
  cvId: null,
  extractedContent: null,
  metadata: null,
  suggestions: null,
  isEditing: false,
  lastSaved: null
};

const mvpAnalysisSlice = createSlice({
  name: 'mvpAnalysis',
  initialState,
  reducers: {
    setMvpContent: (state, action) => {
      state.cvId = action.payload.cvId || state.cvId;
      state.extractedContent = action.payload.content;
      state.metadata = action.payload.metadata || state.metadata;
      state.lastSaved = new Date().toISOString();
    },
    setMvpSuggestions: (state, action) => {
      state.suggestions = action.payload;
    },
    clearMvpData: (state) => {
      return initialState;
    }
  }
});

export const { setMvpContent, setMvpSuggestions, clearMvpData } = mvpAnalysisSlice.actions;
export default mvpAnalysisSlice.reducer;
```

### Phase 4: Testing & Optimization (Day 4-5)

#### 4.1 Performance Optimizations
1. **Streaming Responses**: Implement streaming for Gemini responses
2. **Caching Strategy**: 24-hour Redis cache for extracted content
3. **Lazy Loading**: Load suggestions only when requested
4. **Debounced Saves**: Auto-save edits with 2-second debounce

#### 4.2 Error Handling
```typescript
// utils/mvpErrorBoundary.ts
export class MvpError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'MvpError';
  }
}

export const handleMvpError = (error: any): MvpError => {
  if (error instanceof MvpError) return error;
  
  // Map common errors
  if (error.message.includes('file too large')) {
    return new MvpError('File exceeds 10MB limit', 'FILE_TOO_LARGE');
  }
  
  if (error.message.includes('extraction failed')) {
    return new MvpError('Could not extract CV content', 'EXTRACTION_FAILED');
  }
  
  return new MvpError('An unexpected error occurred', 'UNKNOWN', false);
};
```

---

## Migration Strategy

### Rollout Plan
1. **Week 1**: Deploy with flag disabled, test internally
2. **Week 2**: Enable for 10% of users (A/B test)
3. **Week 3**: Expand to 50% based on metrics
4. **Week 4**: Full rollout or rollback based on results

### Success Metrics
- Upload success rate > 95%
- Processing time < 10s (p95)
- User satisfaction score > 4/5
- Bug reports < 5 per 1000 uploads

### Rollback Plan
1. Set `ENABLE_MVP_CV_UPLOAD=false`
2. Users automatically redirect to full analysis
3. MVP data preserved for migration
4. No data loss or user disruption

---

## Risk Mitigation

### Known Pitfalls & Solutions

| Risk | Impact | Mitigation |
|------|---------|------------|
| Empty file validation | Upload fails | Reuse existing validation from main flow |
| Developer ID missing | DB constraint error | Use verified session user |
| Gemini timeout | User stuck waiting | 30s timeout with retry |
| Large files | Memory issues | Stream processing for >5MB |
| Concurrent edits | Data loss | Optimistic locking with version field |

### Debug Integration
Extend existing debug system:
```typescript
// logs/mvp-upload/[sessionId]-mvp.json
{
  "timestamp": "2025-01-31T10:00:00Z",
  "userId": "...",
  "fileSize": 245678,
  "extractionDuration": 4567,
  "wordCount": 523,
  "sectionsDetected": ["Experience", "Education", "Skills"],
  "suggestionsGenerated": true,
  "errors": []
}
```

---

## Implementation Checklist

### Week 1 Deliverables
- [ ] Environment variable setup
- [ ] Database schema migration
- [ ] MVP extraction service
- [ ] MVP upload API route
- [ ] Basic UI components
- [ ] Redux integration

### Week 2 Deliverables
- [ ] Suggestions API
- [ ] Edit functionality
- [ ] Export options
- [ ] Error handling
- [ ] Debug logging
- [ ] Performance optimization

### Launch Criteria
- [ ] All tests passing (>95% coverage)
- [ ] Performance benchmarks met (<10s p95)
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Rollback plan tested
- [ ] Monitoring dashboards ready

---

## Conclusion

This MVP approach reduces complexity by 50% while maintaining core functionality. The environment toggle ensures zero risk to existing users, and the phased rollout allows for data-driven decisions. With proper execution, we can ship in 2 weeks instead of 6 weeks for the full solution.

**Next Steps:**
1. Review and approve plan
2. Set up development environment
3. Begin Phase 1 implementation
4. Daily progress reviews

**Contact:** For questions or concerns about this implementation plan, please reach out to the development team.