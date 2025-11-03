/**
 * Post Editor Tests - F4
 * Tests draft→publish→redirect flow
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostEditor } from '../PostEditor';
import * as usePostsHook from '@/hooks/usePosts';
import * as useRouterHook from 'next/navigation';
import confetti from 'canvas-confetti';

// Mock hooks
vi.mock('@/hooks/usePosts', () => ({
  useCreatePost: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/hooks/useDraftAutosave', () => ({
  useDraftAutosave: () => ({
    loadDraft: vi.fn(() => null),
    clearDraft: vi.fn(),
    saveDraft: vi.fn(),
  }),
}));

describe('PostEditor', () => {
  const mockPush = vi.fn();
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

    // Mock useRouter
    vi.mocked(useRouterHook.useRouter).mockReturnValue({
      push: mockPush,
    } as never);

    // Mock useCreatePost - return hook-like object that calls onSuccess
    vi.mocked(usePostsHook.useCreatePost).mockImplementation((options: any) => {
      return {
        mutateAsync: async (data: any) => {
          const result = await mockMutateAsync(data);
          // Call onSuccess if provided
          if (options?.onSuccess) {
            options.onSuccess(result);
          }
          return result;
        },
        isPending: false,
      } as never;
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders all form fields', () => {
    renderWithClient(<PostEditor />);

    expect(screen.getByLabelText(/title \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/visibility/i)).toBeInTheDocument();
    expect(screen.getByText(/save draft/i)).toBeInTheDocument();
    expect(screen.getByText(/publish now/i)).toBeInTheDocument();
  });

  it('validates required fields on publish', async () => {
    const user = userEvent.setup();
    renderWithClient(<PostEditor />);

    const publishButton = screen.getByText(/publish now/i);
    await user.click(publishButton);

    // Should show validation errors
    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/content is required/i)).toBeInTheDocument();

    // Should not call API
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('validates price for PPV posts', async () => {
    const user = userEvent.setup();
    renderWithClient(<PostEditor />);

    // Select PPV visibility
    const visibilitySelect = screen.getByLabelText(/visibility/i);
    await user.click(visibilitySelect);
    await user.click(screen.getByText(/pay-per-view/i));

    // Fill title and content
    await user.type(screen.getByLabelText(/title \*/i), 'Test Post');
    await user.type(screen.getByLabelText(/content \*/i), 'Test content');

    // Try to publish without price
    await user.click(screen.getByText(/publish now/i));

    // Should show price validation error
    expect(await screen.findByText(/price must be at least/i)).toBeInTheDocument();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('successfully publishes post with confetti and redirect', async () => {
    const user = userEvent.setup();

    // Mock successful publish
    mockMutateAsync.mockResolvedValue({
      id: 'post-123',
      title: 'Test Post',
      content: 'Test content',
      status: 'published',
    });

    renderWithClient(<PostEditor />);

    // Fill in required fields using findByLabelText
    const titleInput = await screen.findByLabelText(/title \*/i);
    await user.type(titleInput, 'Test Post');

    const contentInput = await screen.findByLabelText(/content \*/i);
    await user.type(contentInput, 'Test content here');

    // Trigger blur to validate fields
    await user.tab();

    // Click publish
    const publishButton = await screen.findByText(/publish now/i);
    await user.click(publishButton);

    // Wait for API call
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Post',
          content: 'Test content here',
        })
      );
    });

    // Check confetti was called
    await waitFor(() => {
      expect(confetti).toHaveBeenCalled();
    });

    // Check redirect
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/creator/posts');
    });
  });

  it('adds and removes tags', async () => {
    const user = userEvent.setup();
    renderWithClient(<PostEditor />);

    const tagInput = screen.getByPlaceholderText(/add a tag/i);
    const addButton = screen.getByRole('button', { name: /add/i });

    // Add tag
    await user.type(tagInput, 'test-tag');
    await user.click(addButton);

    // Should show tag badge
    expect(screen.getByText('test-tag')).toBeInTheDocument();

    // Remove tag
    const removeButton = screen.getByRole('button', { name: '', hidden: true });
    await user.click(removeButton);

    // Tag should be removed
    await waitFor(() => {
      expect(screen.queryByText('test-tag')).not.toBeInTheDocument();
    });
  });

  it('shows loading state while publishing', async () => {
    const user = userEvent.setup();

    // Mock slow publish
    mockMutateAsync.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    // Mock isPending
    vi.mocked(usePostsHook.useCreatePost).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    } as never);

    renderWithClient(<PostEditor />);

    // Should show loading state
    expect(screen.getByText(/publishing/i)).toBeInTheDocument();
  });

  it('toggles NSFW checkbox', async () => {
    const user = userEvent.setup();
    renderWithClient(<PostEditor />);

    const nsfwCheckbox = screen.getByLabelText(/nsfw/i);

    // Initially unchecked
    expect(nsfwCheckbox).not.toBeChecked();

    // Click to check
    await user.click(nsfwCheckbox);
    expect(nsfwCheckbox).toBeChecked();

    // Click to uncheck
    await user.click(nsfwCheckbox);
    expect(nsfwCheckbox).not.toBeChecked();
  });
});
