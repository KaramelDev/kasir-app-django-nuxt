<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/store/auth'; // Sesuaikan path



const authStore = useAuthStore();
const users = ref([]);
const loading = ref(false);
const errorMessages = ref({});
const successMessage = ref('');

const fetchUsers = async () => {
  loading.value = true;
  errorMessages.value = {};
  try {
    const response = await $fetch('http://localhost:8000/api/users/', {
      headers: {
        'Authorization': `Token ${authStore.token}`,
      },
    });
    users.value = response;
  } catch (error) {
    console.error('Error fetching users:', error);
    errorMessages.value.general = 'Failed to load users. Please check permissions.';
  } finally {
    loading.value = false;
  }
};

const deleteUser = async (userId) => {
  if (!confirm('Are you sure you want to delete this user?')) {
    return;
  }
  loading.value = true;
  errorMessages.value = {};
  successMessage.value = '';
  try {
    await $fetch(`http://localhost:8000/api/users/${userId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${authStore.token}`,
      },
    });
    successMessage.value = 'User deleted successfully.';
    fetchUsers(); // Refresh list
  } catch (error) {
    console.error('Error deleting user:', error);
    errorMessages.value.general = 'Failed to delete user. Check permissions.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6 text-center">Manage Users</h1>

    <div v-if="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
      {{ successMessage }}
    </div>
    <div v-if="errorMessages.general" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      {{ errorMessages.general }}
    </div>

    <div class="flex justify-end mb-4">
      <NuxtLink to="/admin/users/add" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Add New User
      </NuxtLink>
    </div>

    <div v-if="loading" class="text-center">Loading users...</div>
    <div v-else-if="users.length === 0" class="text-center">No users found.</div>
    <div v-else>
      <div class="overflow-x-auto bg-white shadow-md rounded">
        <table class="min-w-full leading-normal">
          <thead>
            <tr>
              <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Username
              </th>
              <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Role(s)
              </th>
              <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Active
              </th>
              <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p class="text-gray-900 whitespace-no-wrap">{{ user.username }}</p>
              </td>
              <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p class="text-gray-900 whitespace-no-wrap">{{ user.email || '-' }}</p>
              </td>
              <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <p class="text-gray-900 whitespace-no-wrap">
                  <span v-for="group in user.groups" :key="group" class="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mr-2 mb-1">
                    {{ group }}
                  </span>
                  <span v-if="user.is_superuser" class="inline-block bg-purple-200 rounded-full px-3 py-1 text-xs font-semibold text-purple-700 mr-2 mb-1">
                    Superuser
                  </span>
                </p>
              </td>
              <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <span :class="{'text-green-600': user.is_active, 'text-red-600': !user.is_active}">
                  {{ user.is_active ? 'Yes' : 'No' }}
                </span>
              </td>
              <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <div class="flex items-center space-x-2">
                  <NuxtLink :to="`/admin/users/${user.id}/edit`" class="text-blue-600 hover:text-blue-900">Edit</NuxtLink>
                  <button @click="deleteUser(user.id)" class="text-red-600 hover:text-red-900">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>