<template>
  <div class="product-detail-page p-4">
    <h1 class="text-2xl font-bold mb-4">Detail & Edit Produk</h1>

    <div v-if="productStore.loading">Loading product details...</div>
    <div v-else-if="productStore.error" class="text-red-500">{{ productStore.error.message }}</div>
    <div v-else-if="!product" class="text-gray-600">Produk tidak ditemukan.</div>
    <div v-else class="p-4 border rounded-lg shadow-md">
      <form @submit.prevent="updateExistingProduct">
        <div class="mb-3">
          <label for="productName" class="block text-sm font-medium text-gray-700">Nama Produk</label>
          <input type="text" id="productName" v-model="product.name" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
        </div>
        <div class="mb-3">
          <label for="productDesc" class="block text-sm font-medium text-gray-700">Deskripsi</label>
          <textarea id="productDesc" v-model="product.description" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
        </div>
        <div class="mb-3">
          <label for="productPrice" class="block text-sm font-medium text-gray-700">Harga</label>
          <input type="number" id="productPrice" v-model="product.price" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" step="0.01" required>
        </div>
        <div class="mb-3">
          <label for="productStock" class="block text-sm font-medium text-gray-700">Stok</label>
          <input type="number" id="productStock" v-model="product.stock" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
        </div>
        <div class="mb-3">
          <label for="productCategory" class="block text-sm font-medium text-gray-700">Kategori</label>
          <select id="productCategory" v-model="product.category" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            <option :value="null">-- Pilih Kategori --</option>
            <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>
        <div class="mb-3">
          <label for="productImage" class="block text-sm font-medium text-gray-700">Gambar Produk</label>
          <input type="file" id="productImage" @change="handleExistingImageUpload" accept="image/*" class="mt-1 block w-full">
          <div v-if="imagePreview || product.image" class="mt-2">
            <img :src="imagePreview || productImageUrl(product.image)" alt="Current Image" class="w-32 h-32 object-cover rounded">
          </div>
          <p v-if="!product.image && !imagePreview" class="text-gray-500 text-sm mt-1">Belum ada gambar produk.</p>
        </div>
        <button type="submit" class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600" :disabled="productStore.loading">
          {{ productStore.loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </button>
        <p v-if="productStore.error" class="text-red-500 mt-2">{{ productStore.error.message }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useProductStore } from '@/store/products';

const productStore = useProductStore();
const route = useRoute();
const runtimeConfig = useRuntimeConfig();

const productId = computed(() => route.params.id);
const product = ref(null); // Akan menampung data produk yang akan diedit
const newImageFile = ref(null); // Akan menampung file gambar baru yang diupload
const imagePreview = ref(null); // Untuk preview gambar baru

// Fungsi untuk mendapatkan URL gambar yang lengkap
const productImageUrl = (relativePath) => {
    if (relativePath) {
        return `${runtimeConfig.public.mediaBaseUrl}${relativePath}`;
    }
    return ''; // Atau URL placeholder
};

// Mengambil data produk berdasarkan ID
const fetchProductDetails = async () => {
    await productStore.fetchProducts(); // Pastikan daftar produk sudah ada
    const foundProduct = productStore.products.find(p => p.id == productId.value);
    if (foundProduct) {
        // Deep copy untuk menghindari mutasi langsung pada store state
        product.value = JSON.parse(JSON.stringify(foundProduct));
        // Jika ada kategori, pastikan itu dalam bentuk ID
        if (product.value.category && typeof product.value.category === 'object') {
            product.value.category = product.value.category.id;
        }
    } else {
        // Handle case where product is not found, maybe redirect
        console.warn(`Product with ID ${productId.value} not found.`);
    }
};

// Handle upload gambar untuk produk yang sudah ada
const handleExistingImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        newImageFile.value = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.value = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        newImageFile.value = null;
        imagePreview.value = null;
    }
};

// Mengupdate produk yang sudah ada
const updateExistingProduct = async () => {
    const formData = new FormData();
    formData.append('name', product.value.name);
    formData.append('description', product.value.description);
    formData.append('price', product.value.price);
    formData.append('stock', product.value.stock);
    if (product.value.category) { // Pastikan kategori dikirim sebagai ID
        formData.append('category', product.value.category);
    } else {
        formData.append('category', ''); // Kirim string kosong jika null untuk kategori
    }

    // Hanya tambahkan gambar ke FormData jika ada gambar baru yang dipilih
    if (newImageFile.value) {
        formData.append('image', newImageFile.value);
    } else if (product.value.image === null && newImageFile.value === null) {
        // Jika sebelumnya tidak ada gambar dan tidak ada gambar baru dipilih, kirim null
        // atau string kosong jika backend mengharapkan itu untuk menghapus gambar
        formData.append('image', '');
    }
    // Catatan: Jika ada gambar lama dan tidak ada gambar baru dipilih,
    // maka field 'image' tidak perlu disertakan di FormData untuk mempertahankan gambar lama.

    try {
        await productStore.updateProduct(productId.value, formData);
        alert('Produk berhasil diperbarui!');
        // Opsional: navigasi kembali ke daftar produk atau refresh detail
        // navigateTo('/products');
    } catch (error) {
        alert(`Gagal memperbarui produk: ${error.message || 'Terjadi kesalahan'}`);
    }
};

onMounted(async () => {
  await productStore.fetchCategories(); // Ambil kategori untuk dropdown
  await fetchProductDetails(); // Ambil detail produk ini
});
</script>