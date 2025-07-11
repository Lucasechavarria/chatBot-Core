
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
   */
  saveLead: async (user: User): Promise<void> => {
    console.log('SENDING LEAD TO N8N:', user);
    if (N8N_WEBHOOK_URL.includes('YOUR_N8N_INSTANCE')) {
        console.warn('Backend Service: Using placeholder N8N Webhook URL. Data is not being sent.');
        return;
    }
    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'LEAD_CAPTURE', data: user }),
      });
    } catch (error) {
      console.error('Failed to save lead via n8n webhook:', error);
      // We don't re-throw the error to allow the chat to continue functioning
      // even if the backend connection fails.
    }
  },

  /**
   * Saves the entire conversation history to the n8n webhook.
   * This is called automatically as the conversation progresses.
   */
  saveConversation: async (user: User, messages: Message[]): Promise<void> => {
    const contactIdentifier = `${user.contactMethod}: ${user.contactInfo}`;
    console.log('SENDING CONVERSATION TO N8N for:', contactIdentifier, messages);
     if (N8N_WEBHOOK_URL.includes('YOUR_N8N_INSTANCE')) {
        return; // Don't send if using the placeholder URL.
    }
    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'CONVERSATION_LOG', data: { user, messages } }),
      });
    } catch (error) {
      console.error('Failed to save conversation via n8n webhook:', error);
    }
  },
};
