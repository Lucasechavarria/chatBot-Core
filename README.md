# Asistente de IA DevCore Group

Este proyecto es un asistente conversacional interactivo basado en React y la API de Gemini de Google. Está diseñado para guiar a los usuarios a través de un flujo de consultoría de proyectos de software, capturar información de contacto y, opcionalmente, entregar esta información a un sistema backend (por ejemplo, a través de un webhook n8n).

## Características Principales

- **Interfaz de Chat Interactiva:** Permite a los usuarios conversar con un asistente de IA.
- **Soporte Multilenguaje:** Actualmente soporta Inglés, Español y Portugués.
- **Captura de Leads:** Un formulario inicial recopila el nombre del usuario y su método de contacto preferido.
- **Flujo de Conversación Dinámico:** El asistente de IA sigue un guion predefinido (configurable por idioma) para guiar la conversación, hacer preguntas sobre el proyecto del usuario y ofrecer opciones interactivas.
- **Integración con Gemini API:** Utiliza el modelo `gemini-2.5-flash` para generar respuestas inteligentes y contextuales.
- **Extensibilidad con Backend:** Incluye un servicio (`backendService`) para enviar datos del lead y transcripciones de chat a un webhook (ej. n8n), permitiendo integraciones con CRMs, sistemas de notificación, etc.
- **Diseño Responsivo:** Interfaz de usuario adaptable a diferentes tamaños de pantalla.
- **Componentes Reutilizables:** Estructurado con componentes de React para facilitar el mantenimiento y la extensión.

## Tecnologías Utilizadas

- **React:** Biblioteca de JavaScript para construir interfaces de usuario.
- **Vite:** Herramienta de frontend para desarrollo rápido y empaquetado optimizado.
- **TypeScript:** Superset de JavaScript que añade tipado estático.
- **Tailwind CSS:** Framework de CSS para diseño rápido y utilitario.
- **@google/genai:** SDK oficial de Google para interactuar con la API de Gemini.
- **react-markdown:** Componente para renderizar Markdown en React, usado para formatear los mensajes del bot.
- **remark-gfm:** Plugin para `react-markdown` que añade soporte para GitHub Flavored Markdown (tablas, listas de tareas, etc.).
- **Bootstrap Icons:** Utilizado para los iconos en el formulario de captura de leads.

## Estructura del Proyecto

```
.
├── public/                  # Archivos estáticos (actualmente vacío o con favicon)
├── src/
│   ├── components/          # Componentes de React reutilizables
│   │   ├── ChatInterface.tsx    # Interfaz principal del chat
│   │   ├── LanguageSelector.tsx # Componente para seleccionar idioma
│   │   └── LeadCaptureForm.tsx  # Formulario de captura de datos del usuario
│   ├── constants/           # Constantes de la aplicación
│   │   └── index.ts             # Principalmente, las instrucciones del sistema para Gemini (prompts)
│   ├── i18n/                # Configuración de internacionalización
│   │   └── locales.ts           # Textos localizados para la interfaz
│   ├── services/            # Servicios para lógica de negocio y APIs externas
│   │   ├── backendService.ts    # Servicio para enviar datos a un backend (n8n)
│   │   └── geminiService.ts     # Servicio para interactuar con la API de Gemini
│   ├── types/               # Definiciones de tipos de TypeScript
│   │   └── index.ts
│   ├── App.tsx              # Componente raíz de la aplicación
│   ├── index.css            # Estilos globales (principalmente Tailwind CSS)
│   ├── index.tsx            # Punto de entrada de la aplicación React
│   └── vite-env.d.ts        # Definiciones de tipos para Vite
├── .env.local.example       # Ejemplo de archivo de variables de entorno
├── .gitignore
├── index.html               # Plantilla HTML principal
├── package.json             # Dependencias y scripts del proyecto
├── README.md                # Este archivo
├── tsconfig.json            # Configuración de TypeScript
└── vite.config.ts           # Configuración de Vite
```

## Instalación y Configuración

### Requisitos Previos

- Node.js (v18 o superior recomendado)
- npm (o yarn/pnpm)

