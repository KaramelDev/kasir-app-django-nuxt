<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
      <h2 class="text-2xl font-bold text-center mb-6">Login Kasir</h2>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label for="username" class="block text-gray-700 text-sm font-bold mb-2">Username:</label>
          <input type="text" id="username" v-model="username" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
        </div>
        <div class="mb-6">
          <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Password:</label>
          <input type="password" id="password" v-model="password" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline">
        </div>
        <button type="submit" class="bg-blue-500 text-white font-bold py-2 px-4 rounded w-full hover:bg-blue-600 focus:outline-none focus:shadow-outline" @click:disabled="authStore.loading">
          {{ authStore.loading ? 'Memproses...' : 'Login' }}
        </button>
        <p v-if="authStore.error" class="text-red-500 text-xs mt-4 text-center">{{ authStore.error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/store/auth';

const username = ref('');
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();



const handleLogin = async () => {
  const success = await authStore.login({ username: username.value, password: password.value });
  if (success) {
    router.push('/'); // Redirect ke dashboard setelah login berhasil
  }
};

// Middleware page-specific (opsional jika sudah ada global middleware)
definePageMeta({
  layout: false,
  middleware: [async (to, from) => {
    const authStore = useAuthStore();
    authStore.initAuth();
    if (authStore.loggedIn) {
      return navigateTo('/');
    }
  }]
});
</script>