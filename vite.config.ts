import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // أضف هذا الجزء الخاص بالـ build
  build: {
    minify: false, // هذا سيمنع ضغط الكود ويظهر أسماء المتغيرات الحقيقية
    sourcemap: true, // هذا سيساعدك في معرفة رقم السطر في الملف الأصلي
  },
});
