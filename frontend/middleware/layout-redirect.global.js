// cashier_frontend/middleware/layout-redirect.global.js
import { useAuthStore } from '~/store/auth';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();

  // Pastikan store sudah terisi sebelum menentukan layout
  // Ini penting karena middleware ini mungkin berjalan sebelum auth.js selesai memuat state
  // Jika authStore belum terisi, coba panggil initializeAuth (jika ada) atau biarkan auth.js menangani redirect
  if (process.client && !authStore.loggedIn && localStorage.getItem('authStore')) {
    await authStore.initAuth(); 
  }

  // Jika user belum terotentikasi, biarkan middleware `auth.js` yang menangani redirect ke login.
  // Kita tidak perlu mengatur layout di sini jika user belum login.
  if (!authStore.isAuthenticated) {
    return; 
  }

  // Tentukan layout berdasarkan role user
  if (authStore.isUserAdmin || authStore.user?.is_superuser) {
    // Untuk Admin atau Superuser, gunakan layout 'default'
    if (to.meta.layout !== 'default') {
      to.meta.layout = 'default';
    }
  } else if (authStore.isUserCashier) {
    // Untuk Kasir, gunakan layout 'cashier'
    if (to.meta.layout !== 'cashier') {
      to.meta.layout = 'cashier';
    }
  } else {
    // Jika role tidak dikenali atau tidak ada, bisa diarahkan ke login
    // atau ke layout default yang lebih umum jika ada.
    console.warn('User has no recognized role for layout assignment, defaulting to login.');
    return navigateTo('/login');
  }
});