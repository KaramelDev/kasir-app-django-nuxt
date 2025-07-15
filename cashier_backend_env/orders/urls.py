# cashier_backend/orders/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet)


urlpatterns = [
    path('', include(router.urls)),
    # URL untuk process_checkout akan dibuat secara otomatis oleh router untuk @action
    # Jika Anda tidak menggunakan ViewSet, URL harus didefinisikan secara manual.
    # Contoh manual jika itu APIView: path('orders/process_checkout/', YourAPIView.as_view(), name='process_checkout'),
]