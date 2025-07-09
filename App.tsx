
import React, { useState, useCallback, useEffect } from 'react';
import type { Chat, Content } from '@google/genai';

import LeadCaptureForm from './components/LeadCaptureForm';
import ChatInterface from './components/ChatInterface';
import LanguageSelector from './components/LanguageSelector';
import { User, Message, Language, ContactMethod } from './types';
import { backendService } from './services/backendService';
import { geminiService } from './services/geminiService';
import { locales } from './i18n/locales';

/**
 * Represents the different states of the conversation flow.
 * - `chatting`: Normal conversation mode.
 * - `awaiting_email`: The bot has requested the user's email and is waiting for it.
 * - `completed`: The conversation has concluded (e.g., after email capture).
 */
type FlowState = 'chatting' | 'awaiting_email' | 'completed';

/**
 * Main application component.
 * Manages the overall state of the chat application, including language selection,
 * user information, chat messages, loading states, and conversation flow.
 *
 * @returns {React.ReactElement} The rendered application.
 */
const App: React.FC = () => {
  const [language, setLanguage] = useState<Language | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [flowState, setFlowState] = useState<FlowState>('chatting');
  
  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  const handleStartChat = useCallback(async (leadData: { name: string; contactMethod: ContactMethod; contactInfo: string }) => {
    if (!language) return;

    const newUser: User = { 
        name: leadData.name,
        contactMethod: leadData.contactMethod,
        contactInfo: leadData.contactInfo,
    };
    setUser(newUser);
    setIsLoading(true);

    try {
      await backendService.saveLead(newUser);
      
      const newChat = geminiService.startChat([], language, newUser.name);
      setChatSession(newChat);

      const seedMessage = locales.initialBotMessageSeed[language].replace('{name}', newUser.name);
      
      const botResponseText = await geminiService.sendMessage(newChat, seedMessage);
      
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponseText,
        timestamp: Date.now(),
      };
      setMessages([botMessage]);

    } catch (error) {
      console.error("Failed to start chat:", error);
      setMessages([{
        id: `error-${Date.now()}`,
        sender: 'bot',
        text: locales.chatStartError[language],
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!user || !language || flowState === 'completed') return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      if (flowState === 'awaiting_email') {
        if (!/\S+@\S+\.\S+/.test(text)) {
           const errorMessage: Message = {
              id: `error-${Date.now()}`,
              sender: 'bot',
              text: locales.errorInvalidEmail[language],
              timestamp: Date.now(),
           };
           setMessages(prev => [...prev, errorMessage]);
           return;
        }
        
        const updatedUser = { ...user, contactMethod: 'email' as ContactMethod, contactInfo: text };
        setUser(updatedUser);
        await backendService.saveLead(updatedUser);
        
        const triggerMessage = locales.triggerFinalMessage[language]
          .replace('{name}', updatedUser.name)
          .replace('{email}', text);
        
        if (!chatSession) throw new Error("Chat session not initialized");
        const finalBotResponse = await geminiService.sendMessage(chatSession, triggerMessage);

        const confirmationMessage: Message = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: finalBotResponse,
            timestamp: Date.now(),
        };
        setMessages(prev => [...prev, confirmationMessage]);
        setFlowState('completed');
        return;
      }

      const handoffByEmailTriggers = [
        locales.handoffEmailButton['en'],
        locales.handoffEmailButton['es'],
        locales.handoffEmailButton['pt'],
      ];

      if (handoffByEmailTriggers.includes(text) && user.contactMethod !== 'email') {
        setFlowState('awaiting_email');
        const requestEmailMessage: Message = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: locales.requestEmailPrompt[language].replace('{name}', user.name),
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, requestEmailMessage]);
        return;
      }
      
      if (!chatSession) throw new Error("Chat session not initialized");
      const botResponseText = await geminiService.sendMessage(chatSession, text);
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponseText,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
       const errorMessage: Message = {
        id: `error-${Date.now()}`,
        sender: 'bot',
        text: locales.geminiError[language],
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [chatSession, user, language, flowState]);

  useEffect(() => {
    if (user && messages.length > 0) {
      backendService.saveConversation(user, messages);
    }
  }, [messages, user]);
  
  const renderContent = () => {
    if (!language) {
      return <LanguageSelector onSelectLanguage={handleSelectLanguage} />;
    }
    if (!user) {
      return (
        <LeadCaptureForm 
          onStartChat={handleStartChat} 
          isLoading={isLoading} 
          title={locales.leadFormTitle[language]}
          subtitle={locales.leadFormSubtitle[language]}
          namePlaceholder={locales.namePlaceholder[language]}
          contactPrompt={locales.contactPrompt[language]}
          contactPlaceholders={{
              email: locales.emailPlaceholder[language],
              whatsapp: locales.whatsappPlaceholder[language],
              phone: locales.phonePlaceholder[language],
              instagram: locales.instagramPlaceholder[language],
              facebook: locales.facebookPlaceholder[language],
              linkedin: locales.linkedinPlaceholder[language],
              telegram: locales.telegramPlaceholder[language],
          }}
          buttonText={locales.startChatButton[language]}
          connectingText={locales.connectingButton[language]}
          changeButtonText={locales.changeButtonText[language]}
          errorMessages={{
            errorNameMissing: locales.errorNameMissing[language],
            errorContactMethodMissing: locales.errorContactMethodMissing[language],
            errorContactInfoMissing: locales.errorContactInfoMissing[language],
            errorInvalidEmail: locales.errorInvalidEmail[language],
          }}
        />
      );
    }
    return (
      <ChatInterface 
        messages={messages} 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading}
        isCompleted={flowState === 'completed'}
        inputPlaceholder={locales.chatInputPlaceholder[language]} 
        completedPlaceholder={locales.chatEndedPlaceholder[language]}
      />
    );
  };

  return (
    <div className="bg-gray-900 text-gray-200 font-sans min-h-screen flex flex-col items-center justify-center p-4 selection:bg-[#86A869] selection:text-white">
      <div className="w-full max-w-2xl h-[95vh] max-h-[800px] bg-slate-800 rounded-2xl shadow-2xl flex flex-col border border-slate-700">
        <header className="flex items-center p-4 border-b border-slate-700 flex-shrink-0">
          <svg className="w-10 h-10 mr-4" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-label="DevCore Group Logo">
            {/* Grey Gear */}
            <g transform="translate(-10, 10)">
              <path d="M76.4,103.5 a27,27 0 1,0 -54,0 a27,27 0 1,0 54,0" fill="#6B7280"/>
              <path d="M49.4,103.5 a12,12 0 1,0 -24,0 a12,12 0 1,0 24,0" fill="black"/>
              <path stroke="#6B7280" strokeWidth="8" d="M49.4,76.5 l0,-10 M22.4,103.5 l-10,0 M49.4,130.5 l0,10 M76.4,103.5 l10,0 M30,84 l-7,-7 M68.8,123 l-7,-7 M30,123 l-7,7 M68.8,84 l-7,7" strokeLinecap="round"/>
              <path stroke="white" strokeWidth="1.5" d="M42.4,96.5 l14,14 M42.4,110.5 l14,-14" opacity="0.2" strokeLinecap="round" />
            </g>

            {/* Blue Gear (clipped) */}
            <defs>
              <clipPath id="blue-gear-clip">
                <rect x="0" y="0" width="200" height="150"/>
              </clipPath>
            </defs>
            <g clipPath="url(#blue-gear-clip)" transform="translate(0, 5)">
              <path d="M130.4,153.5 a32,32 0 1,0 -64,0 a32,32 0 1,0 64,0" fill="#3B82F6"/>
              <path stroke="#3B82F6" strokeWidth="10" d="M98.4,121.5 l0,-12 M66.4,153.5 l-12,0 M98.4,185.5 l0,12 M130.4,153.5 l12,0 M74,130 l-9,-9 M122.8,178 l-9,-9 M74,178 l-9,9 M122.8,130 l-9,9" strokeLinecap="round"/>
            </g>

            {/* Green Gear */}
            <g>
              <path d="M162.4,81.5 a32,32 0 1,0 -64,0 a32,32 0 1,0 64,0" fill="#16A34A"/>
              <path d="M130.4,81.5 a14,14 0 1,0 -28,0 a14,14 0 1,0 28,0" fill="black"/>
              <path stroke="#16A34A" strokeWidth="10" d="M130.4,49.5 l0,-12 M98.4,81.5 l-12,0 M130.4,113.5 l0,12 M162.4,81.5 l12,0 M106,58 l-9,-9 M154.8,106 l-9,-9 M106,106 l-9,9 M154.8,58 l-9,9" strokeLinecap="round"/>
              <path stroke="white" strokeWidth="1.5" d="M123.4,74.5 l14,14 M123.4,88.5 l14,-14" opacity="0.2" strokeLinecap="round" />
            </g>

            {/* Text */}
            <text transform="translate(45 155) rotate(-20)" style={{fontSize: '28px', fontWeight: 'bold', letterSpacing: '1px'}}>
              <tspan fill="#16A34A">DEVCORE</tspan>
              <tspan fill="#6B7280">GROUP</tspan>
            </text>
          </svg>
          <div>
            <h1 className="text-xl font-bold text-gray-100">{language ? locales.headerTitle[language] : 'Core'}</h1>
            <p className="text-sm text-[#86A869] font-medium">{language ? locales.headerSubtitle[language] : 'Powered by Gemini'}</p>
          </div>
        </header>
        
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-800">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default App;
