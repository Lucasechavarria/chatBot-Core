
import type { Content } from '@google/genai';

export type Language = 'en' | 'es' | 'pt';

export type ContactMethod = 'email' | 'whatsapp' | 'phone' | 'instagram' | 'facebook' | 'linkedin' | 'telegram';

export interface User {
  name: string;
  contactMethod: ContactMethod;
  contactInfo: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

export type FlowState = 'chatting' | 'awaiting_email' | 'awaiting_whatsapp' | 'completed';

/**
 * Defines the shape of the data saved to localStorage for session persistence.
 */
export interface ChatState {
  language: Language | null;
  user: User | null;
  messages: Message[];
  chatHistory: Content[];
  flowState: FlowState;
}
