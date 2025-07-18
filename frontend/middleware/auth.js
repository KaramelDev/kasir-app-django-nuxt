// cashier_frontend/middleware/auth.global.js

import { useAuthStore } from "~/store/auth";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();

  // Pastikan store diinisialisasi
  // Jika Anda menyimpan token di localStorage, initAuth akan membaca itu
  // dan mengatur authStore.loggedIn
  if (process.client && !authStore.loggedIn && localStorage.getItem('authStore')) {
    // Memuat ulang state dari persisted state jika belum login tapi ada data
    // Pinia-plugin-persistedstate biasanya menangani ini secara otomatis,
    // tapi ini sebagai fallback atau untuk memastikan state terisi sebelum middleware lain berjalan.
    await authStore.initAuth(); // Pastikan Anda memiliki aksi ini di store Anda
  }
  if (!authStore.isAuthenticated && to.path !== '/login') {
    return navigateTo('/login');
  }

  const publicPages = ['/login']; // Daftar rute yang bisa diakses tanpa login
  const authRequired = !publicPages.includes(to.path);

  // Jika butuh autentikasi tapi belum login
  if (authRequired && !authStore.loggedIn) {
    // Jika di sisi server (saat pertama kali request) atau di sisi klien, redirect ke login
    return navigateTo('/login');
  }

  // Jika sudah login tapi mencoba mengakses halaman login
  if (authStore.isAuthenticated && to.path === '/login') {
    // Redirect ke dashboard atau halaman default yang sesuai role
    if (authStore.isUserAdmin || authStore.user?.is_superuser) {
      return navigateTo('/'); // Admin ke Dashboard utama
    } else if (authStore.isUserCashier) {
      return navigateTo('/'); // Kasir ke Dashboard utama
    }
    // Jika tidak ada role yang dikenali, tetap ke dashboard default
    return navigateTo('/'); 
  }
  if (to.path.startsWith('/admin')) {
    if (!authStore.isUserAdmin && !authStore.user?.is_superuser) {
      // Jika bukan admin atau superuser, redirect ke dashboard atau halaman yang diizinkan
      return navigateTo('/'); 
    }
  }
});