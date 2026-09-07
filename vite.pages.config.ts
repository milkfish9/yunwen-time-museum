// 純靜態入口：Cloudflare Pages 不需要 Worker、帳號或資料庫。
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  css: { postcss: { plugins: [tailwindcss()] } },
  server: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
    watch: { usePolling: true, ignored: ['**/dist/**', '**/.wrangler/**'] },
  },
  build: { outDir: 'dist-pages', emptyOutDir: true },
});
