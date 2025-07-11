import React from 'react';
import { Language } from '../types';

interface LanguageSelectorProps {
  onSelectLanguage: (lang: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelectLanguage }) => {
  const buttonStyle = "w-full px-6 py-3 border-2 border-[#86A869] text-[#86A869] font-bold rounded-lg hover:bg-[#86A869] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-[#86A869] transition-colors text-lg";
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="space-y-5 w-full max-w-xs">
            <button onClick={() => onSelectLanguage('en')} className={buttonStyle}>English</button>
            <button onClick={() => onSelectLanguage('es')} className={buttonStyle}>Español</button>
            <button onClick={() => onSelectLanguage('pt')} className={buttonStyle}>Português</button>
        </div>
    </div>
  );
};

export default LanguageSelector;