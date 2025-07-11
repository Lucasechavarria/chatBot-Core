
import { Language } from '../types';

type LocaleStrings = {
  [key: string]: {
    [lang in Language]: string;
  };
};

export const locales: LocaleStrings = {
  // App Header
  headerTitle: {
    en: 'Core',
    es: 'Core',
    pt: 'Core',
  },
  headerSubtitle: {
    en: 'Powered by Gemini',
    es: 'Potenciado por Gemini',
    pt: 'Desenvolvido com Gemini',
  },
  botName: {
    en: 'Core',
    es: 'Core',
    pt: 'Core',
  },

  // Language Selector
  languageSelectorPrompt: {
    en: 'Choose your language',
    es: 'Elige tu idioma',
    pt: 'Escolha seu idioma',
  },

  // Lead Capture Form
  leadFormTitle: {
    en: 'Chat with Core',
    es: 'Chatea con Core',
    pt: 'Converse com o Core',
  },
  leadFormSubtitle: {
    en: "I'm the DevCore Group AI assistant. To get started, please tell me your name and how to best reach you.",
    es: 'Soy el asistente de IA de DevCore Group. Para comenzar, por favor dime tu nombre y la mejor forma de contactarte.',
    pt: 'Eu sou o assistente de IA do DevCore Group. Para começar, por favor, me diga seu nome e a melhor forma de entrar em contato.',
  },
  namePlaceholder: {
    en: 'Your Name',
    es: 'Tu Nombre',
    pt: 'Seu Nome',
  },
  contactPrompt: {
    en: 'How should we contact you?',
    es: '¿Cómo te contactamos?',
    pt: 'Como devemos contatá-lo?',
  },
  emailPlaceholder: {
    en: 'Your Email Address',
    es: 'Tu Dirección de Correo Electrónico',
    pt: 'Seu Endereço de Email',
  },
  whatsappPlaceholder: {
    en: 'Your WhatsApp Number',
    es: 'Tu Número de WhatsApp',
    pt: 'Seu Número de WhatsApp',
  },
  phonePlaceholder: {
    en: 'Your Phone Number',
    es: 'Tu Número de Teléfono',
    pt: 'Seu Número de Telefone',
  },
  instagramPlaceholder: {
    en: 'Your Instagram @username',
    es: 'Tu @usuario de Instagram',
    pt: 'Seu @usuário do Instagram',
  },
  facebookPlaceholder: {
    en: 'Your Facebook Profile URL',
    es: 'La URL de tu Perfil de Facebook',
    pt: 'URL do seu Perfil no Facebook',
  },
  linkedinPlaceholder: {
    en: 'Your LinkedIn Profile URL',
    es: 'La URL de tu Perfil de LinkedIn',
    pt: 'URL do seu Perfil no LinkedIn',
  },
  telegramPlaceholder: {
    en: 'Your Telegram @username',
    es: 'Tu @usuario de Telegram',
    pt: 'Seu @usuário do Telegram',
  },
  startChatButton: {
    en: 'Start Chat',
    es: 'Iniciar Chat',
    pt: 'Iniciar Bate-papo',
  },
  connectingButton: {
    en: 'Connecting...',
    es: 'Conectando...',
    pt: 'Conectando...',
  },
  errorNameMissing: {
    en: 'Please enter your name.',
    es: 'Por favor, ingresa tu nombre.',
    pt: 'Por favor, insira seu nome.',
  },
  errorContactMethodMissing: {
    en: 'Please select a contact method.',
    es: 'Por favor, selecciona un método de contacto.',
    pt: 'Por favor, selecione um método de contato.',
  },
  errorContactInfoMissing: {
    en: 'Please provide your contact information.',
    es: 'Por favor, proporciona tu información de contacto.',
    pt: 'Por favor, forneça suas informações de contato.',
  },
  errorInvalidEmail: {
    en: 'Please enter a valid email address.',
    es: 'Por favor, ingresa un correo electrónico válido.',
    pt: 'Por favor, insira um endereço de e-mail válido.',
  },
  changeButtonText: {
    en: 'Change',
    es: 'Cambiar',
    pt: 'Alterar',
  },

  // Chat Interface
  chatInputPlaceholder: {
    en: 'Ask about our services...',
    es: 'Pregunta sobre nuestros servicios...',
    pt: 'Pergunte sobre nossos serviços...',
  },
  chatEndedPlaceholder: {
    en: 'Chat ended. Thank you!',
    es: 'Chat finalizado. ¡Gracias!',
    pt: 'Bate-papo encerrado. Obrigado!',
  },
  
  // Welcome & Error Messages
  initialBotMessageSeed: {
    en: 'My name is {name}. Greet me and start our consultation, following your system instructions.',
    es: 'Mi nombre es {name}. Salúdame y comienza nuestra consultoría, siguiendo tus instrucciones de sistema.',
    pt: 'Meu nome é {name}. Cumprimente-me e inicie nossa consultoria, seguindo suas instruções de sistema.',
  },
  chatStartError: {
    en: "Sorry, we couldn't start the chat session. Please refresh and try again.",
    es: 'Lo sentimos, no pudimos iniciar la sesión de chat. Por favor, actualiza la página e inténtalo de nuevo.',
    pt: 'Desculpe, não conseguimos iniciar a sessão de chat. Por favor, atualize a página e tente novamente.',
  },
  geminiError: {
    en: "I'm sorry, I encountered an error. Please try again.",
    es: 'Lo siento, he encontrado un error. Por favor, inténtalo de nuevo.',
    pt: 'Desculpe, encontrei um erro. Por favor, tente novamente.',
  },
  geminiConnectionError: {
    en: "I'm sorry, but I'm having trouble connecting to my brain right now. Please try again in a moment.",
    es: 'Lo siento, pero estoy teniendo problemas para conectarme con mi cerebro en este momento. Por favor, inténtalo de nuevo en un momento.',
    pt: 'Desculpe, mas estou com problemas para me conectar ao meu cérebro agora. Por favor, tente novamente em um momento.',
  },
  saveConversationError: {
    en: "There was an issue saving our conversation, but don't worry, we can continue.",
    es: 'Hubo un problema al guardar la conversación, pero no te preocupes, podemos continuar.',
    pt: 'Houve um problema ao salvar nossa conversa, mas não se preocupe, podemos continuar.',
  },
  newBotMessage: {
    en: 'New message from Core:',
    es: 'Nuevo mensaje de Core:',
    pt: 'Nova mensagem do Core:',
  },

  // Handoff Flow
  handoffEmailButton: {
    en: "I'd prefer to receive info by email",
    es: 'Prefiero recibir info por correo',
    pt: 'Prefiro receber informações por e-mail',
  },
  handoffWhatsAppButton: {
    en: 'Yes, contact me on WhatsApp',
    es: 'Sí, contáctenme por WhatsApp',
    pt: 'Sim, entrem em contato pelo WhatsApp',
  },
  requestEmailPrompt: {
    en: 'Understood, {name}. To send you the detailed proposal, I need your email address. Could you please provide it?',
    es: 'Entendido, {name}. Para poder enviarte la propuesta detallada, necesito tu dirección de correo electrónico. ¿Podrías proporcionármela?',
    pt: 'Entendido, {name}. Para enviar a proposta detalhada, preciso do seu endereço de e-mail. Você poderia fornecê-lo?',
  },
  requestWhatsAppPrompt: {
      en: "Great, {name}! To have our team contact you, could you please provide your WhatsApp number?",
      es: "¡Excelente, {name}! Para que nuestro equipo pueda contactarte, ¿podrías por favor compartirnos tu número de WhatsApp?",
      pt: "Ótimo, {name}! Para que nossa equipe entre em contato, você poderia fornecer seu número de WhatsApp?",
  },
  handoffConfirmation: {
      en: "Perfect, {name}! We've confirmed your contact information. Our team will reach out to you via {contactMethod} at: **{contactInfo}**.",
      es: "¡Perfecto, {name}! Hemos confirmado tu información de contacto. Nuestro equipo se comunicará contigo vía {contactMethod} en: **{contactInfo}**.",
      pt: "Perfeito, {name}! Confirmamos suas informações de contato. Nossa equipe entrará em contato com você via {contactMethod} em: **{contactInfo}**.",
  },
  triggerHandoffFinalMessage: {
    en: 'INTERNAL_TRIGGER: The user {name} has now confirmed their contact details. Provide the final closing message from your instructions.',
    es: 'INTERNAL_TRIGGER: El usuario {name} ha confirmado sus datos de contacto. Proporciona el mensaje de cierre final de tus instrucciones.',
    pt: 'INTERNAL_TRIGGER: O usuário {name} confirmou seus dados de contato. Forneça a mensagem de encerramento final de suas instruções.',
  },
};
