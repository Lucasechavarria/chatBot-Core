
import { User, Message } from '../types';

// TODO: Replace this with your actual n8n webhook URL.
// This is the bridge between your app and services like email and Discord.
const N8N_WEBHOOK_URL = 'https://YOUR_N8N_INSTANCE.com/webhook/YOUR_UNIQUE_ID'; 

/**
 * A backend service that sends data to an n8n webhook.
 * n8n then orchestrates saving data, sending emails, and posting to Discord.
 */
export const backendService = {
  /**
   * Saves a new lead (user) by sending it to the n8n webhook.
   * @returns A promise that resolves to true on success, false on failure.
   */
  saveLead: async (user: User): Promise<boolean> => {
    console.log('SENDING LEAD TO N8N:', user);
    if (N8N_WEBHOOK_URL.includes('YOUR_N8N_INSTANCE')) {
        console.warn('Backend Service: Using placeholder N8N Webhook URL. Data is not being sent.');
        return true; // Return true to not block UI, but warn.
    }
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'LEAD_CAPTURE', data: user }),
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to save lead via n8n webhook:', error);
      // We don't re-throw the error to allow the chat to continue functioning
      // even if the backend connection fails.
      return false;
    }
  },

  /**
   * Saves the entire conversation history to the n8n webhook.
   * This is called automatically as the conversation progresses.
   * @returns A promise that resolves to true on success, false on failure.
   */
  saveConversation: async (user: User, messages: Message[]): Promise<boolean> => {
    const contactIdentifier = `${user.contactMethod}: ${user.contactInfo}`;
    console.log('SENDING CONVERSATION TO N8N for:', contactIdentifier, messages);
     if (N8N_WEBHOOK_URL.includes('YOUR_N8N_INSTANCE')) {
        return true; // Don't send if using the placeholder URL, assume success.
    }
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'CONVERSATION_LOG', data: { user, messages } }),
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to save conversation via n8n webhook:', error);
      return false;
    }
  },
};
