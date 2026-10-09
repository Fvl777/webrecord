import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base: './'` uses relative asset paths so the build works whether it's
// served from the root of a custom domain OR from a project sub-path
// like https://<user>.github.io/<repo>/.
export default defineConfig({
  plugins: [react()],
  base: './',
})
