import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: 'src/**/*.ts',
      outDir: 'dist/types'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, './src/components/index.ts'),
      name: 'StDialog',
      formats: ['es', 'umd', 'cjs'],
      fileName: (format) => `st-dialog.${format}.js`
    },
    rollupOptions: {
      external: ['vue', 'pinia'],
      output: {
        globals: {
          vue: 'Vue',
          pinia: 'pinia'
        }
      }
    }
  }
})
