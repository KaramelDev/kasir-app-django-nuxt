<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/store/auth'; // Sesuaikan path ke store Anda

definePageMeta({
 // Pastikan user login
  layout: 'default', // Atau layout admin Anda jika ada
});

const authStore = useAuthStore();
const router = useRouter();

const form = ref({
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  password2: '',
});

const errorMessages = ref({});
const successMessage = ref('');
const loading = ref(false);

const registerCashier = async () => {
  loading.value = true;
  errorMessages.value = {};
  successMessage.value = '';

  try {
    // Pastikan token admin ada
    if (!authStore.token) {
      errorMessages.value.general = 'Admin not authenticated. Please log in.';
      loading.value = false;
      return;
    }

    const response = await $fetch('http://localhost:8000/api/orders/cashier/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${authStore.token}`, // Kirim token admin
      },
      body: form.value,
    });

    successMessage.value = `Cashier "${response.username}" registered successfully!`;
    // Reset form
    form.value = {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      password2: '',
    };
  } catch (error) {
    console.error('Error registering cashier:', error);
    if (error.response && error.response._data) {
      errorMessages.value = error.response._data;
      if (error.response.status === 403) {
        errorMessages.value.general = 'You do not have permission to perform this action. Only Admin can register cashiers.';
      } else if (error.response.status === 401) {
        errorMessages.value.general = 'Authentication required. Please log in as an Admin.';
      } else if (error.response.status === 400) {
        // Handle specific validation errors from backend
        if (errorMessages.value.username && errorMessages.value.username.includes('already exists')) {
          errorMessages.value.username = 'Username already taken.';
        }
        if (errorMessages.value.email && errorMessages.value.email.includes('already exists')) {
          errorMessages.value.email = 'Email already taken.';
        }
      }
    } else {
      errorMessages.value.general = 'An unexpected error occurred.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="container mx-auto p-4 max-w-md">
    <h1 class="text-2xl font-bold mb-6 text-center">Register New Cashier</h1>

    <div v-if="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
      {{ successMessage }}
    </div>

    <div v-if="errorMessages.general" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      {{ errorMessages.general }}
    </div>

    <form @submit.prevent="registerCashier" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
          Username
        </label>
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="username"
          type="text"
          v-model="form.username"
          required
        >
        <p v-if="errorMessages.username" class="text-red-500 text-xs italic">{{ errorMessages.username[0] }}</p>
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
          Email (Optional)
        </label>
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="email"
          type="email"
          v-model="form.email"
        >
        <p v-if="errorMessages.email" class="text-red-500 text-xs italic">{{ errorMessages.email[0] }}</p>
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="first_name">
          First Name
        </label>
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="first_name"
          type="text"
          v-model="form.first_name"
          required
        >
        <p v-if="errorMessages.first_name" class="text-red-500 text-xs italic">{{ errorMessages.first_name[0] }}</p>
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="last_name">
          Last Name
        </label>
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="last_name"
          type="text"
          v-model="form.last_name"
          required
        >
        <p v-if="errorMessages.last_name" class="text-red-500 text-xs italic">{{ errorMessages.last_name[0] }}</p>
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
          Password
        </label>
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="password"
          type="password"
          v-model="form.password"
          required
        >
        <p v-if="errorMessages.password" class="text-red-500 text-xs italic">{{ errorMessages.password[0] }}</p>
      </div>

      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="password2">
          Confirm Password
        </label>
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="password2"
          type="password"
          v-model="form.password2"
          required
        >
        <p v-if="errorMessages.password2" class="text-red-500 text-xs italic">{{ errorMessages.password2[0] }}</p>
      </div>

      <div class="flex items-center justify-between">
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
          :disabled="loading"
        >
          {{ loading ? 'Registering...' : 'Register Cashier' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
/* Anda bisa menambahkan gaya kustom di sini jika diperlukan */
</style>