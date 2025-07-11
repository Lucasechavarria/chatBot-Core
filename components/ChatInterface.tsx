import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  isCompleted: boolean;
  inputPlaceholder: string;
  completedPlaceholder: string;
  ariaLiveAnnouncement: string;
}

const CodeBlock: React.FC<any> = ({ node, inline, className, children, ...props }) => {
    const [isCopied, setIsCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const codeText = String(children).replace(/\n$/, '');

    const handleCopy = () => {
        navigator.clipboard.writeText(codeText).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return !inline && match ? (
        <div className="relative my-2 bg-slate-900/70 rounded-lg overflow-hidden border border-slate-700">
            <div className="flex items-center justify-between px-4 py-1 bg-slate-800 text-xs text-gray-400">
                <span>{match[1]}</span>
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition" aria-label="Copy code to clipboard">
                    {isCopied ? (
                        <>
                            <i className="bi bi-check-lg"></i>
                            Copied!
                        </>
                    ) : (
                        <>
                            <i className="bi bi-clipboard"></i>
                            Copy
                        </>
                    )}
                </button>
            </div>
            <pre className="!m-0 !p-0">
                <code className={`block p-4 overflow-x-auto text-sm ${className}`} {...props}>
                    {children}
                </code>
            </pre>
        </div>
    ) : (
        <code className="px-1.5 py-0.5 bg-slate-900/70 rounded-md font-mono text-sm text-[#f08080]" {...props}>
            {children}
        </code>
    );
};

interface ChatMessageProps {
  message: Message;
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  isLastBotMessageWithOptions: boolean;
}

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
    <div className={`flex items-end gap-2 ${isBot ? 'justify-start' : 'justify-end'} animate-message-in`}>
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
              code: CodeBlock,
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

const TypingIndicator: React.FC = () => (
    <div className="flex items-end gap-2 justify-start animate-message-in">
        <div className="px-4 py-3 rounded-2xl bg-slate-700 text-gray-200 rounded-bl-none shadow-sm">
            <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
            </div>
        </div>
    </div>
);


const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading, isCompleted, inputPlaceholder, completedPlaceholder, ariaLiveAnnouncement }) => {
  const [input, setInput] = useState('');
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: 'smooth' | 'instant' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        // A threshold prevents auto-scrolling if the user has scrolled up significantly.
        // We check if the user is within 150px of the bottom.
        if (scrollHeight - scrollTop - clientHeight < 150) {
            // During streaming, we want an instant scroll to keep up with the text.
            // Otherwise, a smooth scroll is nicer. This prevents animation lag
            // from causing the scroll condition to fail on the next chunk.
            scrollToBottom(isLoading ? 'instant' : 'smooth');
        }
    }
  }, [messages, isLoading]);

  const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (container) {
          const { scrollTop, scrollHeight, clientHeight } = container;
          // Show button if user has scrolled up more than 300px from the bottom
          const isScrolledUp = scrollHeight - scrollTop - clientHeight > 300;
          setShowScrollToBottom(isScrolledUp);
      }
  };

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
    <div className="flex flex-col h-full bg-slate-800 relative">
      <div className="sr-only" aria-live="polite" role="status">{ariaLiveAnnouncement}</div>
      <div 
        ref={scrollContainerRef} 
        onScroll={handleScroll} 
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
        data-testid="chat-scroll-container"
      >
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

       {showScrollToBottom && (
            <button
                onClick={() => scrollToBottom('smooth')}
                className="absolute bottom-24 right-6 z-10 bg-slate-600/80 backdrop-blur-sm text-white rounded-full p-2.5 shadow-lg hover:bg-slate-500 transition-all animate-fade-in"
                aria-label="Scroll to bottom"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
            </button>
        )}

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
      <style>{`
        .animate-message-in, .animate-fade-in {
            animation: fade-in 0.4s ease-out;
        }
        @keyframes fade-in {
            from {
                opacity: 0;
                transform: translateY(15px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;