
/**
 * @jest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { backendService } from './backendService';
import { User, Message } from '../types';

// Mock the global fetch function
global.fetch = jest.fn(() => Promise.resolve({ ok: true }) as Promise<Response>);

// Mock console to avoid polluting test output and to spy on it
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

// This is a bit of a hack to modify the readonly constant in the module
// In a real-world scenario with a bundler, we'd use environment variables.
const setWebhookUrl = (url: string) => {
    Object.defineProperty(require('./backendService'), 'N8N_WEBHOOK_URL', {
        value: url,
        writable: true
    });
};

const REAL_URL = 'https://n8n.example.com/webhook/test-id';
const PLACEHOLDER_URL = 'https://YOUR_N8N_INSTANCE.com/webhook/YOUR_UNIQUE_ID';

describe('backendService', () => {

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    mockConsoleError.mockClear();
    mockConsoleWarn.mockClear();
    setWebhookUrl(REAL_URL); // Default to real URL for tests
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('saveLead', () => {
    it('should return true when fetch is successful', async () => {
      (fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({ ok: true }));
      const user: User = { name: 'Test User', contactMethod: 'email', contactInfo: 'test@example.com' };
      const result = await backendService.saveLead(user);

      expect(fetch).toHaveBeenCalledWith(REAL_URL, expect.any(Object));
      expect(result).toBe(true);
    });

    it('should return false and log an error when fetch fails', async () => {
      const error = new Error('Network Failure');
      (fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(error));

      const user: User = { name: 'Test User', contactMethod: 'email', contactInfo: 'test@example.com' };
      const result = await backendService.saveLead(user);

      expect(result).toBe(false);
      expect(mockConsoleError).toHaveBeenCalledWith('Failed to save lead via n8n webhook:', error);
    });
     
    it('should return true, not call fetch, and warn when using placeholder URL', async () => {
      setWebhookUrl(PLACEHOLDER_URL);
      const user: User = { name: 'Test User', contactMethod: 'email', contactInfo: 'test@example.com' };
      const result = await backendService.saveLead(user);
      
      expect(result).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith('Backend Service: Using placeholder N8N Webhook URL. Data is not being sent.');
    });
  });

  describe('saveConversation', () => {
     it('should return true when fetch is successful', async () => {
      (fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({ ok: true }));
      const user: User = { name: 'Test User', contactMethod: 'email', contactInfo: 'test@example.com' };
      const messages: Message[] = [{ id: '1', sender: 'user', text: 'hello', timestamp: 123 }];
      const result = await backendService.saveConversation(user, messages);

      expect(fetch).toHaveBeenCalledWith(REAL_URL, expect.any(Object));
      expect(result).toBe(true);
    });

    it('should return false and log an error when fetch fails', async () => {
      const error = new Error('Network Failure');
      (fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(error));

      const user: User = { name: 'Test User', contactMethod: 'email', contactInfo: 'test@example.com' };
      const messages: Message[] = [];
      const result = await backendService.saveConversation(user, messages);

      expect(result).toBe(false);
      expect(mockConsoleError).toHaveBeenCalledWith('Failed to save conversation via n8n webhook:', error);
    });
    
    it('should return true and not call fetch when using placeholder URL', async () => {
        setWebhookUrl(PLACEHOLDER_URL);
        const user: User = { name: 'Test User', contactMethod: 'email', contactInfo: 'test@example.com' };
        const messages: Message[] = [];
        const result = await backendService.saveConversation(user, messages);
        
        expect(result).toBe(true);
        expect(fetch).not.toHaveBeenCalled();
    });
  });
});