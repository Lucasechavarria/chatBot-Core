
/**
 * @jest-environment jsdom
 */
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import App from './App';
import { useChat } from './hooks/useChat';
import { locales } from './i18n/locales';

// Mock the custom hook
jest.mock('./hooks/useChat');

const mockedUseChat = useChat as jest.Mock;

describe('App component rendering based on useChat state', () => {

  const mockSelectLanguage = jest.fn();
  const mockStartChat = jest.fn();
  const mockSendMessage = jest.fn();
  const mockClearToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders LanguageSelector when language is null', () => {
    mockedUseChat.mockReturnValue({
      state: { language: null, user: null, messages: [], isLoading: false, flowState: 'chatting', toastMessage: '', ariaLiveAnnouncement: '' },
      selectLanguage: mockSelectLanguage,
    });

    render(<App />);

    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Español' })).toBeInTheDocument();
  });
  
  test('renders LeadCaptureForm when language is selected but user is null', async () => {
    mockedUseChat.mockReturnValue({
      state: { language: 'en', user: null, messages: [], isLoading: false, flowState: 'chatting', toastMessage: '', ariaLiveAnnouncement: '' },
      selectLanguage: mockSelectLanguage,
      startChat: mockStartChat,
    });

    render(<App />);

    expect(screen.getByText(locales.leadFormTitle['en'])).toBeInTheDocument();
    
    // Simulate form submission
    await userEvent.type(screen.getByPlaceholderText(/your name/i), 'Test User');
    await userEvent.click(screen.getByRole('button', {name: /select email/i}));
    await userEvent.type(await screen.findByPlaceholderText(/your email address/i), 'test@test.com');
    await userEvent.click(screen.getByRole('button', { name: /start chat/i}));

    expect(mockStartChat).toHaveBeenCalledWith({
        name: 'Test User',
        contactMethod: 'email',
        contactInfo: 'test@test.com',
    });
  });

  test('renders ChatInterface when language and user are set', async () => {
    mockedUseChat.mockReturnValue({
      state: {
        language: 'es',
        user: { name: 'Juan', contactMethod: 'email', contactInfo: 'juan@test.com' },
        messages: [{ id: '1', sender: 'bot', text: 'Hola Juan', timestamp: Date.now() }],
        isLoading: false,
        flowState: 'chatting',
        toastMessage: '',
        ariaLiveAnnouncement: ''
      },
      sendMessage: mockSendMessage,
    });
    
    render(<App />);

    expect(screen.getByText('Hola Juan')).toBeInTheDocument();
    const input = screen.getByPlaceholderText(locales.chatInputPlaceholder['es']);
    await userEvent.type(input, 'Un mensaje');
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));
    
    expect(mockSendMessage).toHaveBeenCalledWith('Un mensaje');
  });

  test('renders Toast when toastMessage is set', () => {
     mockedUseChat.mockReturnValue({
      state: {
        language: 'en',
        user: { name: 'Test', contactMethod: 'email', contactInfo: 'test@test.com' },
        messages: [],
        isLoading: false,
        flowState: 'chatting',
        toastMessage: 'This is a test toast.',
        ariaLiveAnnouncement: ''
      },
      clearToast: mockClearToast,
    });

    render(<App />);
    expect(screen.getByText('This is a test toast.')).toBeInTheDocument();
  });

});
