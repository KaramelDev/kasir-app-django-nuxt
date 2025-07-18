// cashier_frontend/store/cart.js
import { defineStore } from 'pinia';
import { useProductStore } from '~/store/products'; // Pastikan path ke product store Anda benar
import { useApiClient } from '~/composables/useApiFetch'; // Import useApiClient untuk checkout

export const useCartStore = defineStore('cart', {
    state: () => ({
        items: [], // Array of cart items { id, name, price, quantity, stock, image }
    }),

    getters: {
        totalItems: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: (state) => {
            const total = state.items.reduce((sum, item) => {
                // Pastikan item.price adalah angka sebelum perhitungan
                const price = parseFloat(item.price);
                return sum + (item.quantity * (isNaN(price) ? 0 : price));
            }, 0);
            return total;
        },
        getItemById: (state) => (productId) => {
            return state.items.find(item => item.id === productId);
        },
    },

    actions: {
        async addToCart(productId, quantity = 1) { // Tambahkan 'async' karena mungkin perlu fetch
            const productStore = useProductStore();

            // PENTING: Pastikan produk sudah dimuat. Jika belum, coba muat.
            if (!productStore.products || productStore.products.length === 0) {
                console.warn("Product data not loaded, attempting to fetch...");
                await productStore.fetchProducts(); // Coba muat ulang produk
                if (!productStore.products || productStore.products.length === 0) {
                    console.error("Product data still not available after fetch attempt.");
                    return; // Gagal mendapatkan data produk, hentikan
                }
            }

            const product = productStore.products.find(p => p.id === productId);

            if (!product) {
                console.error("Product with ID", productId, "not found in productStore products.");
                alert("Produk tidak ditemukan.");
                return;
            }

            // Pastikan harga produk adalah angka, konversi jika perlu
            const productPrice = parseFloat(product.price);
            if (isNaN(productPrice)) {
                console.error(`Invalid price for product ${product.name}: ${product.price}`);
                alert("Harga produk tidak valid.");
                return;
            }

            const existingItem = this.items.find(item => item.id === productId);

            if (existingItem) {
                if (existingItem.quantity + quantity <= product.stock) {
                    existingItem.quantity += quantity;
                } else {
                    alert(`Stok ${product.name} hanya ${product.stock}, tidak bisa menambah lebih banyak.`);
                    return; // Hentikan jika stok tidak cukup
                }
            } else {
                if (quantity <= product.stock) {
                    // Tambahkan properti 'price' secara eksplisit ke item
                    this.items.push({
                        id: product.id,
                        name: product.name,
                        price: parseFloat(product.price), // Gunakan harga yang sudah dikonversi
                        quantity: quantity,
                        stock: product.stock, // Simpan stok untuk validasi di kemudian hari
                        image: product.image // Simpan URL gambar
                    });
                } else {
                    alert(`Stok ${product.name} hanya ${product.stock}, tidak bisa menambah lebih banyak.`);
                    return; // Hentikan jika stok tidak cukup
                }
            }
            this.saveCart(); // Simpan perubahan ke localStorage
        },

        removeFromCart(productId) {
            this.items = this.items.filter(item => item.id !== productId);
            this.saveCart(); // Simpan perubahan ke localStorage
        },

        async updateQuantity(productId, change) { // Tambahkan 'async' jika fetchProducts dipanggil
            const productStore = useProductStore();

            // Pastikan produk sudah dimuat
            if (!productStore.products || productStore.products.length === 0) {
                console.warn("Product data not loaded for quantity update, attempting to fetch...");
                await productStore.fetchProducts();
                if (!productStore.products || productStore.products.length === 0) {
                    console.error("Product data still not available after fetch attempt.");
                    return;
                }
            }

            const item = this.items.find(item => item.id === productId);
            const product = productStore.products.find(p => p.id === productId);

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
            this.saveCart(); // Simpan perubahan ke localStorage
        },

        clearCart() {
            this.items = [];
            this.saveCart(); // Simpan perubahan ke localStorage
        },

        // Action baru untuk menyimpan ke localStorage
        saveCart() {
            if (process.client) { // Hanya berjalan di browser
                localStorage.setItem('cartItems', JSON.stringify(this.items));
            }
        },

        // Action baru untuk memuat dari localStorage
        loadCart() {
            if (process.client) {
                const storedCart = localStorage.getItem('cartItems');
                if (storedCart) {
                    this.items = JSON.parse(storedCart);
                }
            }
        },

        // Tambahkan action checkout yang akan berkomunikasi dengan backend
        async checkout(customerName, paymentMethod, totalAmountPaid) {
            const apiClient = useApiClient(); // Dapatkan instance $fetch untuk panggilan API
            if (this.items.length === 0) {
                console.warn('Keranjang kosong, tidak bisa checkout.');
                return false;
            }

            const orderData = {
                customer_name: customerName,
                payment_method: paymentMethod,
                total_amount: totalAmountPaid,
                items: this.items.map(item => ({
                    product: item.id, // Sesuaikan dengan field 'product' di serializer Django Anda
                    quantity: item.quantity,
                    price_at_sale: item.price, // Harga produk saat transaksi
                })),
            };

            try {
                const response = await apiClient('/orders/', { // Ganti dengan endpoint orders Anda
                    method: 'POST',
                    body: orderData,
                });
                this.clearCart(); // Kosongkan keranjang setelah berhasil
                console.log('Pesanan berhasil dibuat:', response);
                return true;
            } catch (error) {
                console.error('Gagal menyelesaikan pesanan:', error.data || error.message);
                // Tambahkan penanganan error yang lebih spesifik jika diperlukan
                alert(`Pembayaran gagal: ${error.data?.detail || error.message}`);
                return false;
            }
        },
    },

    // Plugin Persist Pinia
    persist: {
        storage: process.client ? localStorage : undefined, // Gunakan localStorage di sisi client
        paths: ['items'], // Hanya simpan state 'items'
        key: 'cart-store', // Nama kunci di localStorage, opsional
    },
});