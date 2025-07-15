// cashier_frontend/composables/useApiFetch.js
import { useAuthStore } from '~/store/auth';

export const useApiFetch = (path, options = {}) => {
  const authStore = useAuthStore();
  const config = useRuntimeConfig();

  const headers = {
    ...options.headers,
  };

  if (authStore.loggedIn && authStore.token) {
    // Pastikan ini sesuai dengan backend Anda (Token, Bearer, dll.)
    headers['Authorization'] = `Token ${authStore.token}`; 
  }

  // Opsi default untuk useFetch
  const fetchOptions = {
    baseURL: config.public.apiBaseUrl,
    headers,
    ...options,
    onResponseError({ request, response, options }) {
      if (response.status === 401) {
        console.error("Unauthorized request. Logging out...");
        authStore.logout();
      }
    }
  };

  // Menggunakan useFetch secara default
  return useFetch(path, fetchOptions);
};

// Tambahkan fungsi untuk $fetch secara terpisah
export const useApiClient = () => {
  const authStore = useAuthStore();
  const config = useRuntimeConfig();

  const getHeaders = () => {
    const headers = {};
    if (authStore.loggedIn && authStore.token) {
      headers['Authorization'] = `Token ${authStore.token}`;
    }
    return headers;
  };

  // Mengembalikan instance $fetch yang sudah dikonfigurasi
  // Ini adalah cara yang lebih baik untuk melakukan pemanggilan API setelah komponen mounted
  const client = $fetch.create({
    baseURL: config.public.apiBaseUrl,
    headers: getHeaders(), // Panggil setiap kali untuk memastikan token terbaru
    onResponseError({ request, response, options }) {
      if (response.status === 401) {
        console.error("Unauthorized request. Logging out...");
        authStore.logout();
      }
    }
  });

  return client;
};