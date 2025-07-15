# cashier_backend/cashier_backend/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .views import CustomAuthToken # Import CustomAuthToken

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('products.urls')),
    path('api/', include('orders.urls')),
    path('api/login/', CustomAuthToken.as_view(), name='api_login'), # Tambahkan ini
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)