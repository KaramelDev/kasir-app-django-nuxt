<template>
  <div class="container mx-auto p-4 flex flex-col lg:flex-row gap-6">
    <div class="flex-1 flex flex-col gap-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-if="dailySummary" class="bg-white p-5 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-500">Penjualan Hari Ini</h3>
            <p class="text-3xl font-bold text-green-600">Rp {{ dailySummary.totalSales.toLocaleString('id-ID') }}</p>
          </div>
          <Icon name="mdi:cash-multiple" class="text-green-600 text-4xl" />
        </div>
        <div v-if="dailySummary" class="bg-white p-5 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-500">Jumlah Transaksi Hari Ini</h3>
            <p class="text-3xl font-bold text-blue-600">{{ dailySummary.totalOrders }}</p>
          </div>
          <Icon name="mdi:receipt-text-outline" class="text-blue-600 text-4xl" />
        </div>
        <div class="bg-white p-5 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-500">Stok Rendah</h3>
            <p class="text-3xl font-bold text-orange-600">{{ lowStockProducts.length }}</p>
          </div>
          <Icon name="mdi:alert-circle-outline" class="text-orange-600 text-4xl" />
        </div>
      </div>
      <br>
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h2 class="text-xl font-bold text-center md:text-left w-full md:w-auto">Daftar Produk</h2>

          <div class="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Cari produk..."
              class="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
            />
            <select
              v-model="selectedCategory"
              class="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full sm:w-auto"
            >
              <option value="">Semua Kategori</option>
              <option v-if="productStore.categories" v-for="category in productStore.categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          <button @click="showAddCategoryModal = true" class="bg-purple-500 text-white font-bold py-2 px-4 rounded hover:bg-purple-600 focus:outline-none focus:shadow-outline w-full md:w-auto mt-2 md:mt-0">
            + Tambah Kategori
          </button>
        </div>

        <div v-if="productStore.loading" class="text-center text-gray-500 py-10">
          <p>Memuat produk...</p>
          <div class="loader mt-4"></div>
        </div>
        <div v-else-if="productStore.error" class="text-center text-red-500 py-10">
          <p>Gagal memuat produk: {{ productStore.error.message }}</p>
        </div>
        <div v-else-if="filteredProducts && filteredProducts.length === 0" class="text-center text-gray-500 py-10">
          <p>Tidak ada produk yang ditemukan.</p>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product" />
        </div>
      </div>
    </div>

    <div class="lg:w-1/3 bg-white p-6 rounded-lg shadow-md lg:sticky lg:top-4 h-fit">
      <h2 class="text-xl font-bold mb-4">Keranjang Belanja ({{ cartStore.totalItems || 0 }} item)</h2>
      <div v-if="!cartStore.items || cartStore.items.length === 0" class="text-gray-500 text-center py-6">Keranjang kosong.</div>
      <div v-else class="divide-y divide-gray-200 max-h-96 overflow-y-auto mb-4">
        <CartItem v-for="item in cartStore.items" :key="item.id" :item="item" />
      </div>
      <CheckoutForm class="mt-6" />
    </div>

    <div v-if="showAddCategoryModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 class="text-lg font-bold mb-4">Tambah Kategori Baru</h3>
        <form @submit.prevent="submitAddCategory">
          <div class="mb-4">
            <label for="categoryName" class="block text-gray-700 text-sm font-bold mb-2">Nama Kategori:</label>
            <input
              type="text"
              id="categoryName"
              v-model="newCategoryName"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <p v-if="productStore.error" class="text-red-500 text-sm mb-4">{{ productStore.error }}</p>
          <div class="flex justify-end gap-2">
            <button
              type="button"
              @click="showAddCategoryModal = false; newCategoryName = ''; productStore.error = null"
              class="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-400 focus:outline-none focus:shadow-outline"
              :disabled="productStore.loading"
            >
              Batal
            </button>
            <button
              type="submit"
              class="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:shadow-outline"
              :disabled="productStore.loading"
            >
              {{ productStore.loading ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useProductStore } from '~/store/products';
import { useCartStore } from '~/store/cart';
import { useOrderStore } from '~/store/orders';
import { useApiFetch, useApiClient } from '~/composables/useApiFetch'; // Pastikan kedua composable diimpor

const productStore = useProductStore();
const cartStore = useCartStore();
const orderStore = useOrderStore();

const searchQuery = ref('');
const selectedCategory = ref('');

const showAddCategoryModal = ref(false);
const newCategoryName = ref('');

const dailySummary = ref({
  totalSales: 0,
  totalOrders: 0,
});

// --- Fungsi untuk memuat ulang Ringkasan Harian (akan dipanggil saat init dan setelah bayar) ---
// Kita akan menggunakan useApiClient di sini karena ini adalah pembaruan data dinamis
const refreshDailySummary = async () => {
  try {
    const apiClient = useApiClient(); // Dapatkan instance $fetch
    const data = await apiClient('/orders/daily_summary/'); // Panggil endpoint summary

    if (data) {
      dailySummary.value = {
        totalSales: data.total_revenue || 0,
        totalOrders: data.total_transactions || 0,
      };
    } else {
      dailySummary.value = { totalSales: 0, totalOrders: 0 };
    }
  } catch (error) {
    console.error("Error fetching daily summary:", error);
    dailySummary.value = { totalSales: 0, totalOrders: 0 };
  }
};

// --- Fungsi Utama untuk merefresh SEMUA data yang relevan setelah transaksi ---
const refreshAllEssentialData = async () => {
  console.log('Refreshing all essential data after transaction...');
  await refreshDailySummary(); // Refresh summary penjualan
  await productStore.fetchProducts(); // Refresh daftar produk (untuk update stok)
  // Anda mungkin juga ingin merefresh data lain jika ada
};


// --- Panggil data awal menggunakan await di top-level script setup ---
// Ini akan dijalankan saat halaman pertama kali dimuat atau direfresh
await Promise.all([
  refreshDailySummary(), // Panggil fungsi refresh untuk inisialisasi awal
  productStore.fetchProducts(),
  productStore.fetchCategories(),
]);


// --- Computed Properties dan Functions Lainnya (Tidak Berubah) ---
const lowStockProducts = computed(() => {
  if (!productStore.products) {
    return [];
  }
  return productStore.products.filter(p => p.stock > 0 && p.stock < 10);
});

const filteredProducts = computed(() => {
  let products = productStore.products || [];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    products = products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query))
    );
  }

  if (selectedCategory.value) {
    products = products.filter(product => product.category === selectedCategory.value);
  }

  return products;
});

