import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReUploadButton } from '../ReUploadButton';
import { toast } from '@/components/ui-daisy/use-toast';

// Mock the toast function
jest.mock('@/components/ui-daisy/use-toast', () => ({
  toast: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock XMLHttpRequest
const mockXMLHttpRequest = {
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
  upload: { onprogress: null },
  onload: null,
  onerror: null,
  status: 200,
  responseText: JSON.stringify({ analysisId: 'new-analysis-123' }),
};
global.XMLHttpRequest = jest.fn(() => mockXMLHttpRequest) as any;

// Mock document.createElement for file input
const mockFileInput = {
  type: '',
  accept: '',
  style: { display: '' },
  onchange: null,
  click: jest.fn(),
  files: null,
};
const originalCreateElement = document.createElement;
document.createElement = jest.fn((tagName) => {
  if (tagName === 'input') {
    return mockFileInput as any;
  }
  return originalCreateElement.call(document, tagName);
});

// Mock document body methods
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();
document.body.appendChild = mockAppendChild;
document.body.removeChild = mockRemoveChild;

describe('ReUploadButton', () => {
  const mockOnUploadComplete = jest.fn();
  const mockAnalysisData = {
    cv: {
      id: 'cv-123',
      originalName: 'test-cv.pdf',
      uploadDate: '2024-01-15T10:30:00Z',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedFetch.mockClear();
    mockXMLHttpRequest.open.mockClear();
    mockXMLHttpRequest.send.mockClear();
    mockFileInput.click.mockClear();
    mockAppendChild.mockClear();
    mockRemoveChild.mockClear();
    (toast as jest.Mock).mockClear();
  });

  afterEach(() => {
    document.createElement = originalCreateElement;
  });

  describe('Rendering', () => {
    it('renders re-upload button with correct text and icon', () => {
      render(
        <ReUploadButton 
          analysisData={mockAnalysisData} 
          onUploadComplete={mockOnUploadComplete} 
        />
      );

      const button = screen.getByTestId('cv-management-action-reupload');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Re-upload CV');
      expect(button).not.toBeDisabled();
    });

    it('disables button when no CV ID is available', () => {
      const noIdAnalysisData = { cv: { originalName: 'test.pdf' } };
      
      render(
        <ReUploadButton 
          analysisData={noIdAnalysisData} 
          onUploadComplete={mockOnUploadComplete} 
        />
      );

      const button = screen.getByTestId('cv-management-action-reupload');
      expect(button).toBeDisabled();
    });

    it('shows error toast when CV ID is missing on click', async () => {
      const noIdAnalysisData = {};
      
      render(
        <ReUploadButton 
          analysisData={noIdAnalysisData} 
          onUploadComplete={mockOnUploadComplete} 
        />
      );

      const button = screen.getByTestId('cv-management-action-reupload');
      await userEvent.click(button);

      expect(toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'No CV found to replace',
        variant: 'destructive',
      });
    });
  });

  describe('Confirmation Modal', () => {
    it('shows confirmation modal when re-upload button is clicked', async () => {
      render(
        <ReUploadButton 
          analysisData={mockAnalysisData} 
          onUploadComplete={mockOnUploadComplete} 
        />
      );

      const button = screen.getByTestId('cv-management-action-reupload');
      await userEvent.click(button);

      // Check modal content
      expect(screen.getByText('Replace Current CV?')).toBeInTheDocument();
      expect(screen.getByText(/This will permanently delete your current CV/)).toBeInTheDocument();
      expect(screen.getByText('Current CV:')).toBeInTheDocument();
      expect(screen.getByText('test-cv.pdf')).toBeInTheDocument();
      expect(screen.getByText('Upload Date:')).toBeInTheDocument();
      expect(screen.getByText('⚠️ This action cannot be undone!')).toBeInTheDocument();
      
      // Check modal buttons
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Replace CV')).toBeInTheDocument();
    });

    it('closes modal when cancel button is clicked', async () => {
      render(
        <ReUploadButton 
          analysisData={mockAnalysisData} 
          onUploadComplete={mockOnUploadComplete} 
        />
      );

      // Open modal
      const button = screen.getByTestId('cv-management-action-reupload');
      await userEvent.click(button);
      expect(screen.getByText('Replace Current CV?')).toBeInTheDocument();

      // Click cancel
      const cancelButton = screen.getByText('Cancel');
      await userEvent.click(cancelButton);

      // Modal should be closed
      await waitFor(() => {
        expect(screen.queryByText('Replace Current CV?')).not.toBeInTheDocument();
      });
    });
  });

  describe('CV Deletion', () => {
    it('calls delete API when replace button is clicked', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      render(
        <ReUploadButton 
          analysisData={mockAnalysisData} 
          onUploadComplete={mockOnUploadComplete} 
        />
      );

      // Open modal and click replace
      const button = screen.getByTestId('cv-management-action-reupload');
      await userEvent.click(button);
      
      const replaceButton = screen.getByText('Replace CV');
      await userEvent.click(replaceButton);

      // Verify API call
      expect(mockedFetch).toHaveBeenCalledWith('/api/cv/cv-123', {
        method: 'DELETE',
      });
    });

    it('shows loading state during deletion', async () => {
      // Mock a delayed response
      mockedFetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true }),
        } as Response), 100))
      );

      render(
        <ReUploadButton 
          analysisData={mockAnalysisData} 
          onUploadComplete={mockOnUploadComplete} 
        />
      );

      const button = screen.getByTestId('cv-management-action-reupload');
      await userEvent.click(button);
      
      const replaceButton = screen.getByText('Replace CV');
      await userEvent.click(replaceButton);

      // Should show loading state
      expect(screen.getByText('Deleting CV...')).toBeInTheDocument();
      
      // Wait for completion
      await waitFor(() => {
        expect(screen.queryByText('Deleting CV...')).not.toBeInTheDocument();
      });
    });

    it('handles deletion API error gracefully', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'CV not found' }),
      } as Response);

      render(
        <ReUploadButton 
          analysisData={mockAnalysisData} 
          onUploadComplete={mockOnUploadComplete} 
        />
      );

      const button = screen.getByTestId('cv-management-action-reupload');
      await userEvent.click(button);
      
      const replaceButton = screen.getByText('Replace CV');
      await userEvent.click(replaceButton);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith({
          title: 'Deletion Failed',
          description: 'CV not found',
          variant: 'destructive',
        });
      });
    });
  });

  describe('File Upload', () => {
    beforeEach(() => {
      // Mock successful deletion
      mockedFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);
    });

    it('opens file picker after successful deletion', async () => {
      render(
        <ReUploadButton 
          analysisData={mockAnalysisData} 
          onUploadComplete={mockOnUploadComplete} 
        />
      );

      const button = screen.getByTestId('cv-management-action-reupload');
      await userEvent.click(button);
      
      const replaceButton = screen.getByText('Replace CV');
      await userEvent.click(replaceButton);

      await waitFor(() => {
        expect(document.createElement).toHaveBeenCalledWith('input');
        expect(mockFileInput.type).toBe('file');
        expect(mockFileInput.accept).toBe('.pdf,.docx,.txt');
        expect(mockFileInput.click).toHaveBeenCalled();
      });
    });

    it('validates file type', async () => {
      render(
        <ReUploadButton 
          analysisData={mockAnalysisData} 
          onUploadComplete={mockOnUploadComplete} 
        />
      );

      const button = screen.getByTestId('cv-management-action-reupload');
      await userEvent.click(button);
      
      const replaceButton = screen.getByText('Replace CV');
      await userEvent.click(replaceButton);

      // Wait for file picker setup
      await waitFor(() => {
        expect(mockFileInput.onchange).toBeDefined();
      });

      // Simulate invalid file selection
      const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      const event = { target: { files: [invalidFile] } };
      
      // This would normally trigger validation, but we need to mock the file type check
      mockFileInput.onchange?.(event as any);

      // File type validation should trigger error toast
      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith({
          title: 'Invalid File Type',
          description: 'Please select a PDF, DOCX, or TXT file',
          variant: 'destructive',
        });
      });
    });

    it('validates file size', async () => {
      render(
        <ReUploadButton 
          analysisData={mockAnalysisData} 
          onUploadComplete={mockOnUploadComplete} 
        />
      );

      const button = screen.getByTestId('cv-management-action-reupload');
      await userEvent.click(button);
      
      const replaceButton = screen.getByText('Replace CV');
      await userEvent.click(replaceButton);

      await waitFor(() => {
        expect(mockFileInput.onchange).toBeDefined();
      });

      // Simulate large file
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', { 
        type: 'application/pdf' 
      });
      const event = { target: { files: [largeFile] } };
      
      mockFileInput.onchange?.(event as any);

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith({
          title: 'File Too Large',
          description: 'File size must be less than 10MB',
          variant: 'destructive',
        });
      });
    });

    it('initiates upload for valid file', async () => {
      render(
        <ReUploadButton 
          analysisData={mockAnalysisData} 
          onUploadComplete={mockOnUploadComplete} 
        />
      );

      const button = screen.getByTestId('cv-management-action-reupload');
      await userEvent.click(button);
      
      const replaceButton = screen.getByText('Replace CV');
      await userEvent.click(replaceButton);

      await waitFor(() => {
        expect(mockFileInput.onchange).toBeDefined();
      });

      // Simulate valid file selection
      const validFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(validFile, 'size', { value: 1024 * 1024 }); // 1MB
      const event = { target: { files: [validFile] } };
      
      mockFileInput.onchange?.(event as any);

      await waitFor(() => {
        expect(mockXMLHttpRequest.open).toHaveBeenCalledWith('POST', '/api/cv/upload', true);
        expect(mockXMLHttpRequest.send).toHaveBeenCalled();
      });
    });

    it('shows upload progress', async () => {
      render(
        <ReUploadButton 
          analysisData={mockAnalysisData} 
          onUploadComplete={mockOnUploadComplete} 
        />
      );

      // Trigger upload flow
      const button = screen.getByTestId('cv-management-action-reupload');
      await userEvent.click(button);
      
      const replaceButton = screen.getByText('Replace CV');
      await userEvent.click(replaceButton);

      await waitFor(() => {
        expect(mockFileInput.onchange).toBeDefined();
      });

      const validFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(validFile, 'size', { value: 1024 });
      const event = { target: { files: [validFile] } };
      
      mockFileInput.onchange?.(event as any);

      // Simulate progress
      const progressEvent = { lengthComputable: true, loaded: 50, total: 100 };
      if (mockXMLHttpRequest.upload.onprogress) {
        mockXMLHttpRequest.upload.onprogress(progressEvent as any);
      }

      // Should show progress percentage
      await waitFor(() => {
        expect(screen.getByText('Uploading (50%)')).toBeInTheDocument();
      });
    });

    it('calls onUploadComplete after successful upload', async () => {
      render(
        <ReUploadButton 
          analysisData={mockAnalysisData} 
          onUploadComplete={mockOnUploadComplete} 
        />
      );

      // Complete upload flow
      const button = screen.getByTestId('cv-management-action-reupload');
      await userEvent.click(button);
      
      const replaceButton = screen.getByText('Replace CV');
      await userEvent.click(replaceButton);

      await waitFor(() => {
        expect(mockFileInput.onchange).toBeDefined();
      });

      const validFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(validFile, 'size', { value: 1024 });
      const event = { target: { files: [validFile] } };
      
      mockFileInput.onchange?.(event as any);

      // Simulate successful upload
      mockXMLHttpRequest.status = 200;
      mockXMLHttpRequest.responseText = JSON.stringify({ analysisId: 'new-analysis-123' });
      
      if (mockXMLHttpRequest.onload) {
        mockXMLHttpRequest.onload({} as any);
      }

      await waitFor(() => {
        expect(mockOnUploadComplete).toHaveBeenCalledWith('new-analysis-123');
        expect(toast).toHaveBeenCalledWith({
          title: 'Upload Successful',
          description: 'CV test.pdf uploaded and processed successfully!',
        });
      });
    });

    it('handles upload error gracefully', async () => {
      render(
        <ReUploadButton 
          analysisData={mockAnalysisData} 
          onUploadComplete={mockOnUploadComplete} 
        />
      );

      // Trigger upload
      const button = screen.getByTestId('cv-management-action-reupload');
      await userEvent.click(button);
      
      const replaceButton = screen.getByText('Replace CV');
      await userEvent.click(replaceButton);

      await waitFor(() => {
        expect(mockFileInput.onchange).toBeDefined();
      });

      const validFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(validFile, 'size', { value: 1024 });
      const event = { target: { files: [validFile] } };
      
      mockFileInput.onchange?.(event as any);

      // Simulate upload error
      if (mockXMLHttpRequest.onerror) {
        mockXMLHttpRequest.onerror({} as any);
      }

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith({
          title: 'Upload Failed',
          description: 'Network error occurred during upload',
          variant: 'destructive',
        });
      });
    });
  });

  describe('Loading States', () => {
    it('shows different button states during workflow', async () => {
      // Mock delayed responses
      let deleteResolve: (value: any) => void;
      const deletePromise = new Promise(resolve => { deleteResolve = resolve; });
      mockedFetch.mockReturnValue(deletePromise as any);

      render(
        <ReUploadButton 
          analysisData={mockAnalysisData} 
          onUploadComplete={mockOnUploadComplete} 
        />
      );

      const button = screen.getByTestId('cv-management-action-reupload');
      
      // Initial state
      expect(button).toHaveTextContent('Re-upload CV');
      expect(button).not.toBeDisabled();

      // Trigger deletion
      await userEvent.click(button);
      const replaceButton = screen.getByText('Replace CV');
      await userEvent.click(replaceButton);

      // Should show deleting state
      expect(screen.getByText('Deleting CV...')).toBeInTheDocument();
      
      // Complete deletion
      deleteResolve!({
        ok: true,
        json: async () => ({ success: true }),
      });

      await waitFor(() => {
        expect(screen.queryByText('Deleting CV...')).not.toBeInTheDocument();
      });
    });
  });
});