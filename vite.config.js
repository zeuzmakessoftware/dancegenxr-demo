import { defineConfig } from 'vite'

export default defineConfig({
  // Configuration options go here
  build: {
    outDir: 'build', // Specify the output directory (default is 'dist')
    assetsDir: 'assets', // Specify the assets directory (default is '_assets')
    rollupOptions: {
        input: {
          main: 'index.html',
          vr: 'vr.html',
        }
      }
  }
})
