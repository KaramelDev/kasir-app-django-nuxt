# products/admin.py
from django.contrib import admin
from .models import Category, Product
from django.utils.html import format_html

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'stock', 'is_active', 'product_image_tag')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'description')

    # Fungsi untuk menampilkan gambar thumbnail di daftar admin
    def product_image_tag(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 50px; height: 50px; object-fit: cover;" />'.format(obj.image.url))
        return "-"
    product_image_tag.short_description = 'Image' # Nama kolom
    product_image_tag.allow_tags = True # Izinkan rendering HTML