### Pasos

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tudominio/tu-repositorio.git # Reemplaza con la URL de tu repositorio
    cd tu-repositorio
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env.local` en la raíz del proyecto, copiando el contenido de `.env.local.example`.
    ```
    VITE_GEMINI_API_KEY=TU_CLAVE_API_DE_GEMINI
    VITE_N8N_WEBHOOK_URL=TU_URL_DE_WEBHOOK_N8N (opcional)
    ```
    -   `VITE_GEMINI_API_KEY`: Tu clave API para Google Gemini. Puedes obtenerla desde [Google AI Studio](https://aistudio.google.com/app/apikey).
    -   `VITE_N8N_WEBHOOK_URL`: (Opcional) La URL de tu webhook n8n (o cualquier otro servicio backend) para recibir datos de leads y conversaciones. Si no se proporciona o se deja el valor por defecto del ejemplo, la funcionalidad de `backendService` no enviará datos reales.

4.  **Añadir Bootstrap Icons (si es necesario):**
    El proyecto utiliza Bootstrap Icons. Están enlazados en `index.html` a través de un CDN. Si prefieres instalarlos localmente:
    ```bash
    npm install bootstrap-icons
    ```
    Y luego impórtalos en tu `index.css` o directamente en los componentes:
    ```css
    /* src/index.css o similar */
    @import 'bootstrap-icons/font/bootstrap-icons.css';
    ```

## Uso

### Desarrollo

Para iniciar el servidor de desarrollo local (generalmente en `http://localhost:5173`):
```bash
npm run dev
```
La aplicación se recargará automáticamente al guardar cambios en los archivos.

### Producción

Para construir la aplicación para producción:
```bash
npm run build
```
Esto generará una carpeta `dist/` con los archivos estáticos optimizados.

Para previsualizar la build de producción localmente:
```bash
npm run preview
```

## Flujo de la Aplicación

1.  **Selección de Idioma:** El usuario elige entre Inglés, Español o Portugués. Esta selección afecta tanto a la interfaz de usuario como a las instrucciones enviadas a la API de Gemini.
2.  **Captura de Lead:** Se presenta un formulario para que el usuario ingrese su nombre y seleccione un método de contacto (Email, WhatsApp, Teléfono, etc.), junto con la información correspondiente.
3.  **Inicio del Chat:**
    *   Los datos del lead se envían (opcionalmente) al `backendService`.
    *   Se inicializa una sesión de chat con `geminiService`, utilizando una instrucción de sistema (prompt) personalizada según el idioma y el nombre del usuario. Estas instrucciones guían el comportamiento y el tono del AI.
    *   Se envía un mensaje semilla (predefinido en `locales.ts`) a Gemini para obtener la primera respuesta del bot.
4.  **Interacción:**
    *   El usuario envía mensajes a través de la interfaz de chat.
    *   Los mensajes del usuario se envían a `geminiService`.
    *   Las respuestas del bot, generadas por Gemini, se muestran en la interfaz.
    *   El bot puede presentar opciones interactivas (botones) basadas en su script de conversación (definido en `constants/index.ts`). Al hacer clic en estos botones, se envía el texto del botón como un mensaje del usuario.
    *   La conversación completa se guarda (opcionalmente) a través del `backendService` después de cada nuevo mensaje.
5.  **Flujo de "Handoff" (Traspaso):**
    *   El script de conversación del bot está diseñado para, eventualmente, ofrecer al usuario la opción de ser contactado por un humano (por ejemplo, "Prefiero recibir info por correo").
    *   Si el usuario elige una opción de traspaso que requiere un email y no lo proporcionó inicialmente, el bot solicitará el email.
    *   Una vez que se obtiene el email (si es necesario), se actualiza la información del lead en el `backendService`.
    *   Se envía un mensaje especial a Gemini (`triggerFinalMessage`) para que genere un mensaje de cierre.
    *   El estado del chat cambia a `completed`, deshabilitando la entrada de más mensajes.

## Descripción de Componentes y Servicios Clave

