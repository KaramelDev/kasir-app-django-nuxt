// ~/store/products.js
import { defineStore } from 'pinia';
import { useApiFetch, useApiClient } from '~/composables/useApiFetch';

export const useProductStore = defineStore('products', {
  state: () => ({
    products: [],
    categories: [], // Asumsi Anda juga ingin kategori persisten
    loading: false,
    error: null,
  }),
  actions: {
    async fetchProducts() {
      this.loading = true;
      this.error = null;
      try {
        const { data: productsData } = await useApiFetch('/products/');
        this.products = productsData.value;
      } catch (e) {
        this.error = e;
        console.error('Error fetching products:', e);
      } finally {
        this.loading = false;
      }
    },
     persist: {
    storage: process.client ? localStorage : undefined,
    // Opsional: paths: ['products', 'categories'], jika hanya ingin sebagian state yang persisten
  },

    async fetchCategories() {
      this.loading = true;
      this.error = null;
      try {
        const { data: categoriesData } = await useApiFetch('/categories/');
        this.categories = categoriesData.value;
      } catch (e) {
        this.error = e;
        console.error('Error fetching categories:', e);
      } finally {
        this.loading = false;
      }
    },

    async addCategory(name) {
      this.loading = true;
      this.error = null;
      try {
        const client = useApiClient();
        const newCategory = await client('/categories/', {
          method: 'POST',
          body: { name },
        });
        this.categories.push(newCategory);
        return true;
      } catch (e) {
        this.error = e.message || 'Gagal menambahkan kategori.';
        console.error('Error adding category:', e);
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
  // --- AKTIFKAN PERSISTENSI DI SINI ---
  
});