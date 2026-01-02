import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Fixed error: Property 'cwd' does not exist on type 'Process' by casting to any.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // This shims process.env.API_KEY specifically for the Google GenAI SDK
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.VITE_GEMINI_API_KEY || ''),
      // Provides a general process.env shim for other libraries
      'process.env': {}
    },
    server: {
      port: 3000,
      host: true
    }
  };
});