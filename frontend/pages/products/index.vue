<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Manajemen Produk</h1>

    <div class="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 class="text-xl font-semibold mb-4">{{ editingProduct ? 'Edit Produk' : 'Tambah Produk Baru' }}</h2>
      <form @submit.prevent="saveProduct">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="mb-4">
            <label for="name" class="block text-gray-700 text-sm font-bold mb-2">Nama Produk:</label>
            <input type="text" id="name" v-model="productForm.name" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          </div>
          <div class="mb-4">
            <label for="price" class="block text-gray-700 text-sm font-bold mb-2">Harga:</label>
            <input type="number" id="price" v-model="productForm.price" required min="0" step="0.01" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          </div>
          <div class="mb-4">
            <label for="stock" class="block text-gray-700 text-sm font-bold mb-2">Stok:</label>
            <input type="number" id="stock" v-model="productForm.stock" required min="0" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          </div>
          <div class="mb-4">
            <label for="category" class="block text-gray-700 text-sm font-bold mb-2">Kategori:</label>
            <select id="category" v-model="productForm.category" class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              <option value="">Pilih Kategori</option>
              <option v-for="category in productStore.categories" :key="category.id" :value="category.id">{{ category.name }}</option>
            </select>
          </div>
        </div>
        <div class="mb-4">
          <label for="description" class="block text-gray-700 text-sm font-bold mb-2">Deskripsi:</label>
          <textarea id="description" v-model="productForm.description" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
        </div>
        <div class="flex items-center gap-4">
          <button type="submit" class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400" :disabled="productStore.loading">
            {{ editingProduct ? 'Simpan Perubahan' : 'Tambah Produk' }}
          </button>
          <button type="button" v-if="editingProduct" @click="cancelEdit" class="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400">Batal</button>
        </div>
        <p v-if="productStore.error" class="text-red-500 text-sm mt-2">Error: {{ productStore.error.message }}</p>
      </form>
    </div>

    <h2 class="text-xl font-semibold mb-4">Daftar Produk Saat Ini</h2>
    <div v-if="productStore.loading" class="text-center text-gray-500">Memuat produk...</div>
    <div v-else-if="productStore.error" class="text-center text-red-500">Gagal memuat produk: {{ productStore.error.message }}</div>
    <div v-else class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
        <thead>
          <tr class="bg-gray-100 text-left text-sm font-semibold text-gray-700">
            <th class="py-2 px-4 border-b">Nama</th>
            <th class="py-2 px-4 border-b">Harga</th>
            <th class="py-2 px-4 border-b">Stok</th>
            <th class="py-2 px-4 border-b">Kategori</th>
            <th class="py-2 px-4 border-b">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in productStore.products" :key="product.id" class="hover:bg-gray-50">
            <td class="py-2 px-4 border-b">{{ product.name }}</td>
            <td class="py-2 px-4 border-b">Rp {{ product.price.toLocaleString('id-ID') }}</td>
            <td class="py-2 px-4 border-b">{{ product.stock }}</td>
            <td class="py-2 px-4 border-b">{{ product.category_name || '-' }}</td>
            <td class="py-2 px-4 border-b flex gap-2">
              <button @click="editProduct(product)" class="bg-yellow-500 text-white py-1 px-3 rounded text-sm hover:bg-yellow-600">Edit</button>
              <button @click="deleteProduct(product.id)" class="bg-red-500 text-white py-1 px-3 rounded text-sm hover:bg-red-600">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useProductStore } from '~/store/products';

const productStore = useProductStore();

const productForm = ref({
  id: null,
  name: '',
  description: '',
  price: 0,
  stock: 0,
  category: null,
});

const editingProduct = ref(null);

onMounted(() => {
  productStore.fetchProducts();
  productStore.fetchCategories();
});


// Fungsi untuk mendapatkan nama kategori dari ID
const getCategoryName = (categoryId) => {
  const category = productStore.categories.find(cat => cat.id === categoryId);
  return category ? category.name : '-';
};

const saveProduct = async () => {
  let success;
  // Periksa apakah ini mode edit atau tambah baru
  if (editingProduct.value) {
    // Panggil updateProduct dengan ID dan data form
    success = await productStore.updateProduct(editingProduct.value, productForm.value);
    if (success) {
      editingProduct.value = null; // Reset mode edit
      resetForm(); // Bersihkan form
      // Tidak perlu fetchProducts lagi karena store sudah mengupdate state lokal
    }
  } else {
    // Panggil addProduct dengan data form
    success = await productStore.addProduct(productForm.value);
    if (success) {
      resetForm(); // Bersihkan form
      // Tidak perlu fetchProducts lagi karena store sudah mengupdate state lokal
    }
  }
};

const editProduct = (product) => {
  // Set editingProductId ke ID produk yang akan diedit
  editingProduct.value = product.id;
  // Isi productForm dengan data produk yang akan diedit
  // Gunakan spread operator untuk membuat salinan objek
  productForm.value = { ...product };
  // Pastikan category adalah ID (karena API mengharapkan ID)
  // product.category sudah berupa ID dari backend, jadi tidak perlu konversi lagi
};

const cancelEdit = () => {
  editingProduct.value = null;
  resetForm();
};

const deleteProduct = async (productId) => {
  if (confirm('Anda yakin ingin menghapus produk ini?')) {
    // Logika untuk delete produk (Anda perlu menambahkan aksi deleteProduct di store)
    const success = await productStore.deleteProduct(productId);
    if (success) {
      productStore.fetchProducts(); // Refresh list
    }
    console.log("Delete product logic needed for ID:", productId);
  }
};

const resetForm = () => {
  productForm.value = {
    id: null,
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: null,
  };
};

// Fungsi handleImageUpload jika ingin mengupload gambar
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Anda mungkin perlu menggunakan FormData untuk mengirim file ke API
    productForm.value.image = file;
  }
};
</script>