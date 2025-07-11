
import React from 'react';

import LeadCaptureForm from './components/LeadCaptureForm';
import ChatInterface from './components/ChatInterface';
import LanguageSelector from './components/LanguageSelector';
import Toast from './components/Toast';
import { useChat } from './hooks/useChat';
import { locales } from './i18n/locales';

const App: React.FC = () => {
  const {
    state,
    selectLanguage,
    startChat,
    sendMessage,
    clearToast,
  } = useChat();

  const {
    language,
    user,
    messages,
    isLoading,
    flowState,
    toastMessage,
    ariaLiveAnnouncement,
  } = state;

  const renderContent = () => {
    if (!language) {
      return <LanguageSelector onSelectLanguage={selectLanguage} />;
    }
    if (!user) {
      return (
        <LeadCaptureForm 
          onStartChat={startChat} 
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
        onSendMessage={sendMessage} 
        isLoading={isLoading}
        isCompleted={flowState === 'completed'}
        inputPlaceholder={
            flowState === 'awaiting_email' ? locales.emailPlaceholder[language] :
            flowState === 'awaiting_whatsapp' ? locales.whatsappPlaceholder[language] :
            locales.chatInputPlaceholder[language]
        } 
        completedPlaceholder={locales.chatEndedPlaceholder[language]}
        ariaLiveAnnouncement={ariaLiveAnnouncement}
      />
    );
  };

  return (
    <div className="bg-gray-900 text-gray-200 font-sans min-h-screen flex flex-col items-center justify-center p-4 selection:bg-[#86A869] selection:text-white">
      <div className="w-full max-w-2xl h-[95vh] max-h-[800px] bg-slate-800 rounded-2xl shadow-2xl flex flex-col border border-slate-700 relative overflow-hidden">
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
         <Toast message={toastMessage} onClose={clearToast} />
      </div>
    </div>
  );
};

export default App;
