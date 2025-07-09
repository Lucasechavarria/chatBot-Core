
/**
 * Defines the supported languages for the application.
 */
export type Language = 'en' | 'es' | 'pt';

/**
 * Defines the available methods for contacting a user.
 */
export type ContactMethod = 'email' | 'whatsapp' | 'phone' | 'instagram' | 'facebook' | 'linkedin' | 'telegram';

/**
 * Represents a user in the application.
 */
export interface User {
  /** The name of the user. */
  name: string;
  /** The preferred contact method of the user. */
  contactMethod: ContactMethod;
  /** The contact information of the user (e.g., email address, phone number). */
  contactInfo: string;
}

/**
 * Represents a message in the chat interface.
 */
export interface Message {
  /** A unique identifier for the message. */
  id: string;
  /** The text content of the message. */
  text: string;
  /** The sender of the message, either 'user' or 'bot'. */
  sender: 'user' | 'bot';
  /** The timestamp when the message was created. */
  timestamp: number;
}