/// <reference types="vitest" />
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    console.log(`[vite.config.ts] Running in mode: ${mode}`); // Para depuración
    const env = loadEnv(mode, process.cwd(), '');
    return {
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
        'process.env.N8N_WEBHOOK_URL': JSON.stringify(env.VITE_N8N_WEBHOOK_URL),
      },
      resolve: {
        alias: [
          { find: '@', replacement: path.resolve(__dirname, 'src/') } // Added trailing slash
        ]
      },
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        css: true,
        alias: [
          { find: '@', replacement: path.resolve(__dirname, 'src/') } // Added trailing slash
        ],
        // Opcional: para depurar la resolución de módulos en Vitest
        // deps: {
        //   optimizer: {
        //     web: {
        //       include: ['vitest/utils', 'vitest/browser'],
        //     },
        //   },
        // },
        // server: {
        //   deps: {
        //     inline: true,
        //   },
        // },
      },
    };
});
