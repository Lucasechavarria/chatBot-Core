// src/services/backendService.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { backendService } from './backendService';
import { User, Message, ContactMethod } from '../types';

// Mock global fetch
global.fetch = vi.fn();

// To hold the dynamically imported service
let backendService: any;

describe('backendService', () => {
  const mockUser: User = {
    name: 'Test User',
    contactMethod: 'email',
    contactInfo: 'test@example.com',
  };
  const mockMessages: Message[] = [
    { id: '1', sender: 'user', text: 'Hello', timestamp: Date.now() },
    { id: '2', sender: 'bot', text: 'Hi there', timestamp: Date.now() + 100 },
  ];

  let originalN8NWebhookUrl: string | undefined;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Store original N8N_WEBHOOK_URL
    originalN8NWebhookUrl = process.env.N8N_WEBHOOK_URL;

    // Set the desired N8N_WEBHOOK_URL for the test
    process.env.N8N_WEBHOOK_URL = 'https://test-n8n.example.com/webhook/test-id';

    // Reset modules and dynamically import backendService
    vi.resetModules();
    const serviceModule = await import('./backendService');
    backendService = serviceModule.backendService;
  });

  afterEach(() => {
    // Restore original N8N_WEBHOOK_URL and reset modules
    process.env.N8N_WEBHOOK_URL = originalN8NWebhookUrl;
    vi.resetModules(); // Important for other test files if they also import this service
  });

  describe('saveLead', () => {
    it('should send user data to N8N_WEBHOOK_URL via POST request', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      await backendService.saveLead(mockUser);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        process.env.N8N_WEBHOOK_URL, // Uses the mocked env var
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'LEAD_CAPTURE', data: mockUser }),
        }
      );
    });

    it('should not throw an error if fetch fails, but log an error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

      await expect(backendService.saveLead(mockUser)).resolves.toBeUndefined();
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save lead via n8n webhook:',
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });

    it('should not send data if N8N_WEBHOOK_URL contains "YOUR_N8N_INSTANCE"', async () => {
      // This test needs its own module reset to properly test the placeholder logic
      process.env.N8N_WEBHOOK_URL = 'https://YOUR_N8N_INSTANCE.com/webhook/YOUR_UNIQUE_ID';
      vi.resetModules();
      const freshServiceModule = await import('./backendService');
      const freshBackendService = freshServiceModule.backendService;

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await freshBackendService.saveLead(mockUser);

      expect(fetch).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Backend Service: Using placeholder N8N Webhook URL. Data is not being sent.');
      consoleWarnSpy.mockRestore();
    });
  });

  describe('saveConversation', () => {
    it('should send user and messages data to N8N_WEBHOOK_URL', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      await backendService.saveConversation(mockUser, mockMessages);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        'https://test-n8n.example.com/webhook/test-id', // Expect the hardcoded URL from beforeEach
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'CONVERSATION_LOG', data: { user: mockUser, messages: mockMessages } }),
        }
      );
    });

    it('should not throw an error if fetch fails, but log an error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

      await expect(backendService.saveConversation(mockUser, mockMessages)).resolves.toBeUndefined();
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save conversation via n8n webhook:',
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });

    it('should not send data if N8N_WEBHOOK_URL contains "YOUR_N8N_INSTANCE"', async () => {
      // This test needs its own module reset
      process.env.N8N_WEBHOOK_URL = 'https://YOUR_N8N_INSTANCE.com/webhook/YOUR_UNIQUE_ID';
      vi.resetModules();
      const freshServiceModule = await import('./backendService');
      const freshBackendService = freshServiceModule.backendService;

      await freshBackendService.saveConversation(mockUser, mockMessages);

      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
