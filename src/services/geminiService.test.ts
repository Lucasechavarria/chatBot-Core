// src/services/geminiService.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { geminiService } from './geminiService';
import { GoogleGenAI, Chat } from '@google/genai';
import { getSystemInstruction } from '../constants';
import { locales } from '../i18n/locales';
import { Language } from '../types';

// Mock @google/genai
vi.mock('@google/genai', () => {
  const mockChatInstance = {
    sendMessage: vi.fn(),
  };
  const mockGenAIInstance = {
    chats: {
      create: vi.fn(() => mockChatInstance),
    },
  };
  return {
    GoogleGenAI: vi.fn(() => mockGenAIInstance),
    Chat: vi.fn(() => mockChatInstance), // Mock Chat class if needed directly
  };
});

// Mock constants and locales
vi.mock('../constants', () => ({
  getSystemInstruction: vi.fn((lang: Language, name: string) => `Mocked instruction for ${lang} with ${name}`),
}));

vi.mock('../i18n/locales', () => ({
  locales: {
    geminiConnectionError: {
      en: 'Mocked connection error EN',
      es: 'Mocked connection error ES',
      pt: 'Mocked connection error PT',
    },
  },
}));

describe('geminiService', () => {
  let mockCreateChat: any;
  let mockSendMessage: any;

  beforeEach(() => {
    // Get the mocked instances
    const genAI = new GoogleGenAI({apiKey: 'test-key'}); // API key doesn't matter due to mock
    mockCreateChat = genAI.chats.create;
    // To get the sendMessage mock, we need to call create once to get the chat instance
    const chat = genAI.chats.create({ model: '', config: {}, history: [] });
    mockSendMessage = chat.sendMessage;

    // Set document language for testing getGeminiConnectionError
    Object.defineProperty(document, 'documentElement', {
        value: { lang: 'en' },
        writable: true,
        configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    // @ts-ignore
    delete document.documentElement; // Clean up document mock
  });

  describe('startChat', () => {
    it('should create a chat session with the correct model and system instruction', () => {
      const history: any[] = [];
      const lang: Language = 'es';
      const name = 'TestUser';

      geminiService.startChat(history, lang, name);

      expect(getSystemInstruction).toHaveBeenCalledWith(lang, name);
      expect(mockCreateChat).toHaveBeenCalledWith({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: `Mocked instruction for es with TestUser`,
        },
        history: history,
      });
    });
  });

  describe('sendMessage', () => {
    it('should send a message and return the response text on success', async () => {
      // Use the globally mocked sendMessage function for the chat session
      const mockChatSession = { sendMessage: mockSendMessage } as unknown as Chat;
      const message = 'Hello Gemini';
      const mockResponse = { text: 'Hello User!' };

      (mockSendMessage as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const response = await geminiService.sendMessage(mockChatSession, message);

      expect(mockSendMessage).toHaveBeenCalledWith({ message });
      expect(response).toBe('Hello User!');
    });

    it('should return a localized error message on API failure', async () => {
      const mockChatSession = { sendMessage: mockSendMessage } as unknown as Chat;
      const message = 'This will fail';

      (mockSendMessage as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API Error'));

      // Test for English error
      document.documentElement.lang = 'en';
      let response = await geminiService.sendMessage(mockChatSession, message);
      expect(response).toBe(locales.geminiConnectionError.en);
      expect(mockSendMessage).toHaveBeenCalledWith({ message });

      // Test for Spanish error
      document.documentElement.lang = 'es';
      response = await geminiService.sendMessage(mockChatSession, message);
      expect(response).toBe(locales.geminiConnectionError.es);

      // Test for Portuguese error
      document.documentElement.lang = 'pt';
      response = await geminiService.sendMessage(mockChatSession, message);
      expect(response).toBe(locales.geminiConnectionError.pt);
    });

     it('should default to English error message if document language is not set', async () => {
      const mockChatSession = { sendMessage: mockSendMessage } as unknown as Chat;
      const message = 'This will also fail';
      (mockSendMessage as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API Error'));

      // @ts-ignore
      delete document.documentElement.lang; // Simulate lang not being set
      // Or set to an unsupported language
      // Object.defineProperty(document.documentElement, 'lang', { value: 'fr', writable:true });


      const response = await geminiService.sendMessage(mockChatSession, message);
      expect(response).toBe(locales.geminiConnectionError.en); // Defaults to English
    });
  });
});
