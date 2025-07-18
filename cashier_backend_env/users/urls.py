# cashier_backend/users/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .view import UserViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet) # Endpoint akan menjadi /api/users/

urlpatterns = [
    path('', include(router.urls)),
]