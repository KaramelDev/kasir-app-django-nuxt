<template>
  <div class="p-4 border rounded-lg shadow-md">
    <h3 class="text-xl font-bold mb-4">Total Belanja: Rp {{ (cartStore.totalAmount ?? 0).toLocaleString('id-ID') }}</h3>
    <div class="mb-4">
      <label for="paymentMethod" class="block text-gray-700 text-sm font-bold mb-2">Metode Pembayaran:</label>
      <select v-model="paymentMethod" id="paymentMethod" class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
        <option value="cash">Tunai</option>
        <option value="card">Kartu Debit/Kredit</option>
        <option value="qr">QRIS</option>
      </select>
    </div>
    <button
      @click="processCheckout"
      :disabled="cartStore.totalItems === 0 || processing"
      class="bg-green-500 text-white py-2 px-4 rounded w-full hover:bg-green-600 disabled:bg-gray-400"
    >
      {{ processing ? 'Memproses...' : 'Bayar Sekarang' }}
    </button>
    <p v-if="checkoutError" class="text-red-500 text-sm mt-2">{{ checkoutError }}</p>
    <p v-if="checkoutSuccess" class="text-green-500 text-sm mt-2">Pembayaran Berhasil! ID Pesanan: {{ checkoutSuccess }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useCartStore } from '~/store/cart';
import { useOrderStore } from '~/store/orders'; // Import order store

const cartStore = useCartStore();
const orderStore = useOrderStore(); // Gunakan order store

const paymentMethod = ref('cash');
const processing = ref(false);
const checkoutError = ref(null);
const checkoutSuccess = ref(null);
const emit = defineEmits(['checkoutSuccess']); // Ini bagus, tapi tidak digunakan dalam kode yang Anda berikan.

const processCheckout = async () => {
  processing.value = true;
  checkoutError.value = null;
  checkoutSuccess.value = null;
  try {
    const orderData = {
      total_amount: cartStore.totalAmount, // Ini sudah benar
      payment_method: paymentMethod.value,
      items: cartStore.items.map(item => ({
        product: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price, // Pastikan field ini sesuai dengan serializer Django Anda
      })),
    };
    
    // Panggil aksi addOrder dari orderStore
    // Asumsi addOrder di store/orders.js akan berkomunikasi dengan backend
    // dan mengembalikan data pesanan yang telah dibuat, termasuk ID-nya.
    const newOrder = await orderStore.addOrder(orderData); 
    
    if (newOrder && newOrder.id) { // Periksa apakah order berhasil dibuat dan memiliki ID
      checkoutSuccess.value = newOrder.id;
      cartStore.clearCart(); // Bersihkan keranjang setelah berhasil checkout
      // emit('checkoutSuccess', newOrder.id); // Jika Anda ingin memancarkan event ke parent
    } else {
      // Jika addOrder mengembalikan null/undefined atau tidak ada ID
      checkoutError.value = orderStore.error?.message || 'Terjadi kesalahan saat memproses pembayaran.';
    }

  } catch (error) {
    // Ini menangkap error yang tidak ditangani oleh orderStore.addOrder (misal: network error)
    checkoutError.value = 'Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.';
    console.error("Checkout error:", error);
  } finally {
    processing.value = false;
  }
};
</script>