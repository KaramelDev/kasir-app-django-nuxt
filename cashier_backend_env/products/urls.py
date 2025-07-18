from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'products', ProductViewSet) # Pastikan ini ada
router.register(r'categories', CategoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Endpoint best_sellers akan otomatis terdaftar sebagai /api/products/best_sellers/
    # karena kita menggunakannya sebagai @action pada ProductViewSet.
]