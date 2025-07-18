<template>
  <div class="flex items-center py-3">
    <img
      :src="item.image" :alt="item.name"
      class="w-16 h-16 object-cover rounded-md mr-4"
    />
    <div>
      <h3 class="font-semibold text-lg">{{ item.name }}</h3>
      <p class="text-gray-600">Rp {{ item.price.toLocaleString('id-ID') }}</p>
      <div class="flex items-center mt-1">
        <button @click="updateQuantity(item.id, -1)" class="bg-gray-200 px-2 py-0.5 rounded-l-md hover:bg-gray-300">-</button>
        <span class="px-3">{{ item.quantity }}</span>
        <button @click="updateQuantity(item.id, 1)" class="bg-gray-200 px-2 py-0.5 rounded-r-md hover:bg-gray-300">+</button>
        <button @click="removeFromCart(item.id)" class="ml-4 text-red-500 hover:text-red-700">Hapus</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '~/store/cart';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const cartStore = useCartStore();

const updateQuantity = (id, change) => {
  cartStore.updateQuantity(id, change);
};

const removeFromCart = (id) => {
  cartStore.removeFromCart(id);
};


</script>