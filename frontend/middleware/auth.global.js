// cashier_frontend/middleware/auth.global.js

import { useAuthStore } from "~/store/auth";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();

  // Pastikan store diinisialisasi
  // Jika Anda menyimpan token di localStorage, initAuth akan membaca itu
  // dan mengatur authStore.loggedIn
  if (process.client) { // Hanya jalankan di sisi klien setelah hidrasi
    await authStore.initAuth(); // Misalnya, baca token dari localStorage
  }

  const publicPages = ['/login']; // Daftar rute yang bisa diakses tanpa login
  const authRequired = !publicPages.includes(to.path);

  // Jika butuh autentikasi tapi belum login
  if (authRequired && !authStore.loggedIn) {
    // Jika di sisi server (saat pertama kali request) atau di sisi klien, redirect ke login
    return navigateTo('/login');
  }

  // Jika sudah login tapi mencoba mengakses halaman login
  if (to.path === '/login' && authStore.loggedIn) {
    return navigateTo('/'); // Redirect ke dashboard
  }
});