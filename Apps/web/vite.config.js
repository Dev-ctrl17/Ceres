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
    cssCodeSplit: false, // Single CSS file to reduce HTTP requests
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
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2, // Multiple compression passes for better results
      },
      mangle: {
        properties: {
          regex: /^_/, // Mangle private properties starting with _
        },
      },
    },
    sourcemap: false,
    chunkSizeWarningLimit: 250, // Smaller chunks = better caching
    target: 'es2020', // Modern browser target for smaller bundles
    
    // Generate hash in filenames for long-term caching
    // This is default in Vite but explicitly stated for clarity
    // CSS files will have content hash for cache busting
  },
  
  // Optimize for production build
  esbuild: {
    treeShaking: true,
    legalComments: 'none', // Remove comments in production
  },
})