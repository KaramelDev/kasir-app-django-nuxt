# cashier_backend/users/views.py

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from cashier_backend.permissions import IsAdminUser # Hanya admin yang bisa mengelola user
from .serializers import UserSerializer

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('username')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser] # Hanya admin yang bisa CRUD user

    # Anda bisa menambahkan logika kustom jika perlu, tapi ModelViewSet sudah mencakup CRUD.
    # Misalnya, untuk mendapatkan detail user yang sedang login (opsional)
    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)