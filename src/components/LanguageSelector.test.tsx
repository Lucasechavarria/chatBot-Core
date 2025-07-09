// src/components/LanguageSelector.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSelector from './LanguageSelector';
import { describe, it, expect, vi } from 'vitest';
import { Language } from '../types';

describe('LanguageSelector', () => {
  it('renders language buttons', () => {
    render(<LanguageSelector onSelectLanguage={() => {}} />);
    expect(screen.getByRole('button', { name: /english/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /español/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /português/i })).toBeInTheDocument();
  });

  it('calls onSelectLanguage with correct language when English button is clicked', () => {
    const handleSelectLanguage = vi.fn();
    render(<LanguageSelector onSelectLanguage={handleSelectLanguage} />);
    fireEvent.click(screen.getByRole('button', { name: /english/i }));
    expect(handleSelectLanguage).toHaveBeenCalledWith('en');
  });

  it('calls onSelectLanguage with correct language when Español button is clicked', () => {
    const handleSelectLanguage = vi.fn();
    render(<LanguageSelector onSelectLanguage={handleSelectLanguage} />);
    fireEvent.click(screen.getByRole('button', { name: /español/i }));
    expect(handleSelectLanguage).toHaveBeenCalledWith('es');
  });

  it('calls onSelectLanguage with correct language when Português button is clicked', () => {
    const handleSelectLanguage = vi.fn();
    render(<LanguageSelector onSelectLanguage={handleSelectLanguage} />);
    fireEvent.click(screen.getByRole('button', { name: /português/i }));
    expect(handleSelectLanguage).toHaveBeenCalledWith('pt');
  });

  it('applies correct aria-labels to buttons', () => {
    render(<LanguageSelector onSelectLanguage={() => {}} />);
    expect(screen.getByRole('button', { name: /english/i })).toHaveAttribute('aria-label', 'Select English language');
    expect(screen.getByRole('button', { name: /español/i })).toHaveAttribute('aria-label', 'Seleccionar idioma Español');
    expect(screen.getByRole('button', { name: /português/i })).toHaveAttribute('aria-label', 'Selecionar idioma Português');
  });
});
