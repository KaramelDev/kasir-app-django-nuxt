<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6 text-gray-800 text-center md:text-left">Daftar Transaksi</h1>

    <div class="bg-white p-4 rounded-lg shadow-md mb-6">
      <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Cari berdasarkan ID, nama pelanggan..."
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <input
          type="date"
          v-model="filterDate"
          class="shadow appearance-none border rounded w-full md:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <select
          v-model="filterStatus"
          class="shadow border rounded w-full md:w-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="">Semua Status</option>
          <option value="completed">Selesai</option>
          <option value="pending">Tertunda</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
      </div>
    </div>

    <div class="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
      <div v-if="orderStore.loading" class="text-center py-10 text-gray-500">
        <p>Memuat transaksi...</p>
        <div class="loader mt-4"></div>
      </div>
      <div v-else-if="orderStore.error" class="text-center py-10 text-red-500">
        <p>Gagal memuat transaksi: {{ orderStore.error.message }}</p>
      </div>
      <div v-else-if="filteredOrders && filteredOrders.length === 0" class="text-center py-10 text-gray-500">
        <p>Tidak ada transaksi ditemukan.</p>
      </div>
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="order in filteredOrders" :key="order.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{{ order.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(order.created_at) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp {{ order.total_amount ? order.total_amount.toLocaleString('id-ID') : '0' }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStatusClass(order.status || '')" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize">
                {{ order.status || 'N/A' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ order.customer_name || 'Umum' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="viewOrderDetails(order)" class="text-blue-600 hover:text-blue-900 mr-3">
                <Icon name="mdi:eye" class="text-lg" />
              </button>
              <button @click="editOrder(order)" class="text-indigo-600 hover:text-indigo-900 mr-3">
                <Icon name="mdi:pencil" class="text-lg" />
              </button>
              <button @click="confirmDeleteOrder(order.id)" class="text-red-600 hover:text-red-900">
                <Icon name="mdi:delete" class="text-lg" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showOrderModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
        <h3 class="text-2xl font-bold mb-4">{{ isEditing ? 'Edit Transaksi' : 'Detail Transaksi' }} #{{ currentOrder?.id }}</h3>
        
        <div v-if="!isEditing && currentOrder" class="mb-4">
          <p><strong>Tanggal:</strong> {{ formatDate(currentOrder.created_at) }}</p>
          <p><strong>Total:</strong> Rp {{ currentOrder.total_amount ? currentOrder.total_amount.toLocaleString('id-ID') : '0' }}</p>
          <p><strong>Status:</strong> 
            <span :class="getStatusClass(currentOrder.status || '')" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize">
              {{ currentOrder.status || 'N/A' }}
            </span>
          </p>
          <p><strong>Pelanggan:</strong> {{ currentOrder.customer_name || 'Umum' }}</p>

          <h4 class="text-lg font-semibold mt-4 mb-2">Item Transaksi:</h4>
          <ul class="space-y-3">
            <li v-for="item in (currentOrder.items || [])" :key="item.id" class="flex items-center gap-3 p-2 border rounded-md bg-gray-50">
              <img
                v-if="item.product && item.product.image"
                :src="productImageUrl(item.product.image)"
                :alt="item.product.name"
                class="w-16 h-16 object-cover rounded-md flex-shrink-0"
              />
              <div v-else class="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-md flex-shrink-0">
                  <span class="text-gray-400 text-xs text-center">No Image</span>
              </div>
              <div class="flex-grow">
                <p class="font-bold text-gray-800">{{ item.product ? item.product.name : 'Produk Dihapus' }}</p>
                <p class="text-sm text-gray-600">Qty: {{ item.quantity || 0 }} x Rp {{ item.price_at_purchase ? item.price_at_purchase.toLocaleString('id-ID') : '0' }}</p>
                <p class="text-sm font-semibold text-gray-700">Subtotal: Rp {{ (item.quantity * item.price_at_purchase) ? (item.quantity * item.price_at_purchase).toLocaleString('id-ID') : '0' }}</p>
              </div>
            </li>
          </ul>
        </div>

        <form v-else-if="currentOrder" @submit.prevent="saveOrder">
          <div class="mb-4">
            <label for="editStatus" class="block text-gray-700 text-sm font-bold mb-2">Status:</label>
            <select
              id="editStatus"
              v-model="currentOrder.status"
              class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="completed">Selesai</option>
              <option value="pending">Tertunda</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
          <div class="mb-4">
            <label for="editCustomerName" class="block text-gray-700 text-sm font-bold mb-2">Nama Pelanggan:</label>
            <input
              type="text"
              id="editCustomerName"
              v-model="currentOrder.customer_name"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <p v-if="orderStore.error" class="text-red-500 text-sm mb-4">{{ orderStore.error.message }}</p>
          <div class="flex justify-end gap-2 mt-6">
            <button
              type="button"
              @click="closeOrderModal"
              class="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-400 focus:outline-none focus:shadow-outline"
              :disabled="orderStore.loading"
            >
              Batal
            </button>
            <button
              type="submit"
              class="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:shadow-outline"
              :disabled="orderStore.loading"
            >
              {{ orderStore.loading ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
        <div v-if="!isEditing" class="flex justify-end gap-2 mt-6">
          <button
            @click="closeOrderModal"
            class="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-400 focus:outline-none focus:shadow-outline"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteConfirmModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm text-center">
        <h3 class="text-lg font-bold mb-4">Konfirmasi Hapus</h3>
        <p class="mb-6">Anda yakin ingin menghapus transaksi #{{ orderToDelete }} ini?</p>
        <p v-if="orderStore.error" class="text-red-500 text-sm mb-4">{{ orderStore.error.message }}</p>
        <div class="flex justify-center gap-4">
          <button
            @click="showDeleteConfirmModal = false; orderToDelete = null"
            class="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-400 focus:outline-none focus:shadow-outline"
            :disabled="orderStore.loading"
          >
            Batal
          </button>
          <button
            @click="deleteOrder"
            class="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 focus:outline-none focus:shadow-outline"
            :disabled="orderStore.loading"
          >
            {{ orderStore.loading ? 'Menghapus...' : 'Ya, Hapus' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>


import { ref, computed, onMounted } from 'vue';
import { useOrderStore } from '~/store/orders'; // Import dari file terpisah

const orderStore = useOrderStore();
const runtimeConfig = useRuntimeConfig(); // Untuk mengakses base URL media

const searchQuery = ref('');
const filterDate = ref('order.created_at');
const filterStatus = ref('');

const showOrderModal = ref(false);
const isEditing = ref(false);
const currentOrder = ref(null); // Untuk detail atau data edit transaksi

const showDeleteConfirmModal = ref(false);
const orderToDelete = ref(null); // Menyimpan ID transaksi yang akan dihapus

// Fungsi untuk mendapatkan URL gambar yang lengkap
const productImageUrl = (relativePath) => {
    if (relativePath) {
        // Pastikan URL media backend Anda benar
        return `${runtimeConfig.public.mediaBaseUrl}${relativePath}`;
    }
    return ''; // Atau berikan URL placeholder default
};


// Computed property untuk filter transaksi
const filteredOrders = computed(() => {
  // Pastikan orderStore.orders adalah array kosong jika undefined/null
  let orders = orderStore.orders || [];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    orders = orders.filter(order =>
      order.id?.toString().includes(query) || // Gunakan optional chaining
      (order.customer_name && order.customer_name.toLowerCase().includes(query)) ||
      (order.status && order.status.toLowerCase().includes(query)) ||
      (order.items && order.items.some(item => // Cari di nama produk dalam item
          item.product && item.product.name && item.product.name.toLowerCase().includes(query)
      ))
    );
  }

  if (filterDate.value) {
    orders = orders.filter(order => {
      // Pastikan order.order_date ada sebelum mencoba mengaksesnya
      if (!order.order_date) return false;
      const orderDate = new Date(order.order_date).toISOString().split('T')[0];
      return orderDate === filterDate.value;
    });
  }

  if (filterStatus.value) {
    orders = orders.filter(order => order.status === filterStatus.value);
  }

  // Mengurutkan pesanan dari yang terbaru
  return orders.sort((a, b) => {
    const dateA = new Date(a.order_date);
    const dateB = new Date(b.order_date);
    // Tangani jika tanggal tidak valid
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;
    return dateB - dateA;
  });
});

// Fungsi untuk memformat tanggal
const formatDate = (dateString) => {
  if (!dateString) return ''; // Tangani jika dateString null/undefined
  try {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString; // Kembalikan string asli jika gagal format
  }
};

// Fungsi untuk mendapatkan kelas warna status
const getStatusClass = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// --- CRUD Operations ---

// READ Detail
const viewOrderDetails = (order) => {
  currentOrder.value = { ...order }; // Buat salinan agar tidak langsung mengubah data asli
  showOrderModal.value = true;
  isEditing.value = false;
};

// UPDATE (Edit)
const editOrder = (order) => {
  // Buat salinan data untuk diedit agar tidak langsung memengaruhi tampilan tabel
  currentOrder.value = { ...order }; 
  showOrderModal.value = true;
  isEditing.value = true;
};

const saveOrder = async () => {
  if (!currentOrder.value) return;

  try {
    // Hanya kirim field yang bisa di-edit (status dan customer_name)
    const payload = {
      status: currentOrder.value.status,
      customer_name: currentOrder.value.customer_name
    };
    
    // Perbarui order di backend
    const success = await orderStore.updateOrder(currentOrder.value.id, payload);
    if (success) {
      closeOrderModal();
      // orderStore.fetchOrders() sudah dipanggil di store setelah update berhasil
      // Tidak perlu panggil lagi di sini kecuali ada kebutuhan khusus
    }
  } catch (error) {
    console.error('Error saving order:', error);
    // Error message akan ditampilkan oleh Pinia store
  }
};

// DELETE
const confirmDeleteOrder = (orderId) => {
  orderToDelete.value = orderId;
  showDeleteConfirmModal.value = true;
};

const deleteOrder = async () => {
  if (!orderToDelete.value) return;

  try {
    const success = await orderStore.deleteOrder(orderToDelete.value);
    if (success) {
      showDeleteConfirmModal.value = false;
      orderToDelete.value = null;
      // orderStore.fetchOrders() sudah dipanggil di store setelah delete berhasil
      // Tidak perlu panggil lagi di sini kecuali ada kebutuhan khusus
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    // Error message akan ditampilkan oleh Pinia store
  }
};

const closeOrderModal = () => {
  showOrderModal.value = false;
  currentOrder.value = null;
  isEditing.value = false;
  orderStore.error = null; // Bersihkan error saat modal ditutup
};

onMounted(async () => {
  await orderStore.fetchOrders();
});
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

/* Styling untuk tabel di mobile: membuat tabel responsif */
/* Ini akan bekerja dengan overflow-x-auto pada parent div */
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem; /* 12px */
  text-align: left;
  border-bottom: 1px solid #e2e8f0; /* gray-200 */
}

thead th {
  background-color: #f7fafc; /* gray-50 */
}

/* Kustomisasi untuk tampilan mobile pada tabel */
@media (max-width: 767px) { /* Di bawah breakpoint md */
  table, thead, tbody, th, td, tr {
    display: block;
  }

  thead tr {
    position: absolute;
    top: -9999px;
    left: -9999px;
  }

  tr {
    border: 1px solid #ccc;
    margin-bottom: 1rem;
    border-radius: 0.5rem; /* rounded-lg */
    overflow: hidden; /* agar border-radius terlihat */
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); /* shadow-md */
  }

  td {
    border: none;
    border-bottom: 1px solid #eee;
    position: relative;
    padding-left: 50%; /* Sesuaikan dengan lebar label */
    text-align: right; /* Konten ke kanan */
  }

  td:before {
    position: absolute;
    top: 0;
    left: 6px;
    width: 45%; /* Lebar label */
    padding-right: 10px;
    white-space: nowrap;
    text-align: left; /* Label ke kiri */
    font-weight: bold;
    color: #4a5568; /* gray-700 */
  }

  /* Label untuk setiap kolom */
  td:nth-of-type(1):before { content: "ID Transaksi:"; }
  td:nth-of-type(2):before { content: "Tanggal:"; }
  td:nth-of-type(3):before { content: "Total:"; }
  td:nth-of-type(4):before { content: "Status:"; }
  td:nth-of-type(5):before { content: "Pelanggan:"; }
  td:nth-of-type(6):before { content: "Aksi:"; }
}
</style>