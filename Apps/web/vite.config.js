import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // NOTE: cssCodeSplit must remain true (Vite default) to allow Vite's
    // HTML/CSS asset pipeline to function correctly. Setting it to false
    // breaks the build with "No matching HTML proxy module found".
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'lucide-react'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-radix': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
            '@radix-ui/react-label',
          ],
        },
      },
    },
    // Use esbuild for minification. Unlike Terser, esbuild never mangles
    // object property names, so it is inherently safe for React projects.
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 250, // Smaller chunks = better caching
    target: 'es2020', // Modern browser target for smaller bundles
  },
  
  // Optimize for production build
  // Note: To drop console statements in production, use `esbuild.drop: ['console', 'debugger']`
  // when using esbuild minifier. The top-level esbuild config is for the transform plugin,
  // so we only include options valid for esbuild's transform() API here.
  esbuild: {
    treeShaking: true,
    legalComments: 'none', // Remove comments in production
  },
})