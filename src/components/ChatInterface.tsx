import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';

/**
 * Props for the ChatInterface component.
 * @interface ChatInterfaceProps
 */
interface ChatInterfaceProps {
  /** An array of messages to display in the chat. */
  messages: Message[];
  /** Callback function invoked when the user sends a message. */
  onSendMessage: (text: string) => void;
  /** Boolean indicating if a message is currently being loaded (e.g., waiting for bot response). */
  isLoading: boolean;
  /** Boolean indicating if the chat session has been completed. */
  isCompleted: boolean;
  /** Localized placeholder text for the chat input field. */
  inputPlaceholder: string;
  /** Localized placeholder text for the chat input field when the chat is completed. */
  completedPlaceholder: string;
}

/**
 * Props for the ChatMessage component.
 * @interface ChatMessageProps
 */
interface ChatMessageProps {
  /** The message object to display. */
  message: Message;
  /** Callback function to send a message, used for interactive button suggestions. */
  onSendMessage: (text: string) => void;
  /** Boolean indicating if a message is currently being loaded. */
  isLoading: boolean;
  /** Boolean indicating if this is the last bot message that contains interactive suggestions. */
  isLastBotMessageWithOptions: boolean;
}

/**
 * ChatMessage component.
 * Renders a single message in the chat interface.
 * It parses markdown for message text and displays interactive buttons if present.
 *
 * @param {ChatMessageProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered chat message.
 */
const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSendMessage, isLoading, isLastBotMessageWithOptions }) => {
  const isBot = message.sender === 'bot';

  const { mainText, suggestions } = useMemo(() => {
    const buttonRegex = /👉\s*\[([^\]]+)\]/g;
    const suggestions = [...message.text.matchAll(buttonRegex)].map(match => match[1]);
    const mainText = message.text.replace(buttonRegex, '').trim();
    return { mainText, suggestions };
  }, [message.text]);

  const handleSuggestionClick = (text: string) => {
    if (!isLoading && isLastBotMessageWithOptions) {
      onSendMessage(text);
    }
  };

  return (
    <div className={`flex items-end gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`px-4 py-3 rounded-2xl max-w-md md:max-w-lg lg:max-w-xl break-words shadow-sm ${
          isBot
            ? 'bg-slate-700 text-gray-200 rounded-bl-none'
            : 'bg-[#86A869] text-white rounded-br-none'
        }`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
              p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside" {...props} />,
              li: ({node, ...props}) => <li className="mb-1" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
              em: ({node, ...props}) => <em className="italic" {...props} />,
          }}
        >
            {mainText}
        </ReactMarkdown>

        {isBot && suggestions.length > 0 && (
          <div className="mt-3 flex flex-col sm:flex-row sm:flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={!isLastBotMessageWithOptions || isLoading}
                className="px-3 py-2 text-sm text-left rounded-lg transition-all duration-200 text-gray-200 bg-gradient-to-r from-slate-900 to-violet-700 hover:to-violet-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-violet-500 disabled:bg-gradient-none disabled:bg-slate-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:scale-100"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * TypingIndicator component.
 * Displays a simple animation to indicate that the bot is "typing" or processing a response.
 * @returns {React.ReactElement} The rendered typing indicator.
 */
const TypingIndicator: React.FC = () => (
    <div className="flex items-end gap-2 justify-start">
        <div className="px-4 py-3 rounded-2xl bg-slate-700 text-gray-200 rounded-bl-none shadow-sm">
            <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
            </div>
        </div>
    </div>
);

/**
 * ChatInterface component.
 * Provides the main user interface for chatting with the AI assistant.
 * It displays messages, handles user input, and shows loading/completed states.
 *
 * @param {ChatInterfaceProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered chat interface.
 */
const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading, isCompleted, inputPlaceholder, completedPlaceholder }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && !isCompleted) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const lastBotMessageWithOptionsIndex = useMemo(() => {
    if (isCompleted) return -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'bot' && /👉\s*\[([^\]]+)\]/g.test(messages[i].text)) {
        return i;
      }
    }
    return -1;
  }, [messages, isCompleted]);

  const isFormDisabled = isLoading || isCompleted;

  return (
    <div className="flex flex-col h-full bg-slate-800">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg, index) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onSendMessage={onSendMessage}
            isLoading={isLoading}
            isLastBotMessageWithOptions={index === lastBotMessageWithOptionsIndex}
          />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-slate-700 bg-slate-800">
        <form onSubmit={handleSend} className="flex items-center space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isCompleted ? completedPlaceholder : inputPlaceholder}
            aria-label="Chat input"
            className="flex-1 w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-[#86A869] text-gray-200 placeholder-gray-500 transition disabled:cursor-not-allowed"
            disabled={isFormDisabled}
          />
          <button
            type="submit"
            aria-label="Send message"
            className="bg-[#86A869] text-white rounded-full p-3 hover:bg-[#769659] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-[#86A869] transition-transform transform hover:scale-110 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:transform-none"
            disabled={isFormDisabled || !input.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
