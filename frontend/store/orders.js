// ~/store/orders.js
import { defineStore } from 'pinia';
import { useApiFetch } from '~/composables/useApiFetch'; // Pastikan path ini benar

export const useOrderStore = defineStore('orders', {
  state: () => ({
    orders: [],
    loading: false,
    error: null,
  }),
  actions: {  
    async addOrder(orderData) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await useApiFetch('/orders/process_checkout/', {
          method: 'POST',
          body: orderData,
        });
        // Pastikan data.value ada dan tambahkan ke array orders
        if (data.value) {
            this.orders.push(data.value); // Baris 35 yang dimaksud error
        }
        return true;
      } catch (e) {
        this.error = e;
        console.error("Error adding order:", e);
        return false;
      } finally {
        this.loading = false;
      }
    },
    // Anda mungkin juga i
    async fetchOrders() {
      this.loading = true;
      this.error = null;
      try {
        const { data, error } = await useApiFetch('/orders/');
        if (error.value) {
          throw new Error(error.value.message || 'Gagal memuat transaksi.');
        }
        this.orders = data.value || [];
      } catch (e) {
        this.error = e;
        console.error('Error fetching orders:', e);
      } finally {
        this.loading = false;
      }
    },

    async updateOrder(id, payload) {
      this.loading = true;
      this.error = null;
      try {
        const { data, error } = await useApiFetch(`/orders/${id}/`, {
          method: 'PATCH', // Gunakan PATCH untuk update sebagian
          body: payload,
        });
        if (error.value) {
          throw new Error(error.value.message || 'Gagal memperbarui transaksi.');
        }
        // Perbarui transaksi di state lokal
        const index = this.orders.findIndex(order => order.id === id);
        if (index !== -1) {
          this.orders[index] = { ...this.orders[index], ...data.value };
        }
        return true;
      } catch (e) {
        this.error = e;
        console.error('Error updating order:', e);
        return false;
      } finally {
        this.loading = false;
      }
    },

    // PASTIKAN FUNGSI deleteOrder INI ADA DAN TIDAK ADA TYPO
    async deleteOrder(id) {
      this.loading = true;
      this.error = null;
      try {
        const { error } = await useApiFetch(`/orders/${id}/`, {
          method: 'DELETE',
        });
        if (error.value) {
          throw new Error(error.value.message || 'Gagal menghapus transaksi.');
        }
        // Hapus transaksi dari state lokal
        this.orders = this.orders.filter(order => order.id !== id);
        return true;
      } catch (e) {
        this.error = e;
        console.error('Error deleting order:', e);
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});