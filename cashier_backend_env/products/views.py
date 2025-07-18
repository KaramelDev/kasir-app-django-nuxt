# cashier_backend/products/views.py

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
# Import custom permissions
from cashier_backend.permissions import IsAdminUser, IsCashierOrAdmin 

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsAdminUser] 

    def get_permissions(self):
        # Prioritaskan Admin/Superuser agar selalu memiliki akses penuh
        if (self.request.user.is_authenticated and 
            (self.request.user.is_superuser or self.request.user.groups.filter(name='Admin').exists())):
            return [IsAuthenticated()] # Admin yang terotentikasi selalu diizinkan untuk semua aksi

        # Jika bukan Admin, terapkan izin khusus:
        if self.action in ['list', 'retrieve']: # Untuk melihat daftar dan detail kategori
            # Izinkan Kasir atau Admin (IsCashierOrAdmin akan memeriksa keduanya)
            permission_classes = [IsAuthenticated, IsCashierOrAdmin]
        else: # Untuk create, update, delete kategori
            # Hanya Admin yang bisa (karena sudah melewati kondisi admin di atas)
            permission_classes = [IsAuthenticated, IsAdminUser] # Ini akan menolak Kasir
        
        return [permission() for permission in permission_classes]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_permissions(self):
        # Tambahkan print() untuk debugging jika perlu
        # print(f"\n--- ProductViewSet Permission Check for {self.request.user.username} (Action: {self.action}) ---")
        # print(f"Is authenticated: {self.request.user.is_authenticated}")
        # print(f"Is superuser: {self.request.user.is_superuser}")
        # print(f"User groups: {[group.name for group in self.request.user.groups.all()]}")
        # print("--------------------------------------------------\n")

        # **Prioritaskan Admin/Superuser agar selalu memiliki akses penuh**
        if (self.request.user.is_authenticated and 
            (self.request.user.is_superuser or self.request.user.groups.filter(name='Admin').exists())):
            return [IsAuthenticated()] # Admin yang terotentikasi selalu diizinkan untuk semua aksi
        
        # Logika untuk Kasir dan user lainnya (non-Admin)
        if self.action in ['list', 'retrieve']: # Kasir bisa melihat daftar dan detail produk
            permission_classes = [IsAuthenticated, IsCashierOrAdmin]
        else: # Hanya Admin yang boleh create, update, delete produk (karena sudah melewati kondisi admin di atas)
            # Jika user sampai sini, berarti mereka bukan admin, dan mereka tidak diizinkan untuk action ini.
            # Jadi kita bisa kembalikan IsAdminUser agar hanya Admin yang bisa (tapi ini redundant jika admin sudah di atas)
            # Sebaiknya: jika bukan admin dan bukan action 'list'/'retrieve', maka forbidden.
            # return [IsAuthenticated()] # Ini akan di handle oleh DEFAULT_PERMISSION_CLASSES
            permission_classes = [IsAuthenticated, IsAdminUser] # Kembali ke ini jika ingin eksplisit

        return [permission() for permission in permission_classes]