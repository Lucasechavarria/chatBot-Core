import React from 'react';
import { Language } from '../types';

/**
 * Props for the LanguageSelector component.
 * @interface LanguageSelectorProps
 */
interface LanguageSelectorProps {
  /**
   * Callback function invoked when a language is selected.
   * @param {Language} lang - The selected language code ('en', 'es', 'pt').
   */
  onSelectLanguage: (lang: Language) => void;
}

/**
 * LanguageSelector component.
 * Displays buttons for the user to select their preferred language.
 *
 * @param {LanguageSelectorProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered language selector.
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelectLanguage }) => {
  const buttonStyle = "w-full px-6 py-3 border-2 border-[#86A869] text-[#86A869] font-bold rounded-lg hover:bg-[#86A869] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-[#86A869] transition-colors text-lg";

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="space-y-5 w-full max-w-xs">
            <button onClick={() => onSelectLanguage('en')} className={buttonStyle} aria-label="Select English language">English</button>
            <button onClick={() => onSelectLanguage('es')} className={buttonStyle} aria-label="Seleccionar idioma Español">Español</button>
            <button onClick={() => onSelectLanguage('pt')} className={buttonStyle} aria-label="Selecionar idioma Português">Português</button>
        </div>
    </div>
  );
};

export default LanguageSelector;
