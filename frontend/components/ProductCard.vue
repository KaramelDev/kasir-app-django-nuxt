<template>
  <div class="border p-4 rounded-lg shadow-md flex flex-col justify-between">
    <div>
      <img v-if="product.image" :src="product.image" :alt="product.name" class="w-full h-32 object-cover mb-4 rounded">
      <h3 class="text-lg font-semibold">{{ product.name }}</h3>
      <p class="text-gray-600 text-sm mb-2">{{ product.category_name }}</p>
      <p class="text-gray-800 font-bold">Rp {{ product.price.toLocaleString('id-ID') }}</p>
      <p v-if="product.stock < 5" class="text-red-500 text-xs mt-1">Stok Tersisa: {{ product.stock }}</p>
    </div>
    <button
      @click="addToCart(product.id)"
      class="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
    >
      {{ product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang' }}
    </button>
  </div>
</template>

<script setup>
import { useCartStore } from '~/store/cart';

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const cartStore = useCartStore();

const addToCart = (productId) => { // Fungsi ini menerima ID
  cartStore.addToCart(productId); // Meneruskan ID ke store
};
</script>