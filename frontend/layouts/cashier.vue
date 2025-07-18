<template>
  <div class="flex h-screen bg-gray-100">
    <div 
      v-if="isSidebarOpen && windowWidth < 768" 
      @click="toggleSidebar" 
      class="fixed inset-0 bg-black opacity-50 z-30 transition-opacity duration-300 ease-in-out"
    ></div>

    <aside
      :class="{
        'translate-x-0': isSidebarOpen,
        '-translate-x-full': !isSidebarOpen,
        'md:translate-x-0': true
      }"
      class="bg-gray-800 text-white w-64 fixed inset-y-0 left-0 z-40
             transition-transform duration-300 ease-in-out
             flex-shrink-0 overflow-y-auto"
    >
      <div class="p-4 flex flex-col h-full">
        <h1 class="text-2xl font-bold mb-6">CashierApp</h1>
        <nav class="flex-grow">
          <ul>
            <li class="mb-2">
              <NuxtLink to="/" class="flex items-center p-2 rounded hover:bg-gray-700 transition-colors duration-200" active-class="bg-blue-600" @click="closeSidebarOnMobile">
                <Icon name="mdi:view-dashboard" class="mr-3" /> Dashboard
              </NuxtLink>
            </li>
            <li class="mb-2">
              <NuxtLink to="/orders" class="flex items-center p-2 rounded hover:bg-gray-700 transition-colors duration-200" active-class="bg-blue-600" @click="closeSidebarOnMobile">
                <Icon name="mdi:receipt-text-outline" class="mr-3" /> Transaksi
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <div v-if="authStore.isAuthenticated" class="mt-auto pt-4 border-t border-gray-700">
          <p class="text-sm mb-2">Logged in as: 
            <span class="font-bold">
              {{ authStore.user?.username || 'Guest' }}
            </span>
          </p> 
          <button @click="logout" class="w-full flex items-center p-2 rounded bg-red-600 hover:bg-red-700">
            <Icon name="mdi:logout" class="mr-3" /> Logout
          </button>
        </div>
      </div>
    </aside>

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="bg-white shadow p-4 flex justify-between items-center md:hidden">
        <button @click="toggleSidebar" class="text-gray-600 focus:outline-none">
          <Icon name="mdi:menu" class="text-3xl" />
        </button>
        <h2 class="text-xl font-bold">CashierApp</h2>
      </header>

      <div
        :class="{
          'md:ml-64': true,
          'ml-64': isSidebarOpen && windowWidth < 768
        }"
        class="flex-1 overflow-x-hidden overflow-y-auto transition-all duration-300 ease-in-out"
      >
        <main class="p-4">
          <NuxtPage />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '~/store/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const isSidebarOpen = ref(false);
const windowWidth = ref(0);

const updateWindowWidth = () => {
  if (process.client) {
    windowWidth.value = window.innerWidth;
    if (window.innerWidth >= 768) {
      isSidebarOpen.value = true;
    } else {
      isSidebarOpen.value = false;
    }
  }
};

onMounted(() => {
  updateWindowWidth();
  if (process.client) {
    window.addEventListener('resize', updateWindowWidth);
  }
});

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', updateWindowWidth);
  }
});

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const closeSidebarOnMobile = () => {
  if (windowWidth.value < 768) {
    isSidebarOpen.value = false;
  }
};

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.router-link-active,
.router-link-exact-active {
  background-color: #4a5568;
}
</style>