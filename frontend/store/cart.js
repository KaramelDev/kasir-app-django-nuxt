// cashier_frontend/store/cart.js
import { defineStore } from 'pinia';
import { useProductStore } from '~/store/products'; // Import product store

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
  }),
  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: (state) => {
      // Pastikan nilai awal sum adalah 0 untuk menghindari NaN
      const total = state.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      // Anda bisa menambahkan pengecekan untuk memastikan total adalah angka
      return isNaN(total) ? 0 : total; // <-- PASTIKAN INI MENGEMBALIKAN ANGKA
    },
  },
  actions: {
    addToCart(productId, quantity = 1) {
      const productStore = useProductStore();

      // --- Perbaikan di sini ---
      // Pastikan productStore.products ada dan merupakan array
      if (!productStore.products || !Array.isArray(productStore.products)) {
        console.error("Product data not loaded or is not an array in productStore.");
        // Anda bisa memilih untuk me-return atau memuat ulang produk
        // await productStore.fetchProducts(); // Opsional: Coba muat ulang
        // const product = productStore.products.find(p => p.id === productId); // Coba lagi
        return; // Hentikan eksekusi jika data produk belum siap
      }

      const product = productStore.products.find(p => p.id === productId); // Baris 20

      if (!product) {
        console.error("Product with ID", productId, "not found in store products.");
        return; // Jangan tambahkan jika produk tidak ditemukan
      }

      const existingItem = this.items.find(item => item.id === productId);

      if (existingItem) {
        if (existingItem.quantity + quantity <= product.stock) {
          existingItem.quantity += quantity;
        } else {
          alert(`Stok ${product.name} hanya ${product.stock}, tidak bisa menambah lebih banyak.`);
        }
      } else {
        if (quantity <= product.stock) {
          this.items.push({ ...product, quantity });
        } else {
          alert(`Stok ${product.name} hanya ${product.stock}, tidak bisa menambah lebih banyak.`);
        }
      }
    },
    removeFromCart(productId) {
      this.items = this.items.filter(item => item.id !== productId);
    },
    updateQuantity(productId, change) {
      const productStore = useProductStore();
      const item = this.items.find(item => item.id === productId);
      const product = productStore.products.find(p => p.id === productId); // Dapatkan info stok lagi

      if (item && product) {
        const newQuantity = item.quantity + change;
        if (newQuantity > 0 && newQuantity <= product.stock) {
          item.quantity = newQuantity;
        } else if (newQuantity <= 0) {
          this.removeFromCart(productId); // Hapus jika kuantitas jadi 0 atau kurang
        } else if (newQuantity > product.stock) {
          alert(`Stok ${product.name} hanya ${product.stock}, tidak bisa menambah lebih banyak.`);
        }
      }
    },
    clearCart() {
      this.items = [];
    }
  },
});