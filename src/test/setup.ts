// src/test/setup.ts
import '@testing-library/jest-dom';

// Opcional: Mock para variables de entorno si no se manejan bien por Vite en modo test para todos los casos
// beforeEach(() => {
//   vi.stubGlobal('process', {
//     ...process,
//     env: {
//       ...process.env,
//       VITE_GEMINI_API_KEY: 'test_api_key',
//       VITE_N8N_WEBHOOK_URL: 'http://test.webhook.url'
//     }
//   });
// });

// Opcional: Limpiar mocks después de cada prueba
// afterEach(() => {
//   vi.unstubAllGlobals();
//   vi.clearAllMocks();
// });

// Mockear matchMedia, que es usado por algunas librerías de UI y no existe en JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollIntoView for JSDOM
Element.prototype.scrollIntoView = vi.fn();
