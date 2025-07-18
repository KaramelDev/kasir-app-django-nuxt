# cashier_backend/orders/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, CashierRegistrationView # Pastikan CashierRegistrationView juga diimpor

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order') # basename harus sesuai dengan nama model/endpoint

urlpatterns = [
    path('', include(router.urls)),
    # Jika CashierRegistrationView tidak otomatis terdaftar oleh router (karena itu CreateAPIView, bukan ViewSet)
    # Anda mungkin perlu menambahkannya secara manual
    path('cashier/register/', CashierRegistrationView.as_view(), name='cashier-register'),
    # daily_summary seharusnya sudah ditangani oleh router karena ada di OrderViewSet
    # path('orders/daily_summary/', OrderViewSet.as_view({'get': 'daily_summary'}), name='order-daily-summary'), 
    # ^ Ini hanya diperlukan jika Anda tidak menggunakan DefaultRouter untuk orders atau jika ada masalah.
    # Biasanya, DefaultRouter akan otomatis membuat rute untuk @action(detail=False)
]