### `App.tsx`
Es el componente principal que orquesta toda la aplicación. Gestiona:
- El estado del idioma seleccionado.
- Los datos del usuario (lead).
- La sesión de chat con Gemini.
- El historial de mensajes.
- El estado de carga (cuando se espera respuesta del bot).
- El flujo de la conversación (`FlowState`: `chatting`, `awaiting_email`, `completed`).
- Renderiza condicionalmente `LanguageSelector`, `LeadCaptureForm`, o `ChatInterface` según el estado actual.

### `components/LanguageSelector.tsx`
Un componente sencillo que muestra botones para que el usuario seleccione el idioma de la interfaz y de la conversación con el AI.

### `components/LeadCaptureForm.tsx`
Presenta un formulario para recoger:
- Nombre del usuario.
- Método de contacto preferido (Email, WhatsApp, etc., con iconos).
- Información de contacto (el email, número de teléfono, etc.).
Valida la entrada antes de permitir que el usuario inicie el chat.

### `components/ChatInterface.tsx`
La interfaz donde ocurre la conversación. Características:
- Muestra la lista de mensajes (de usuario y bot).
- Permite al usuario escribir y enviar mensajes.
- Muestra un indicador de "escribiendo..." cuando el bot está generando una respuesta.
- Renderiza los mensajes del bot usando `ReactMarkdown` para soportar formato de texto.
- Parsea y muestra botones interactivos (`👉 [Texto del botón]`) en los mensajes del bot. Solo los botones del último mensaje del bot son clickables para evitar confusiones.
- Se desplaza automáticamente hacia el último mensaje.
- Deshabilita la entrada cuando la conversación está en estado `completed`.

### `constants/index.ts`
Define las instrucciones del sistema (prompts detallados) para la API de Gemini en cada idioma soportado (`SYSTEM_INSTRUCTION_EN`, `SYSTEM_INSTRUCTION_ES`, `SYSTEM_INSTRUCTION_PT`). Estas instrucciones son cruciales ya que definen la personalidad, el flujo de conversación esperado y el formato de respuesta del AI (incluyendo cómo generar botones interactivos). También contiene una función `getSystemInstruction` para obtener la instrucción correcta basada en el idioma y el nombre del usuario.

### `i18n/locales.ts`
Almacena todas las cadenas de texto de la interfaz de usuario (UI) en los diferentes idiomas. Esto permite una fácil traducción y gestión de los textos.

### `services/backendService.ts`
Abstrae la comunicación con un servicio backend. Actualmente, está configurado para enviar datos a un webhook (idealmente n8n).
- `saveLead(user)`: Envía los detalles del nuevo usuario.
- `saveConversation(user, messages)`: Envía el historial completo de la conversación.
Si la URL del webhook no está configurada o es la de ejemplo, las funciones registran en consola pero no realizan llamadas de red reales, permitiendo que la app funcione offline o sin backend.

### `services/geminiService.ts`
Maneja toda la interacción con la API de Google Gemini.
- `startChat(history, lang, name)`: Inicia una nueva sesión de chat con Gemini, configurando el modelo (`gemini-2.5-flash`) y la instrucción del sistema adecuada según el idioma y nombre del usuario.
- `sendMessage(chat, message)`: Envía un mensaje a la sesión de chat activa y devuelve la respuesta textual del modelo.
Maneja errores de la API y devuelve mensajes de error localizados. La clave API de Gemini se carga desde las variables de entorno.

### `types/index.ts`
Define las principales estructuras de datos (tipos de TypeScript) usadas en la aplicación, como `Language`, `ContactMethod`, `User`, y `Message`.

## Pruebas (Pendiente)

Actualmente, el proyecto no cuenta con un framework de pruebas configurado. Para agregar pruebas, se podrían seguir los siguientes pasos:

1.  **Elegir un Framework de Pruebas:**
    *   **Vitest:** Es una opción moderna y rápida, especialmente adecuada para proyectos Vite. Ofrece una API compatible con Jest.
    *   **Jest:** Un framework popular y robusto, aunque podría requerir algo más de configuración con Vite.
    *   **React Testing Library:** Esencial para probar componentes React de la manera en que los usuarios los utilizan.

