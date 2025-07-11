/**
 * @jest-environment jsdom
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { geminiService } from './geminiService';
import { getSystemInstruction } from '../constants';
import { locales } from '../i18n/locales';

// Mock the @google/genai library
const mockSendMessageStream = jest.fn();
const mockCreateChat = jest.fn();

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    chats: {
      create: mockCreateChat,
    },
  })),
}));

describe('geminiService', () => {
  beforeEach(() => {
    mockSendMessageStream.mockClear();
    mockCreateChat.mockClear();
    // Set up default mock behavior
    mockCreateChat.mockReturnValue({
      sendMessageStream: mockSendMessageStream,
    });
  });

  describe('startChat', () => {
    it('should create a chat with the correct model and system instruction', () => {
      const lang = 'es';
      const name = 'Test';
      const history = [];
      const expectedInstruction = getSystemInstruction(lang, name);

      geminiService.startChat(history, lang, name);

      expect(mockCreateChat).toHaveBeenCalledWith({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: expectedInstruction,
        },
        history: history,
      });
    });
  });

  describe('sendMessageStream', () => {
    it('should yield all text chunks from the stream', async () => {
      async function* mockStream() {
        yield { text: 'Hello' };
        yield { text: ' ' };
        yield { text: 'World' };
        yield { text: '!' };
      }
      mockSendMessageStream.mockImplementation(() => Promise.resolve(mockStream()));
      
      const chat = geminiService.startChat([], 'en', 'Test');
      const message = 'Hello';
      const streamGenerator = geminiService.sendMessageStream(chat, message);
      
      const chunks = [];
      for await (const chunk of streamGenerator) {
        chunks.push(chunk);
      }
      
      expect(mockSendMessageStream).toHaveBeenCalledWith({ message });
      expect(chunks).toEqual(['Hello', ' ', 'World', '!']);
    });

    it('should throw a localized error if the stream fails', async () => {
      const error = new Error('API Error');
      mockSendMessageStream.mockImplementation(() => Promise.reject(error));

      // Set document language for the error message
      document.documentElement.lang = 'pt';

      const chat = geminiService.startChat([], 'pt', 'Test');
      const message = 'This will fail';
      
      await expect(async () => {
        const streamGenerator = geminiService.sendMessageStream(chat, message);
        // We need to consume the generator to trigger the error
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const chunk of streamGenerator) {
           // This loop will not run
        }
      }).rejects.toThrow(locales.geminiConnectionError['pt']);
    });

    it('should yield only chunks with text', async () => {
       async function* mockStreamWithEmptyChunks() {
        yield { text: 'First' };
        yield { text: null }; // Should be ignored
        yield { text: '' }; // Should be ignored
        yield { text: 'Second' };
      }
      mockSendMessageStream.mockImplementation(() => Promise.resolve(mockStreamWithEmptyChunks()));
      
      const chat = geminiService.startChat([], 'en', 'Test');
      const streamGenerator = geminiService.sendMessageStream(chat, 'test');
      
      const chunks = [];
      for await (const chunk of streamGenerator) {
        chunks.push(chunk);
      }
      
      expect(chunks).toEqual(['First', 'Second']);
    });
  });
});