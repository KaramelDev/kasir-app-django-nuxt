# cashier_backend/cashier_backend/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .views import CustomAuthToken # Import CustomAuthToken
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from rest_framework.authtoken.models import Token
from users.serializers import UserSerializer # Import UserSerializer Anda

class CustomAuthToken(ObtainAuthToken): 
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        token_key = response.data['token']
        
        try:
            token = Token.objects.get(key=token_key)
            user = token.user
        except Token.DoesNotExist:
            return Response({"detail": "Token not found after authentication."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # PENTING: Serialisasi user secara lengkap
        user_serializer = UserSerializer(user) 
        return Response({
            'token': token.key,
            'user': user_serializer.data # <--- PASTIKAN INI ADALAH user_serializer.data, BUKAN user_id atau username saja
        })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('products.urls')),
    path('api/', include('orders.urls')),
    path('api/', include('users.urls')), 
    path('api/token-auth/', CustomAuthToken.as_view()), # Tambahkan ini
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
