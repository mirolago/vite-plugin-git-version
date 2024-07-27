import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePluginGitVersion } from '@mirolago/vite-plugin-git-version';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePluginGitVersion({
      outputFileName: './dist/version.json'
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
