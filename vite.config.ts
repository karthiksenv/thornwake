import { defineConfig } from 'vite';
export default defineConfig({base:'./',server:{port:5173,watch:{ignored:['**/tools/**','**/cinematic/**','**/output/**']}},build:{chunkSizeWarningLimit:800}});
