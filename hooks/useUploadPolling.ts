import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/lib/store';
import { fetchAnalysisData } from '@/lib/features/analysisSlice';

interface UseUploadPollingOptions {
  analysisId?: string;
  enabled?: boolean;
  interval?: number; // milliseconds
  maxAttempts?: number;
}

/**
 * Hook to poll for analysis completion after CV upload
 * Automatically stops polling when analysis is complete or fails
 */
export function useUploadPolling({
  analysisId,
  enabled = false,
  interval = 3000, // 3 seconds
  maxAttempts = 20 // Max 1 minute of polling
}: UseUploadPollingOptions) {
  const dispatch: AppDispatch = useDispatch();
  const pollCount = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !analysisId) {
      return;
    }

    console.log('🔄 [POLLING] Starting analysis polling for:', analysisId);
    pollCount.current = 0;

    const poll = async () => {
      try {
        pollCount.current += 1;
        console.log(`🔄 [POLLING] Attempt ${pollCount.current}/${maxAttempts}`);
        
        const result = await dispatch(fetchAnalysisData(analysisId)).unwrap();
        
        // Check if analysis is complete
        if (result && (result.status === 'completed' || result.status === 'failed')) {
          console.log('✅ [POLLING] Analysis complete, stopping poll');
          return; // Stop polling
        }
        
        // Continue polling if not complete and under max attempts
        if (pollCount.current < maxAttempts) {
          timeoutRef.current = setTimeout(poll, interval);
        } else {
          console.log('⏰ [POLLING] Max attempts reached, stopping poll');
        }
        
      } catch (error) {
        console.error('❌ [POLLING] Poll failed:', error);
        // Continue polling on error (might be temporary)
        if (pollCount.current < maxAttempts) {
          timeoutRef.current = setTimeout(poll, interval);
        }
      }
    };

    // Start first poll
    timeoutRef.current = setTimeout(poll, interval);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      console.log('🛑 [POLLING] Cleanup - stopped polling');
    };
  }, [analysisId, enabled, interval, maxAttempts, dispatch]);

  // Manual cleanup function
  const stopPolling = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      console.log('🛑 [POLLING] Manually stopped');
    }
  };

  return { stopPolling, pollCount: pollCount.current };
}