/**
 * Tabs Component Tests - F0 Foundation
 * Tests keyboard navigation, tab selection, and accessibility
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

describe('Tabs', () => {
  describe('Rendering', () => {
    it('renders tabs list', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument();
    });

    it('renders tab content', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    });

    it('shows only active tab content', () => {
      render(
        <Tabs defaultValue="tab2">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });
  });

  describe('Tab Selection', () => {
    it('changes active tab on click', async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();

      await user.click(screen.getByRole('tab', { name: 'Tab 2' }));

      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('updates aria-selected on tab change', async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });

      expect(tab1).toHaveAttribute('aria-selected', 'true');
      expect(tab2).toHaveAttribute('aria-selected', 'false');

      await user.click(tab2);

      expect(tab1).toHaveAttribute('aria-selected', 'false');
      expect(tab2).toHaveAttribute('aria-selected', 'true');
    });

    it('shows multiple tabs with different content', async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">First panel</TabsContent>
          <TabsContent value="tab2">Second panel</TabsContent>
          <TabsContent value="tab3">Third panel</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('First panel')).toBeInTheDocument();

      await user.click(screen.getByRole('tab', { name: 'Tab 3' }));
      expect(screen.getByText('Third panel')).toBeInTheDocument();
      expect(screen.queryByText('First panel')).not.toBeInTheDocument();
    });
  });

  describe('Controlled State', () => {
    it('can be controlled with value prop', () => {
      const { rerender } = render(
        <Tabs value="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();

      rerender(
        <Tabs value="tab2">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('calls onValueChange when tab changes', async () => {
      const handleValueChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Tabs defaultValue="tab1" onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      await user.click(screen.getByRole('tab', { name: 'Tab 2' }));

      expect(handleValueChange).toHaveBeenCalledWith('tab2');
      expect(handleValueChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates tabs with Arrow Right', async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      );

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });

      tab1.focus();
      expect(tab1).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(tab2).toHaveFocus();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('navigates tabs with Arrow Left', async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="tab2">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      );

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });

      tab2.focus();
      expect(tab2).toHaveFocus();

      await user.keyboard('{ArrowLeft}');
      expect(tab1).toHaveFocus();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('wraps to first tab when pressing Arrow Right on last tab', async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="tab3">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      );

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const tab3 = screen.getByRole('tab', { name: 'Tab 3' });

      tab3.focus();
      await user.keyboard('{ArrowRight}');
      expect(tab1).toHaveFocus();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('wraps to last tab when pressing Arrow Left on first tab', async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      );

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const tab3 = screen.getByRole('tab', { name: 'Tab 3' });

      tab1.focus();
      await user.keyboard('{ArrowLeft}');
      expect(tab3).toHaveFocus();
      expect(screen.getByText('Content 3')).toBeInTheDocument();
    });

    it('navigates to first tab with Home key', async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="tab3">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      );

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const tab3 = screen.getByRole('tab', { name: 'Tab 3' });

      tab3.focus();
      await user.keyboard('{Home}');
      expect(tab1).toHaveFocus();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('navigates to last tab with End key', async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      );

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const tab3 = screen.getByRole('tab', { name: 'Tab 3' });

      tab1.focus();
      await user.keyboard('{End}');
      expect(tab3).toHaveFocus();
      expect(screen.getByText('Content 3')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <Tabs defaultValue="tab1">
          <TabsList aria-label="Main tabs">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper ARIA roles', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );

      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(2);
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('has aria-selected attribute on tabs', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });

      expect(tab1).toHaveAttribute('aria-selected', 'true');
      expect(tab2).toHaveAttribute('aria-selected', 'false');
    });

    it('has aria-controls linking tabs to panels', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );

      const tab = screen.getByRole('tab', { name: 'Tab 1' });
      const panel = screen.getByRole('tabpanel');

      const controlsId = tab.getAttribute('aria-controls');
      expect(controlsId).toBeTruthy();
      expect(panel).toHaveAttribute('id', controlsId);
    });

    it('can be focused with Tab key', async () => {
      const user = userEvent.setup();
      render(
        <>
          <button>Before</button>
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            </TabsList>
          </Tabs>
          <button>After</button>
        </>
      );

      const beforeButton = screen.getByText('Before');
      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });

      beforeButton.focus();
      await user.tab();

      expect(tab1).toHaveFocus();
    });
  });

  describe('Custom className', () => {
    it('merges custom className on TabsList', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList className="custom-tablist">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveClass('custom-tablist');
      expect(tablist).toHaveClass('inline-flex'); // default class
    });

    it('merges custom className on TabsTrigger', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" className="custom-trigger">
              Tab 1
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const tab = screen.getByRole('tab', { name: 'Tab 1' });
      expect(tab).toHaveClass('custom-trigger');
      expect(tab).toHaveClass('inline-flex'); // default class
    });

    it('merges custom className on TabsContent', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="custom-content">
            Content 1
          </TabsContent>
        </Tabs>
      );

      const panel = screen.getByRole('tabpanel');
      expect(panel).toHaveClass('custom-content');
    });
  });
});
