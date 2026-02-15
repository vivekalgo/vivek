import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify("https://rfffucuyeakfmqsdowkk.supabase.co"),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZmZ1Y3V5ZWFrZm1xc2Rvd2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMDE0MzEsImV4cCI6MjA4NjY3NzQzMX0.sf3myncEJeFejR3EQNYjD-6XnBcIXPWG4VeKe-d15KQ")
  },
  server: {
    port: 3000
  }
})
