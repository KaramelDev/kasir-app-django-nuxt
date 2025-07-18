# cashier_backend/permissions.py

from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users (superuser or in 'Admin' group) to access it.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and \
               (request.user.is_superuser or request.user.groups.filter(name='admin').exists())

class IsCashierOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow cashier or admin users to access it.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='admin').exists() or \
               request.user.groups.filter(name='Cashier').exists()

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admin users to edit/delete it.
    """
    def has_object_permission(self, request, view, obj):
        # Admin users can always perform any action.
        if request.user and request.user.is_authenticated and \
           (request.user.is_superuser or request.user.groups.filter(name='admin').exists()):
            return True
        
        # Owners of the object can read/update/delete their own objects.
        # This assumes the object has a 'user' field pointing to the owner.
        return obj.user == request.user