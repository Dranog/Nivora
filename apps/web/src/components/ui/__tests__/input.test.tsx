/**
 * Input Component Tests - F0 Foundation
 * Tests input types, states, and accessibility
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Input } from '@/components/ui/input';

describe('Input', () => {
  describe('Rendering', () => {
    it('renders input element', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter text..." />);
      expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
    });

    it('renders different input types', () => {
      const { rerender } = render(<Input type="email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

      rerender(<Input type="password" />);
      const passwordInput = document.querySelector('input[type="password"]');
      expect(passwordInput).toBeInTheDocument();

      rerender(<Input type="number" />);
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('handles disabled state', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:cursor-not-allowed');
    });

    it('handles error state', () => {
      render(<Input error />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-destructive');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('handles readonly state', () => {
      render(<Input readOnly value="Read only" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });
  });

  describe('Value and onChange', () => {
    it('renders with initial value', () => {
      render(<Input value="Initial value" onChange={() => {}} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('Initial value');
    });

    it('calls onChange when typing', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello');

      expect(handleChange).toHaveBeenCalled();
      expect(handleChange).toHaveBeenCalledTimes(5); // once per character
    });

    it('updates value on user input', async () => {
      const user = userEvent.setup();
      render(<Input />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.type(input, 'Test input');

      expect(input.value).toBe('Test input');
    });
  });

  describe('Focus', () => {
    it('can be focused', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      input.focus();
      expect(input).toHaveFocus();
    });

    it('has focus-visible styles', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus-visible:outline-none');
      expect(input).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Input aria-label="Text input" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('supports aria-label', () => {
      render(<Input aria-label="Username" />);
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(
        <>
          <Input aria-describedby="help-text" />
          <div id="help-text">Enter your username</div>
        </>
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('sets aria-invalid when error prop is true', () => {
      render(<Input error />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Keyboard navigation', () => {
    it('handles Tab key', async () => {
      const user = userEvent.setup();
      render(
        <>
          <Input data-testid="input1" />
          <Input data-testid="input2" />
        </>
      );

      const input1 = screen.getByTestId('input1');
      const input2 = screen.getByTestId('input2');

      input1.focus();
      expect(input1).toHaveFocus();

      await user.tab();
      expect(input2).toHaveFocus();
    });

    it('handles Shift+Tab for reverse navigation', async () => {
      const user = userEvent.setup();
      render(
        <>
          <Input data-testid="input1" />
          <Input data-testid="input2" />
        </>
      );

      const input1 = screen.getByTestId('input1');
      const input2 = screen.getByTestId('input2');

      input2.focus();
      expect(input2).toHaveFocus();

      await user.tab({ shift: true });
      expect(input1).toHaveFocus();
    });
  });

  describe('Custom className', () => {
    it('merges custom className', () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
      expect(input).toHaveClass('rounded-md'); // default class still there
    });
  });
});
