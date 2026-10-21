import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// index.html 1枚にまとめてビルドする（file:// で開いても、静的ホスティングに置いても動く）。
export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [react(), viteSingleFile({ removeViteModuleLoader: true })],
  build: { cssCodeSplit: false, assetsInlineLimit: 100_000_000 },
})
