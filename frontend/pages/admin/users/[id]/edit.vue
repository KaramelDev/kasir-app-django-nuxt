<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '~/store/auth';

definePageMeta({
  
  layout: 'default',
});

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const userId = route.params.id;

const form = ref({
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  password: '', // Opsional, hanya jika ingin mengubah
  password2: '', // Opsional
  group_name: '', // Akan diisi dari data user yang ada
});

const errorMessages = ref({});
const successMessage = ref('');
const loading = ref(false);

const fetchUserDetails = async () => {
  loading.value = true;
  try {
    const response = await $fetch(`http://localhost:8000/api/users/${userId}/`, {
      headers: {
        'Authorization': `Token ${authStore.token}`,
      },
    });
    form.value.username = response.username;
    form.value.email = response.email;
    form.value.first_name = response.first_name;
    form.value.last_name = response.last_name;
    // Set group_name dari grup yang ada (ambil yang pertama jika ada banyak, atau default)
    form.value.group_name = response.groups && response.groups.length > 0 ? response.groups[0] : 'Cashier';

  } catch (error) {
    console.error('Error fetching user details:', error);
    errorMessages.value.general = 'Failed to load user details. Check permissions or user ID.';
  } finally {
    loading.value = false;
  }
};

const updateUser = async () => {
  loading.value = true;
  errorMessages.value = {};
  successMessage.value = '';

  try {
    if (!authStore.token) {
      errorMessages.value.general = 'Admin not authenticated. Please log in.';
      loading.value = false;
      return;
    }

    const payload = { ...form.value };
    // Hapus password jika kosong (tidak ingin mengubah)
    if (!payload.password) {
      delete payload.password;
      delete payload.password2;
    }

    await $fetch(`http://localhost:8000/api/users/${userId}/`, {
      method: 'PUT', // Atau PATCH jika Anda ingin partial update
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${authStore.token}`,
      },
      body: payload,
    });

    successMessage.value = `User "${form.value.username}" updated successfully!`;
    router.push('/admin/users'); // Redirect kembali ke daftar user
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.response && error.response._data) {
      errorMessages.value = error.response._data;
      if (error.response.status === 403) {
        errorMessages.value.general = 'You do not have permission to perform this action.';
      } else if (error.response.status === 401) {
        errorMessages.value.general = 'Authentication required. Please log in as an Admin.';
      } else if (error.response.status === 400) {
        if (errorMessages.value.username && errorMessages.value.username.includes('already exists')) {
          errorMessages.value.username = ['Username already taken.'];
        }
        if (errorMessages.value.email && errorMessages.value.email.includes('already exists')) {
          errorMessages.value.email = ['Email already taken.'];
        }
      }
    } else {
      errorMessages.value.general = 'An unexpected error occurred.';
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchUserDetails();
});
</script>

<template>
  <div class="container mx-auto p-4 max-w-md">
    <h1 class="text-2xl font-bold mb-6 text-center">Edit User: {{ form.username }}</h1>

    <div v-if="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
      {{ successMessage }}
    </div>

    <div v-if="errorMessages.general" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      {{ errorMessages.general }}
    </div>

    <form @submit.prevent="updateUser" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
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
          New Password (Leave blank to keep current)
        </label>
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="password"
          type="password"
          v-model="form.password"
        >
        <p v-if="errorMessages.password" class="text-red-500 text-xs italic">{{ errorMessages.password[0] }}</p>
      </div>

      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="password2">
          Confirm New Password
        </label>
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="password2"
          type="password"
          v-model="form.password2"
        >
        <p v-if="errorMessages.password2" class="text-red-500 text-xs italic">{{ errorMessages.password2[0] }}</p>
      </div>

      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="group_name">
          User Role
        </label>
        <select
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="group_name"
          v-model="form.group_name"
          required
        >
          <option value="Cashier">Cashier</option>
          <option value="Admin">Admin</option>
        </select>
        <p v-if="errorMessages.group_name" class="text-red-500 text-xs italic">{{ errorMessages.group_name[0] }}</p>
      </div>

      <div class="flex items-center justify-between">
        <button
          class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
          :disabled="loading"
        >
          {{ loading ? 'Updating User...' : 'Update User' }}
        </button>
        <NuxtLink to="/admin/users" class="inline-block align-baseline font-bold text-sm text-gray-500 hover:text-gray-800">
          Cancel
        </NuxtLink>
      </div>
    </form>
  </div>
</template>