2.  **Instalar Dependencias:**
    Por ejemplo, para Vitest y React Testing Library:
    ```bash
    npm install --save-dev vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
    ```

3.  **Configurar Vitest:**
    Modificar `vite.config.ts` para incluir la configuración de pruebas:
    ```typescript
    // vite.config.ts
    import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'

    export default defineConfig({
      plugins: [react()],
      test: { // Añadir esta sección
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts', // Archivo de configuración opcional para pruebas
        css: true, // Si necesitas procesar CSS en tus pruebas
      },
    })
    ```
    Crear `src/test/setup.ts` (opcional):
    ```typescript
    // src/test/setup.ts
    import '@testing-library/jest-dom';
    ```

4.  **Escribir Pruebas:**
    Crear archivos `.test.tsx` o `.spec.tsx` para los componentes y servicios.
    Ejemplo para `LanguageSelector.tsx`:
    ```typescript
    // src/components/LanguageSelector.test.tsx
    import { render, screen, fireEvent } from '@testing-library/react';
    import LanguageSelector from './LanguageSelector';
    import { describe, it, expect, vi } from 'vitest';

    describe('LanguageSelector', () => {
      it('renders language buttons', () => {
        render(<LanguageSelector onSelectLanguage={() => {}} />);
        expect(screen.getByRole('button', { name: /english/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /español/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /português/i })).toBeInTheDocument();
      });

      it('calls onSelectLanguage with correct language when a button is clicked', () => {
        const handleSelectLanguage = vi.fn();
        render(<LanguageSelector onSelectLanguage={handleSelectLanguage} />);

        fireEvent.click(screen.getByRole('button', { name: /español/i }));
        expect(handleSelectLanguage).toHaveBeenCalledWith('es');
      });
    });
    ```

5.  **Ejecutar Pruebas:**
    Añadir un script en `package.json`:
    ```json
    "scripts": {
      // ... otros scripts
      "test": "vitest",
      "test:ui": "vitest --ui" // Para la interfaz gráfica de Vitest
    }
    ```
    Luego ejecutar:
    ```bash
    npm test
    ```
    o
    ```bash
    npm run test:ui
    ```

### Documentación de Pruebas (Una vez implementadas)

-   **Pruebas Unitarias:** Enfocadas en componentes individuales y funciones de servicios.
    -   `LanguageSelector.test.tsx`: Verifica que los botones de idioma se rendericen y que la función `onSelectLanguage` se llame con el argumento correcto al hacer clic.
    -   `LeadCaptureForm.test.tsx`: Prueba la renderización de campos, validaciones (nombre, email, selección de método), y la llamada a `onStartChat` con los datos correctos. Se pueden usar mocks para las props de localización.
    -   `ChatMessage.test.tsx`: Verifica la correcta renderización del texto del mensaje (incluyendo markdown) y de los botones de sugerencia. Prueba que `onSendMessage` se llame al hacer clic en un botón de sugerencia.
    -   `geminiService.test.ts`: Utilizar mocks para `GoogleGenAI` para probar la lógica de `startChat` (que llame a `ai.chats.create` con los parámetros correctos) y `sendMessage` (que llame a `chat.sendMessage`). Probar el manejo de errores.
    -   `backendService.test.ts`: Usar mocks para `fetch` para verificar que se llame con la URL, método y cuerpo correctos para `saveLead` y `saveConversation`. Probar el manejo de la URL de placeholder.
-   **Pruebas de Integración:**
    -   `App.test.tsx`: Probar el flujo completo de la aplicación: selección de idioma, llenado del formulario, inicio de chat, envío y recepción de mensajes (mockeando las respuestas de Gemini y `backendService`). Verificar cambios de estado y renderizado condicional.
-   **Para ejecutar las pruebas:**
    ```bash
    npm test
    ```
-   **Para ver la UI de pruebas (Vitest):**
    ```bash
    npm run test:ui
    ```

## Licencia

MIT

---

Desarrollado por DevCore Group. (Reemplazar con tu información si es un fork o adaptación)
