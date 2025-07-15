// cashier_frontend/store/auth.js
import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#app';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null, // Bisa menyimpan { id, username }
    loggedIn: false,
    loading: false,
    error: null,
  }),

   persist: {
    storage: process.client ? localStorage : undefined, // Pastikan hanya di client-side
  },
  actions: {
    // Memuat state dari localStorage saat store diinisialisasi
    // Ini penting agar user tetap login setelah refresh halaman
    initAuth() {
      if (process.client) { // Hanya jalankan di sisi client
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');
        if (storedToken && storedUser) {
          this.token = storedToken;
          this.user = JSON.parse(storedUser);
          this.loggedIn = true;
        }
      }
    },

    async login(credentials) {
      this.loading = true;
      this.error = null;
      try {
        const config = useRuntimeConfig();
        const response = await $fetch(`${config.public.apiBaseUrl}/login/`, {
          method: 'POST',
          body: credentials,
        });

        this.token = response.token;
        this.user = { id: response.user_id, username: response.username };
        this.loggedIn = true;

        if (process.client) {
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('authUser', JSON.stringify(this.user));
        }

        return true; // Login berhasil
      } catch (e) {
        this.error = e.data?.detail || 'Login gagal. Cek username dan password Anda.';
        this.loggedIn = false;
        console.error("Login error:", e);
        return false; // Login gagal
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      this.loggedIn = false;
      if (process.client) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
      // Opsional: Redirect ke halaman login setelah logout
      const router = useRouter();
      router.push('/login');
    },

    // Aksi untuk memperbarui header default untuk $fetch
    setAuthHeader() {
      if (process.client && this.token) {
        // Mengatur header default untuk semua permintaan $fetch selanjutnya
        // Ini adalah cara yang direkomendasikan di Nuxt 3 (useRequestHeaders tidak untuk $fetch)
        // Kita bisa menggunakan custom plugin atau interceptor jika butuh lebih canggih.
        // Untuk saat ini, kita akan tambahkan secara manual di setiap request atau via global $fetch config.
        // Cara paling sederhana adalah dengan menambahkan header di middleware atau di setiap aksi fetch yang dilindungi.
        // Atau dengan custom composable `useApiFetch`
      }
    }
  },
}); 