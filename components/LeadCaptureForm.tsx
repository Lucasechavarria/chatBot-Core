
import React, { useState } from 'react';
import { ContactMethod } from '../types';

interface LeadCaptureFormProps {
  onStartChat: (details: { name: string; contactMethod: ContactMethod; contactInfo: string }) => void;
  isLoading: boolean;
  title: string;
  subtitle: string;
  namePlaceholder: string;
  contactPrompt: string;
  contactPlaceholders: { [key in ContactMethod]: string };
  buttonText: string;
  connectingText: string;
  changeButtonText: string;
  errorMessages: { [key: string]: string };
}

const contactOptions: { id: ContactMethod; name: string; icon: string; hexColor: string }[] = [
    { id: 'email', name: 'Email', icon: 'bi bi-envelope-fill', hexColor: '#EA4335' },
    { id: 'whatsapp', name: 'WhatsApp', icon: 'bi bi-whatsapp', hexColor: '#25D366' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'bi bi-linkedin', hexColor: '#0A66C2' },
    { id: 'instagram', name: 'Instagram', icon: 'bi bi-instagram', hexColor: '#E1306C' },
    { id: 'facebook', name: 'Facebook', icon: 'bi bi-facebook', hexColor: '#1877F2' },
    { id: 'telegram', name: 'Telegram', icon: 'bi bi-telegram', hexColor: '#0088CC' },
    { id: 'phone', name: 'Phone', icon: 'bi bi-telephone-fill', hexColor: '#3B82F6' },
];

const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({ 
  onStartChat, isLoading, title, subtitle, namePlaceholder, contactPrompt, contactPlaceholders, buttonText, connectingText, changeButtonText, errorMessages
}) => {
  const [name, setName] = useState('');
  const [contactMethod, setContactMethod] = useState<ContactMethod | null>(null);
  const [contactInfo, setContactInfo] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(errorMessages.errorNameMissing);
      return;
    }
    if (!contactMethod) {
      setError(errorMessages.errorContactMethodMissing);
      return;
    }
    if (!contactInfo.trim()) {
      setError(errorMessages.errorContactInfoMissing);
      return;
    }
    if (contactMethod === 'email' && !/\S+@\S+\.\S+/.test(contactInfo)) {
      setError(errorMessages.errorInvalidEmail);
      return;
    }
    setError('');
    onStartChat({ name, contactMethod, contactInfo });
  };
  
  const selectedOption = contactMethod && contactOptions.find(o => o.id === contactMethod);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 sm:p-8 text-center bg-slate-800">
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold mb-2 text-gray-100">{title}</h2>
        <p className="text-gray-400 mb-8">{subtitle}</p>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label htmlFor="name" className="sr-only">{namePlaceholder}</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={namePlaceholder}
              aria-label={namePlaceholder}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86A869] text-gray-100 placeholder-gray-500 transition"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <p className="text-gray-400 text-left mb-3">{contactPrompt}</p>
            <div className="flex flex-wrap justify-center gap-3 min-h-[100px] items-center">
              {selectedOption ? (
                <div className="flex items-center gap-4 animate-fade-in w-full justify-center">
                  <div
                    style={{ '--brand-color': selectedOption.hexColor } as React.CSSProperties}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-[var(--brand-color)] bg-slate-700 w-20 h-20 transform scale-110"
                  >
                    <i className={`${selectedOption.icon} text-3xl text-[var(--brand-color)]`}></i>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setContactMethod(null); setContactInfo(''); }}
                    className="text-[#86A869] hover:underline font-medium"
                    aria-label="Change contact method"
                    disabled={isLoading}
                  >
                    {changeButtonText}
                  </button>
                </div>
              ) : (
                contactOptions.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    style={{ '--brand-color': option.hexColor } as React.CSSProperties}
                    onClick={() => { setContactMethod(option.id); setContactInfo(''); setError(''); }}
                    aria-label={`Select ${option.name} as contact method`}
                    disabled={isLoading}
                    className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg border-2 transition-all duration-300 focus:outline-none w-16 h-16 sm:w-20 sm:h-20 bg-slate-700/50 border-slate-600 grayscale hover:grayscale-0 hover:border-[var(--brand-color)]"
                  >
                    <div className="text-gray-400 transition-colors duration-300 hover:text-[var(--brand-color)]">
                      <i className={`${option.icon} text-2xl sm:text-3xl`}></i>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {contactMethod && (
            <div className="animate-fade-in">
              <label htmlFor="contactInfo" className="sr-only">{contactPlaceholders[contactMethod]}</label>
              <input
                id="contactInfo"
                type={contactMethod === 'email' ? 'email' : (contactMethod === 'phone' || contactMethod === 'whatsapp' ? 'tel' : 'text')}
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder={contactPlaceholders[contactMethod]}
                aria-label={contactPlaceholders[contactMethod]}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86A869] text-gray-100 placeholder-gray-500 transition"
                disabled={isLoading}
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full px-4 py-3 bg-[#86A869] text-white font-bold rounded-lg hover:bg-[#769659] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-[#86A869] transition-transform transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {connectingText}
              </>
            ) : buttonText}
          </button>
        </form>
      </div>
       <style>{`
        .animate-fade-in {
            animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `}</style>
    </div>
  );
};

export default LeadCaptureForm;