const submitAddCategory = async () => {
  if (!newCategoryName.value.trim()) {
    productStore.error = 'Nama kategori tidak boleh kosong.';
    return;
  }
  const success = await productStore.addCategory(newCategoryName.value);
  if (success) {
    newCategoryName.value = '';
    showAddCategoryModal.value = false;
  }
};

// --- Watcher untuk checkout (jika CheckoutForm tidak memicu refresh secara langsung) ---
// Asumsi: cartStore memiliki state yang berubah setelah checkout berhasil
// Anda mungkin ingin menempatkan ini di CartStore atau OrderStore jika lebih relevan
watch(() => cartStore.totalItems, async (newTotal, oldTotal) => {
  // Hanya refresh jika total item berubah dari >0 menjadi 0 (indikasi checkout)
  // Atau Anda bisa menambahkan event khusus dari CheckoutForm
  if (oldTotal > 0 && newTotal === 0) {
    console.log('Cart emptied, likely checkout. Refreshing data...');
    await refreshAllEssentialData();
  }
});

// Anda mungkin perlu cara yang lebih eksplisit dari CheckoutForm
// Misalnya, CheckoutForm memancarkan event "checkoutSuccess"
// Contoh:
// provide('refreshData', refreshAllEssentialData); // Di sini
// inject('refreshData'); // Di CheckoutForm setelah berhasil bayar
</script>


<style scoped>
/* Contoh loader sederhana */
.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>