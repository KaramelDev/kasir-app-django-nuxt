<template>
  <div class="p-4 border rounded-lg shadow-md">
    <h3 class="text-xl font-bold mb-4">Total Belanja: Rp {{ (cartStore.cartTotal ?? 0).toLocaleString('id-ID') }}</h3>
    <div class="mb-4">
      <label for="paymentMethod" class="block text-gray-700 text-sm font-bold mb-2">Metode Pembayaran:</label>
      <select v-model="paymentMethod" id="paymentMethod" class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
        <option value="cash">Tunai</option>
        <option value="card">Kartu Debit/Kredit</option>
        <option value="qr">QRIS</option>
      </select>
    </div>
    <button
      @click ="processCheckout"
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
const emit = defineEmits(['checkoutSuccess']); 

const processCheckout = async () => {
  processing.value = true;
  checkoutError.value = null;
  checkoutSuccess.value = null;
  try {
    const orderData = {
      // Perhatikan: cartStore.totalAmount yang benar dari store/cart.js
      total_amount: cartStore.totalAmount, 
      payment_method: paymentMethod.value,
      items: cartStore.items.map(item => ({
        product: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price,
      })),
    };
    
    // Panggil aksi addOrder dari orderStore
    // Aksi addOrder di store/orders.js mengembalikan boolean (true/false)
    // dan menambahkan order ke state orders.
    // Jika Anda ingin ID order, Anda bisa mendapatkannya dari orderStore.orders[orderStore.orders.length - 1].id
    // setelah addOrder berhasil, atau modify addOrder di store untuk mengembalikan data order.
    const success = await orderStore.addOrder(orderData); 
    
    if (success) {
      // Dapatkan ID order dari item terakhir di orderStore.orders
      // Ini asumsi bahwa addOrder di store menambahkan order baru ke array 'orders'.
      const latestOrder = orderStore.orders[orderStore.orders.length - 1];
      if (latestOrder && latestOrder.id) {
        checkoutSuccess.value = latestOrder.id;
      } else {
        checkoutSuccess.value = 'Pesanan berhasil diproses (ID tidak tersedia).';
      }
      cartStore.clearCart(); // Bersihkan keranjang setelah berhasil checkout
    } else {
        // Jika addOrder mengembalikan false, berarti ada error di store
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