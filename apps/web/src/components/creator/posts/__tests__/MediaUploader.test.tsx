/**
 * Media Uploader Tests - F4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MediaUploader } from '../MediaUploader';
import * as useMediaHook from '@/hooks/useMedia';

// Mock useUploadMedia hook
vi.mock('@/hooks/useMedia', () => ({
  useUploadMedia: vi.fn(),
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock AbortController
global.AbortController = class AbortController {
  signal = { aborted: false };
  abort() {
    this.signal.aborted = true;
  }
} as any;

describe('MediaUploader', () => {
  const mockOnUploadComplete = vi.fn();
  const mockOnUploadStart = vi.fn();
  const mockMutateAsync = vi.fn();
  let queryClient: QueryClient;

  const renderWithClient = (ui: React.ReactElement) => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers();

    // Default mock implementation
    vi.mocked(useMediaHook.useUploadMedia).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as never);
  });

  afterEach(() => {
    localStorage.clear();
    if (queryClient) {
      queryClient.clear();
    }
    vi.useRealTimers();
  });

  it('renders upload area initially', () => {
    renderWithClient(<MediaUploader />);

    expect(screen.getByText(/click to upload/i)).toBeInTheDocument();
    expect(screen.getByText(/maximum file size: 50mb/i)).toBeInTheDocument();
  });

  it('shows preview after file selection', async () => {
    vi.useRealTimers(); // Use real timers for this async test

    // Mock successful upload
    mockMutateAsync.mockResolvedValue({
      media: {
        id: 'media-123',
        url: 'https://example.com/image.jpg',
        type: 'image',
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        userId: 'user-123',
        createdAt: new Date().toISOString(),
      },
    });

    const { container } = renderWithClient(
      <MediaUploader
        onUploadComplete={mockOnUploadComplete}
        onUploadStart={mockOnUploadStart}
      />
    );

    // Create a mock file
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    // Find input
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    // Trigger change event
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    input.dispatchEvent(new Event('change', { bubbles: true }));

    // Check upload started
    expect(mockOnUploadStart).toHaveBeenCalled();

    // Wait for upload mutation to be called
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({ file });
    }, { timeout: 3000 });

    // Wait for callback
    await waitFor(() => {
      expect(mockOnUploadComplete).toHaveBeenCalledWith(
        'media-123',
        'https://example.com/image.jpg'
      );
    }, { timeout: 3000 });

    vi.useFakeTimers(); // Restore fake timers for other tests
  });

  it('shows error for invalid file format', () => {
    const { container } = renderWithClient(<MediaUploader />);

    // Create invalid file (.exe)
    const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    // Manually trigger change event
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    input.dispatchEvent(new Event('change', { bubbles: true }));

    // Upload should not be called due to validation
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('shows error for file too large', () => {
    const { container } = renderWithClient(<MediaUploader />);

    // Create file larger than 50MB
    const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    // Manually trigger change event
    Object.defineProperty(input, 'files', {
      value: [largeFile],
      writable: false,
    });

    input.dispatchEvent(new Event('change', { bubbles: true }));

    // Upload should not be called due to validation
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('allows removing uploaded media', async () => {
    vi.useRealTimers(); // Use real timers
    const user = userEvent.setup();

    // Use data URL which will match isImage check
    renderWithClient(
      <MediaUploader currentMediaUrl="data:image/jpeg;base64,test" />
    );

    // Should show preview - img with alt="Upload preview"
    const preview = await screen.findByAltText(/upload preview/i, {}, { timeout: 2000 });
    expect(preview).toBeInTheDocument();

    // Find and click remove button (the X button)
    const removeButtons = screen.getAllByRole('button');
    const removeButton = removeButtons.find(btn => btn.querySelector('svg.lucide-x'));
    expect(removeButton).toBeInTheDocument();

    await user.click(removeButton!);

    // Preview should be gone - use waitFor
    await waitFor(() => {
      expect(screen.queryByAltText(/upload preview/i)).not.toBeInTheDocument();
    }, { timeout: 2000 });

    vi.useFakeTimers(); // Restore fake timers
  });

  it('is disabled when disabled prop is true', () => {
    renderWithClient(<MediaUploader disabled />);

    const uploadArea = screen.getByText(/click to upload/i).closest('div');
    expect(uploadArea).toHaveClass('opacity-50', 'cursor-not-allowed');
  });
});
