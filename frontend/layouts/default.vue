<template>
  <div class="flex h-screen bg-gray-100">
    <aside
      :class="{
        'translate-x-0': isSidebarOpen,        // Sidebar terlihat
        '-translate-x-full': !isSidebarOpen,   // Sidebar tersembunyi ke kiri
        'md:translate-x-0': true               // Selalu terlihat di MD ke atas
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
              <NuxtLink to="/" class="flex items-center p-2 rounded hover:bg-gray-700" @click="closeSidebarOnMobile">
                <Icon name="mdi:view-dashboard" class="mr-3" /> Dashboard
              </NuxtLink>
            </li>
            <li class="mb-2">
              <NuxtLink to="/products" class="flex items-center p-2 rounded hover:bg-gray-700" @click="closeSidebarOnMobile">
                <Icon name="mdi:package-variant" class="mr-3" /> Produk
              </NuxtLink>
            </li>
            <li class="mb-2">
              <NuxtLink to="/orders" class="flex items-center p-2 rounded hover:bg-gray-700" @click="closeSidebarOnMobile">
                <Icon name="mdi:receipt-text-outline" class="mr-3" /> Transaksi
              </NuxtLink>
            </li>
            <li class="mb-2">
              <NuxtLink to="/users" class="flex items-center p-2 rounded hover:bg-gray-700" @click="closeSidebarOnMobile">
                <Icon name="mdi:account-group" class="mr-3" /> Pengguna
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <div class="mt-auto pt-4 border-t border-gray-700">
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
          'md:ml-64': true, // Selalu ada margin di MD ke atas
          'ml-64': isSidebarOpen && windowWidth < 768 // Tambah margin jika sidebar terbuka di mobile
        }"
        class="flex-1 overflow-x-hidden overflow-y-auto transition-all duration-300 ease-in-out"
      >
        <div v-if="isSidebarOpen && windowWidth < 768" @click="isSidebarOpen = false" class="fixed inset-0 bg-black opacity-50 z-30"></div>
        
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
const windowWidth = ref(0); // State untuk melacak lebar jendela

// Fungsi untuk memperbarui lebar jendela
const updateWindowWidth = () => {
  if (process.client) {
    windowWidth.value = window.innerWidth;
    // Otomatis buka sidebar di desktop, tutup di mobile saat resize
    if (window.innerWidth >= 768) { // MD breakpoint
      isSidebarOpen.value = true;
    } else {
      isSidebarOpen.value = false;
    }
  }
};

onMounted(() => {
  updateWindowWidth(); // Set initial width
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

// Fungsi untuk menutup sidebar saat navigasi di mobile
const closeSidebarOnMobile = () => {
  if (windowWidth.value < 768) { // Hanya tutup di layar mobile
    isSidebarOpen.value = false;
  }
};

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
/* Styling khusus untuk NuxtLink agar active class berfungsi */
.router-link-active,
.router-link-exact-active {
  background-color: #4a5568; /* bg-gray-700 */
}
</style>  