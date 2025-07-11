
import { useState, useCallback, useEffect, useRef } from 'react';
import type { Chat, Content } from '@google/genai';

import { User, Message, Language, ContactMethod, FlowState, ChatState } from '../types';
import { backendService } from '../services/backendService';
import { geminiService } from '../services/geminiService';
import { locales } from '../i18n/locales';

const CHAT_STORAGE_KEY = 'devcore-chat-session';

const getInitialState = (): ChatState => {
  try {
    const savedState = localStorage.getItem(CHAT_STORAGE_KEY);
    if (savedState) {
      const parsed = JSON.parse(savedState);
      // Basic validation
      if (parsed.language && parsed.user) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to parse chat state from localStorage", error);
  }
  return {
    language: null,
    user: null,
    messages: [],
    chatHistory: [],
    flowState: 'chatting',
  };
};

export const useChat = () => {
  const [state, setState] = useState<ChatState>(getInitialState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [ariaLiveAnnouncement, setAriaLiveAnnouncement] = useState('');
  
  const chatSessionRef = useRef<Chat | null>(null);

  // Set document language on initial load if a session exists
  useEffect(() => {
    if (state.language) {
      document.documentElement.lang = state.language;
    }
  }, []);

  // Initialize chat session from stored history if it exists
  useEffect(() => {
    if (state.user && state.language && state.chatHistory.length > 0 && !chatSessionRef.current) {
        chatSessionRef.current = geminiService.startChat(state.chatHistory, state.language, state.user.name);
    }
  }, [state.user, state.language, state.chatHistory]);

  // Persist state to localStorage
  useEffect(() => {
    try {
      const stateToSave = JSON.stringify(state);
      localStorage.setItem(CHAT_STORAGE_KEY, stateToSave);
    } catch (error) {
      console.error("Failed to save chat state to localStorage", error);
    }
  }, [state]);

  // Save conversation to backend
  useEffect(() => {
    const save = async () => {
      // Only save if there are messages and a user
      if (state.user && state.messages.length > 0) {
        const lastMessage = state.messages[state.messages.length - 1];
        // Only save when a message is fully added, not during streaming.
        if (lastMessage.sender === 'user' || (lastMessage.sender === 'bot' && !isLoading)) {
            const success = await backendService.saveConversation(state.user, state.messages);
            if (!success && state.language) {
                setToastMessage(locales.saveConversationError[state.language]);
            }
        }
      }
    };
    save();
  }, [state.messages, state.user, state.language, isLoading]);

  const selectLanguage = (lang: Language) => {
    document.documentElement.lang = lang;
    setState(prevState => ({ ...prevState, language: lang }));
  };

  const clearToast = () => setToastMessage('');

  const updateState = (updates: Partial<ChatState>) => {
    setState(prevState => ({ ...prevState, ...updates }));
  };

  const startChat = useCallback(async (leadData: { name: string; contactMethod: ContactMethod; contactInfo: string }) => {
    if (!state.language) return;

    const newUser: User = { 
        name: leadData.name,
        contactMethod: leadData.contactMethod,
        contactInfo: leadData.contactInfo,
    };
    
    setIsLoading(true);

    try {
      await backendService.saveLead(newUser);
      
      const newChat = geminiService.startChat([], state.language, newUser.name);
      chatSessionRef.current = newChat;

      const seedMessage = locales.initialBotMessageSeed[state.language].replace('{name}', newUser.name);
      
      const botMessageId = `bot-${Date.now()}`;
      const botMessagePlaceholder: Message = { id: botMessageId, sender: 'bot', text: '', timestamp: Date.now() };
      
      // Add placeholder before streaming
      setState(prevState => ({ ...prevState, user: newUser, messages: [botMessagePlaceholder], chatHistory: [] }));

      let fullResponse = '';
      for await (const chunk of geminiService.sendMessageStream(newChat, seedMessage)) {
        fullResponse += chunk;
        setState(prevState => ({
          ...prevState,
          messages: prevState.messages.map(m => m.id === botMessageId ? { ...m, text: fullResponse } : m),
        }));
      }

      setAriaLiveAnnouncement(`${locales.newBotMessage[state.language]} ${fullResponse.replace(/👉\s*\[([^\]]+)\]/g, '').trim()}`);
      
      const finalHistory = await newChat.getHistory();
      updateState({ chatHistory: finalHistory });

    } catch (error) {
      console.error("Failed to start chat:", error);
      const errorMessageText = (error instanceof Error) ? error.message : locales.chatStartError[state.language!];
      updateState({
          user: newUser, // Set user even if chat fails, so they don't see the form again
          messages: [{ id: `error-${Date.now()}`, sender: 'bot', text: errorMessageText, timestamp: Date.now() }]
      });
    } finally {
      setIsLoading(false);
    }
  }, [state.language]);

  const triggerFinalMessage = async (chat: Chat, userName: string, lang: Language) => {
    const triggerMessage = locales.triggerHandoffFinalMessage[lang].replace('{name}', userName);
    const finalBotResponseId = `bot-final-${Date.now()}`;
    const finalMessagePlaceholder: Message = { id: finalBotResponseId, sender: 'bot', text: '', timestamp: Date.now() };

    setState(prevState => ({...prevState, messages: [...prevState.messages, finalMessagePlaceholder]}));

    let fullResponse = '';
    for await (const chunk of geminiService.sendMessageStream(chat, triggerMessage)) {
        fullResponse += chunk;
        setState(prevState => ({
            ...prevState,
            messages: prevState.messages.map(m => m.id === finalBotResponseId ? { ...m, text: fullResponse } : m)
        }));
    }
    setAriaLiveAnnouncement(`${locales.newBotMessage[lang]} ${fullResponse.replace(/👉\s*\[([^\]]+)\]/g, '').trim()}`);
    const finalHistory = await chat.getHistory();
    updateState({ chatHistory: finalHistory, flowState: 'completed' });
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!state.user || !state.language || !chatSessionRef.current || state.flowState === 'completed') return;
    
    const userMessage: Message = { id: `user-${Date.now()}`, sender: 'user', text, timestamp: Date.now() };
    setState(prevState => ({...prevState, messages: [...prevState.messages, userMessage]}));
    setIsLoading(true);

    try {
      // Flow: Handle awaiting specific contact info
      if (state.flowState === 'awaiting_email' || state.flowState === 'awaiting_whatsapp') {
        let updatedUser: User;
        if (state.flowState === 'awaiting_email') {
          if (!/\S+@\S+\.\S+/.test(text)) {
            const errorMessage: Message = { id: `error-${Date.now()}`, sender: 'bot', text: locales.errorInvalidEmail[state.language], timestamp: Date.now() };
            setState(prevState => ({...prevState, messages: [...prevState.messages, errorMessage]}));
            setIsLoading(false);
            return;
          }
          updatedUser = { ...state.user, contactMethod: 'email', contactInfo: text };
        } else { // awaiting_whatsapp
          updatedUser = { ...state.user, contactMethod: 'whatsapp', contactInfo: text };
        }
        
        await backendService.saveLead(updatedUser);
        
        const confirmationText = locales.handoffConfirmation[state.language]
            .replace('{name}', updatedUser.name)
            .replace('{contactMethod}', updatedUser.contactMethod)
            .replace('{contactInfo}', updatedUser.contactInfo);

        const confirmationMessage: Message = { id: `bot-confirm-${Date.now()}`, sender: 'bot', text: confirmationText, timestamp: Date.now() };
        setState(prevState => ({...prevState, user: updatedUser, messages: [...prevState.messages, confirmationMessage]}));
        
        await triggerFinalMessage(chatSessionRef.current, updatedUser.name, state.language);
        return;
      }

      // Flow: Handle handoff requests
      const handoffByEmailTriggers = Object.values(locales.handoffEmailButton);
      const handoffByWhatsAppTriggers = Object.values(locales.handoffWhatsAppButton);

      if (handoffByWhatsAppTriggers.includes(text)) {
        if (state.user.contactMethod === 'whatsapp') {
            const confirmationText = locales.handoffConfirmation[state.language]
                .replace('{name}', state.user.name)
                .replace('{contactMethod}', 'WhatsApp')
                .replace('{contactInfo}', state.user.contactInfo);
            const confirmationMessage: Message = { id: `bot-confirm-${Date.now()}`, sender: 'bot', text: confirmationText, timestamp: Date.now() };
            setState(prevState => ({...prevState, messages: [...prevState.messages, confirmationMessage]}));
            await triggerFinalMessage(chatSessionRef.current, state.user.name, state.language);
        } else {
            const requestMessage: Message = { id: `bot-req-whatsapp-${Date.now()}`, sender: 'bot', text: locales.requestWhatsAppPrompt[state.language].replace('{name}', state.user.name), timestamp: Date.now() };
            updateState({ flowState: 'awaiting_whatsapp', messages: [...state.messages, userMessage, requestMessage]});
        }
        setIsLoading(false);
        return;
      }

      if (handoffByEmailTriggers.includes(text)) {
        if (state.user.contactMethod === 'email') {
             const confirmationText = locales.handoffConfirmation[state.language]
                .replace('{name}', state.user.name)
                .replace('{contactMethod}', 'Email')
                .replace('{contactInfo}', state.user.contactInfo);
            const confirmationMessage: Message = { id: `bot-confirm-${Date.now()}`, sender: 'bot', text: confirmationText, timestamp: Date.now() };
            setState(prevState => ({...prevState, messages: [...prevState.messages, confirmationMessage]}));
            await triggerFinalMessage(chatSessionRef.current, state.user.name, state.language);
        } else {
            const requestEmailMessage: Message = { id: `bot-req-email-${Date.now()}`, sender: 'bot', text: locales.requestEmailPrompt[state.language].replace('{name}', state.user.name), timestamp: Date.now() };
            updateState({ flowState: 'awaiting_email', messages: [...state.messages, userMessage, requestEmailMessage]});
        }
        setIsLoading(false);
        return;
      }
      
      // Flow: Standard message sending.
      const botMessageId = `bot-${Date.now()}`;
      const botMessagePlaceholder: Message = { id: botMessageId, sender: 'bot', text: '', timestamp: Date.now() };
      setState(prevState => ({...prevState, messages: [...prevState.messages, botMessagePlaceholder]}));
      
      let fullResponse = '';
      for await (const chunk of geminiService.sendMessageStream(chatSessionRef.current, text)) {
        fullResponse += chunk;
        setState(prevState => ({
          ...prevState,
          messages: prevState.messages.map(m => m.id === botMessageId ? { ...m, text: fullResponse } : m),
        }));
      }

      setAriaLiveAnnouncement(`${locales.newBotMessage[state.language]} ${fullResponse.replace(/👉\s*\[([^\]]+)\]/g, '').trim()}`);

      const finalHistory = await chatSessionRef.current.getHistory();
      updateState({ chatHistory: finalHistory });

    } catch (error) {
       const errorMessageText = (error instanceof Error) ? error.message : locales.geminiError[state.language!];
       const errorMessage: Message = { id: `error-${Date.now()}`, sender: 'bot', text: errorMessageText, timestamp: Date.now() };
       setState(prevState => ({...prevState, messages: [...prevState.messages, errorMessage]}));
    } finally {
      setIsLoading(false);
    }
  }, [state]);

  return {
    state: { ...state, isLoading, toastMessage, ariaLiveAnnouncement },
    selectLanguage,
    startChat,
    sendMessage,
    clearToast,
  };
};
