
import { GoogleGenAI, Chat, Content } from "@google/genai";
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

// Maintain a single, language-specific error message to avoid complexity.
const getGeminiConnectionError = () => {
    // Default to English if language detection fails.
    const lang = (document.documentElement.lang as Language) || 'en';
    return locales.geminiConnectionError[lang];
}

export const geminiService = {
  /**
   * Creates and returns a new chat session with the Gemini model.
   * @param history - An initial array of content to seed the chat history.
   * @param lang - The selected language for the system instruction.
   * @param name - The user's name to personalize the system instruction.
   * @returns A Chat instance.
   */
  startChat: (history: Content[], lang: Language, name: string): Chat => {
    return ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: getSystemInstruction(lang, name),
      },
      history: history,
    });
  },

  /**
   * Sends a message to the provided chat session and gets the model's response as a stream.
   * @param chat - The active Chat instance.
   * @param message - The user's message text.
   * @returns An async generator that yields text chunks of the bot's response.
   */
  sendMessageStream: async function* (chat: Chat, message: string): AsyncGenerator<string> {
    try {
      const result = await chat.sendMessageStream({ message });
      for await (const chunk of result) {
        // Ensure we only yield non-empty text parts
        if (chunk.text) {
          yield chunk.text;
        }
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      // Throw a user-friendly error to be caught by the calling function
      throw new Error(getGeminiConnectionError());
    }
  },
};
