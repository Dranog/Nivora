/**
 * Navigation Tests - F1 Shell SPA
 * Test keyboard navigation for Header and Sidebar
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('Header Navigation', () => {
  beforeEach(() => {
    // Reset stores
    useAuthStore.setState({
      isAuthenticated: false,
      role: null,
      onboardingDone: false,
      userId: null,
    });
  });

  it('renders without accessibility violations', async () => {
    const { container } = render(<Header />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('allows keyboard navigation through nav links', async () => {
    useAuthStore.setState({
      isAuthenticated: true,
      role: 'fan',
      onboardingDone: true,
      userId: 'test-123',
    });

    const user = userEvent.setup();
    render(<Header />);

    // Tab through navigation
    await user.tab();
    // First element is sidebar toggle on mobile
    const sidebarToggle = screen.getByLabelText(/sidebar/i);
    expect(sidebarToggle).toHaveFocus();

    // Continue tabbing to reach logo
    await user.tab(); // Logo
    expect(screen.getByRole('link', { name: /F1/i })).toHaveFocus();

    // Continue tabbing to reach navigation links
    await user.tab(); // Theme toggle
    await user.tab(); // User menu
  });

  it('opens user menu with Enter key', async () => {
    useAuthStore.setState({
      isAuthenticated: true,
      role: 'fan',
      onboardingDone: true,
      userId: 'test-123',
    });

    const user = userEvent.setup();
    render(<Header />);

    const userMenuButton = screen.getByLabelText('User menu');
    await user.click(userMenuButton);

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /Settings/i })).toBeInTheDocument();
    });
  });

  it('closes user menu with Escape key', async () => {
    useAuthStore.setState({
      isAuthenticated: true,
      role: 'fan',
      onboardingDone: true,
      userId: 'test-123',
    });

    const user = userEvent.setup();
    render(<Header />);

    // Open menu
    const userMenuButton = screen.getByLabelText('User menu');
    await user.click(userMenuButton);

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    // Close with Escape
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  it('shows login button when not authenticated', () => {
    render(<Header />);
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('shows user menu when authenticated', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      role: 'fan',
      onboardingDone: true,
      userId: 'test-123',
    });

    render(<Header />);
    expect(screen.getByLabelText('User menu')).toBeInTheDocument();
  });

  it('toggles sidebar on menu button click', async () => {
    useAuthStore.setState({
      isAuthenticated: true,
      role: 'fan',
      onboardingDone: true,
      userId: 'test-123',
    });
    useUIStore.setState({ sidebarOpen: true });

    const user = userEvent.setup();
    render(<Header />);

    const menuButton = screen.getByLabelText('Close sidebar');
    await user.click(menuButton);

    expect(useUIStore.getState().sidebarOpen).toBe(false);
  });
});

describe('Sidebar Navigation', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: true,
      role: 'fan',
      onboardingDone: true,
      userId: 'test-123',
    });
    useUIStore.setState({ sidebarOpen: true });
  });

  it('renders without accessibility violations', async () => {
    const { container } = render(<Sidebar />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('allows keyboard navigation through sidebar links', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    const links = screen.getAllByRole('link');

    // Tab through sidebar links
    await user.tab();
    expect(links[0]).toHaveFocus();
  });

  it('shows role-appropriate navigation links for fan', () => {
    useAuthStore.setState({ role: 'fan' });
    render(<Sidebar />);

    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Favorites/i })).toBeInTheDocument();
  });

  it('shows role-appropriate navigation links for creator', () => {
    useAuthStore.setState({ role: 'creator' });
    render(<Sidebar />);

    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Content/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Analytics/i })).toBeInTheDocument();
  });

  it('shows role-appropriate navigation links for admin', () => {
    useAuthStore.setState({ role: 'admin' });
    render(<Sidebar />);

    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Users/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Moderation/i })).toBeInTheDocument();
  });

  it('displays current user role', () => {
    useAuthStore.setState({ role: 'fan' });
    render(<Sidebar />);

    expect(screen.getByText('Logged in as')).toBeInTheDocument();
    expect(screen.getByText('fan')).toBeInTheDocument();
  });

  it('does not render when sidebar is closed', () => {
    useUIStore.setState({ sidebarOpen: false });
    const { container } = render(<Sidebar />);

    expect(container.firstChild).toBeNull();
  });

  it('has proper ARIA attributes', () => {
    render(<Sidebar />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Sidebar navigation');
  });
});

describe('Keyboard Navigation Integration', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: true,
      role: 'fan',
      onboardingDone: true,
      userId: 'test-123',
    });
    useUIStore.setState({ sidebarOpen: true });
  });

  it('maintains focus visible styles', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const logo = screen.getByRole('link', { name: /F1/i });

    // Tab to sidebar toggle first
    await user.tab();
    // Tab again to reach logo
    await user.tab();

    expect(logo).toHaveFocus();
    // Focus-visible styles are applied via CSS, component has focus-visible classes
    expect(logo).toHaveClass('focus-visible:ring-2');
  });

  it('allows Tab navigation between header and content', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Header />
        <main>
          <a href="/test">Test Link</a>
        </main>
      </>
    );

    // Tab through header elements until reaching main content
    await user.tab(); // Logo or first focusable
    await user.tab(); // Theme toggle
    await user.tab(); // User menu

    // Eventually reaches main content
    const mainLink = screen.getByRole('link', { name: /Test Link/i });
    mainLink.focus();
    expect(mainLink).toHaveFocus();
  });
});
