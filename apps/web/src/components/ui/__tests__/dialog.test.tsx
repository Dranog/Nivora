/**
 * Dialog Component Tests - F0 Foundation
 * Tests modal behavior, focus trap, and accessibility
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

describe('Dialog', () => {
  describe('Rendering', () => {
    it('renders trigger button', () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
        </Dialog>
      );
      expect(screen.getByText('Open Dialog')).toBeInTheDocument();
    });

    it('does not render content initially', () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog content</DialogDescription>
          </DialogContent>
        </Dialog>
      );

      // Content should not be in the document initially
      expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
    });

    it('renders content when opened', async () => {
      const user = userEvent.setup();
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByText('Open'));

      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
        expect(screen.getByText('Dialog Description')).toBeInTheDocument();
      });
    });
  });

  describe('Controlled state', () => {
    it('can be controlled with open prop', () => {
      const { rerender } = render(
        <Dialog open={false}>
          <DialogContent>
            <DialogTitle>Controlled Dialog</DialogTitle>
            <DialogDescription>This is a controlled dialog</DialogDescription>
          </DialogContent>
        </Dialog>
      );

      expect(screen.queryByText('Controlled Dialog')).not.toBeInTheDocument();

      rerender(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Controlled Dialog</DialogTitle>
            <DialogDescription>This is a controlled dialog</DialogDescription>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText('Controlled Dialog')).toBeInTheDocument();
    });

    it('calls onOpenChange when closed', async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Dialog open={true} onOpenChange={handleOpenChange}>
          <DialogContent>
            <DialogTitle>Dialog</DialogTitle>
            <DialogDescription>Dialog description</DialogDescription>
          </DialogContent>
        </Dialog>
      );

      // Click close button
      const closeButton = screen.getByLabelText('Close dialog');
      await user.click(closeButton);

      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Close behavior', () => {
    it('shows close button', async () => {
      const user = userEvent.setup();
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog</DialogTitle>
            <DialogDescription>Dialog content</DialogDescription>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByText('Open'));

      await waitFor(() => {
        expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
      });
    });

    it('closes when close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog content</DialogDescription>
          </DialogContent>
        </Dialog>
      );

      // Open dialog
      await user.click(screen.getByText('Open'));
      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      });

      // Close dialog
      await user.click(screen.getByLabelText('Close dialog'));

      await waitFor(() => {
        expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
      });
    });

    it('closes when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog content</DialogDescription>
          </DialogContent>
        </Dialog>
      );

      // Open dialog
      await user.click(screen.getByText('Open'));
      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      });

      // Press Escape
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
      });
    });
  });

  describe('Dialog sections', () => {
    it('renders header, content, and footer', async () => {
      const user = userEvent.setup();
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Description</DialogDescription>
            </DialogHeader>
            <div>Main content</div>
            <DialogFooter>
              <Button>Action</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByText('Open'));

      await waitFor(() => {
        expect(screen.getByText('Title')).toBeInTheDocument();
        expect(screen.getByText('Description')).toBeInTheDocument();
        expect(screen.getByText('Main content')).toBeInTheDocument();
        expect(screen.getByText('Action')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations when closed', async () => {
      const { container } = render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
        </Dialog>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations when open', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Accessible Dialog</DialogTitle>
            <DialogDescription>This dialog is accessible</DialogDescription>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByText('Open'));

      await waitFor(async () => {
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });

    it('has proper ARIA attributes', async () => {
      const user = userEvent.setup();
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByText('Open'));

      await waitFor(() => {
        const dialog = screen.getByRole('dialog', { hidden: true });
        expect(dialog).toBeInTheDocument();
      });
    });

    it('focuses first focusable element on open', async () => {
      const user = userEvent.setup();
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog</DialogTitle>
            <DialogDescription>Dialog with buttons</DialogDescription>
            <Button>First Button</Button>
            <Button>Second Button</Button>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByText('Open'));

      await waitFor(() => {
        // First focusable element gets focus by default
        expect(screen.getByText('First Button')).toHaveFocus();
      });
    });
  });
});
