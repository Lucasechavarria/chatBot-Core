import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";
import { getSystemInstruction } from '../constants';
import { Language } from "../types";
import { locales } from "../i18n/locales";

// The API key is injected via environment variables.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This will be visible in the console if the API_KEY is not set.
  // The app will continue to run but Gemini calls will fail.
  console.error("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

/**
 * Retrieves a language-specific error message for Gemini connection issues.
 * Defaults to English if the document language is not set or recognized.
 * @returns {string} The localized error message.
 */
const getGeminiConnectionError = (): string => {
    // Default to English if language detection fails.
    const lang = (document.documentElement?.lang as Language) || 'en';
    return locales.geminiConnectionError[lang] || locales.geminiConnectionError.en; // Fallback to 'en' if lang specific not found
}

/**
 * Service object for interacting with the Gemini API.
 */
export const geminiService = {
  /**
   * Creates and returns a new chat session with the Gemini model.
   * @param {Content[]} history - An initial array of content to seed the chat history.
   * @param {Language} lang - The selected language for the system instruction.
   * @param {string} name - The user's name to personalize the system instruction.
   * @returns {Chat} A Chat instance.
   */
  startChat: (history: Content[], lang: Language, name: string): Chat => {
    return ai.chats.create({
      model: 'gemini-2.5-flash', // Specifies the Gemini model to use
      config: {
        systemInstruction: getSystemInstruction(lang, name), // Sets the system-level instructions for the model
      },
      history: history, // Initializes the chat with any previous messages
    });
  },

  /**
   * Sends a message to the provided chat session and gets the model's response.
   * @param {Chat} chat - The active Chat instance.
   * @param {string} message - The user's message text.
   * @returns {Promise<string>} The bot's response text.
   *                          Returns a localized error message if the API call fails.
   */
  sendMessage: async (chat: Chat, message: string): Promise<string> => {
    try {
      const result: GenerateContentResponse = await chat.sendMessage({ message });
      const text = result.text;
      return text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      // Provide a user-friendly error message
      return getGeminiConnectionError();
    }
  },
};
