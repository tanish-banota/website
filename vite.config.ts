import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
  define: { __RESUME_AVAILABLE__: JSON.stringify(existsSync(resolve(process.cwd(), 'public/resume.pdf'))) },
});
