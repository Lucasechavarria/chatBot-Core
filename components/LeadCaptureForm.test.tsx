/**
 * @jest-environment jsdom
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import LeadCaptureForm from './LeadCaptureForm';
import { locales } from '../i18n/locales';

const mockProps = {
  onStartChat: jest.fn(),
  isLoading: false,
  title: locales.leadFormTitle['en'],
  subtitle: locales.leadFormSubtitle['en'],
  namePlaceholder: locales.namePlaceholder['en'],
  contactPrompt: locales.contactPrompt['en'],
  contactPlaceholders: {
    email: locales.emailPlaceholder['en'],
    whatsapp: locales.whatsappPlaceholder['en'],
    phone: locales.phonePlaceholder['en'],
    instagram: locales.instagramPlaceholder['en'],
    facebook: locales.facebookPlaceholder['en'],
    linkedin: locales.linkedinPlaceholder['en'],
    telegram: locales.telegramPlaceholder['en'],
  },
  buttonText: locales.startChatButton['en'],
  connectingText: locales.connectingButton['en'],
  changeButtonText: locales.changeButtonText['en'],
  errorMessages: {
    errorNameMissing: locales.errorNameMissing['en'],
    errorContactMethodMissing: locales.errorContactMethodMissing['en'],
    errorContactInfoMissing: locales.errorContactInfoMissing['en'],
    errorInvalidEmail: locales.errorInvalidEmail['en'],
  }
};

describe('LeadCaptureForm', () => {
  beforeEach(() => {
    // Clear mock calls before each test
    mockProps.onStartChat.mockClear();
  });

  it('renders correctly', () => {
    render(<LeadCaptureForm {...mockProps} />);
    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(mockProps.namePlaceholder)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start chat/i })).toBeInTheDocument();
  });
  
  it('shows error if name is missing', async () => {
    const user = userEvent.setup();
    render(<LeadCaptureForm {...mockProps} />);
    const submitButton = screen.getByRole('button', { name: /start chat/i });
    
    await user.click(submitButton);

    expect(screen.getByText(mockProps.errorMessages.errorNameMissing)).toBeInTheDocument();
    expect(mockProps.onStartChat).not.toHaveBeenCalled();
  });

  it('shows error if contact method is not selected', async () => {
    const user = userEvent.setup();
    render(<LeadCaptureForm {...mockProps} />);

    await user.type(screen.getByPlaceholderText(mockProps.namePlaceholder), 'John Doe');
    await user.click(screen.getByRole('button', { name: /start chat/i }));
    
    expect(screen.getByText(mockProps.errorMessages.errorContactMethodMissing)).toBeInTheDocument();
    expect(mockProps.onStartChat).not.toHaveBeenCalled();
  });

  it('shows error if contact info is missing', async () => {
    const user = userEvent.setup();
    render(<LeadCaptureForm {...mockProps} />);

    await user.type(screen.getByPlaceholderText(mockProps.namePlaceholder), 'John Doe');
    await user.click(screen.getByRole('button', { name: /select email/i }));
    await user.click(screen.getByRole('button', { name: /start chat/i }));

    expect(screen.getByText(mockProps.errorMessages.errorContactInfoMissing)).toBeInTheDocument();
    expect(mockProps.onStartChat).not.toHaveBeenCalled();
  });

  it('shows error for invalid email', async () => {
    const user = userEvent.setup();
    render(<LeadCaptureForm {...mockProps} />);

    await user.type(screen.getByPlaceholderText(mockProps.namePlaceholder), 'Jane Doe');
    await user.click(screen.getByRole('button', { name: /select email/i }));
    const emailInput = await screen.findByPlaceholderText(mockProps.contactPlaceholders.email);
    await user.type(emailInput, 'jane.doe@invalid');
    await user.click(screen.getByRole('button', { name: /start chat/i }));

    expect(screen.getByText(mockProps.errorMessages.errorInvalidEmail)).toBeInTheDocument();
    expect(mockProps.onStartChat).not.toHaveBeenCalled();
  });
  
  it('submits correctly with valid data', async () => {
    const user = userEvent.setup();
    render(<LeadCaptureForm {...mockProps} />);

    await user.type(screen.getByPlaceholderText(mockProps.namePlaceholder), 'Jane Doe');
    await user.click(screen.getByRole('button', { name: /select whatsapp/i }));
    const contactInput = await screen.findByPlaceholderText(mockProps.contactPlaceholders.whatsapp);
    await user.type(contactInput, '1234567890');
    await user.click(screen.getByRole('button', { name: /start chat/i }));

    expect(mockProps.onStartChat).toHaveBeenCalledTimes(1);
    expect(mockProps.onStartChat).toHaveBeenCalledWith({
      name: 'Jane Doe',
      contactMethod: 'whatsapp',
      contactInfo: '1234567890'
    });
    expect(screen.queryByText(mockProps.errorMessages.errorContactInfoMissing)).not.toBeInTheDocument();
  });

  it('disables form elements when loading', () => {
    render(<LeadCaptureForm {...mockProps} isLoading={true} />);
    expect(screen.getByPlaceholderText(mockProps.namePlaceholder)).toBeDisabled();
    expect(screen.getByRole('button', { name: /connecting/i })).toBeDisabled();
  });
});