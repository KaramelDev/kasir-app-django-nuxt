// cashier_frontend/nuxt.config.ts

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
 
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    'nuxt-icon',
    '@pinia-plugin-persistedstate/nuxt', 
      // Jika Anda menggunakan komponen Icon
  ],
  css: [
    '~/assets/css/main.css',
  ],


  

piniaPersistedstate: {
    cookieOptions: {
      sameSite: 'strict',
    },
    storage: 'localStorage', // Ini PENTING: Pastikan ini 'localStorage'
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/',
      mediaBaseUrl: process.env.NUXT_PUBLIC_MEDIA_BASE_URL || 'http://localhost:8000/media/',
    },
  },
});