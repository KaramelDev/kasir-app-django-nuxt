# cashier_backend/users/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    # Field 'group_name' untuk menerima input role dari frontend
    # Ini bukan field di model User, melainkan hanya untuk proses serializer
    # group_name = serializers.CharField(write_only=True, required=False) 
    
    # Tampilkan grup user saat membaca
    groups = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'is_staff', 'is_superuser', # <--- PENTING! Pastikan is_superuser ada di fields
                  'is_active', 'date_joined', 'last_login', 
                  'groups', # <--- PENTING! Pastikan groups ada di fields
                  'password'] 
        read_only_fields = ['id', 'is_staff', 'is_superuser', 'is_active', 'date_joined', 'last_login']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}, 
        }

    def get_groups(self, obj):
        # Mengembalikan nama grup user sebagai list of strings
        return [group.name for group in obj.groups.all()]

    def validate_group_name(self, value):
        # Validasi bahwa group_name yang diberikan adalah 'Admin' atau 'Cashier'
        if value not in ['admin', 'Cashier']:
            raise serializers.ValidationError("Group name must be 'Admin' or 'Cashier'.")
        return value

    def create(self, validated_data):
        group_name = validated_data.pop('group_name', None)
        password = validated_data.pop('password', None) # Ambil password
        
        # Buat user baru
        user = User(**validated_data)
        if password:
            user.set_password(password) # Set password dengan benar
        user.save()

        # Tambahkan user ke grup yang ditentukan
        if group_name:
            try:
                group = Group.objects.get(name=group_name)
                user.groups.add(group)
            except Group.DoesNotExist:
                raise serializers.ValidationError(f"Group '{group_name}' does not exist.")
        else: # Default ke Cashier jika tidak ada grup yang ditentukan saat create
            try:
                cashier_group = Group.objects.get(name='Cashier')
                user.groups.add(cashier_group)
            except Group.DoesNotExist:
                raise serializers.ValidationError("Default 'Cashier' group does not exist.")

        return user

    def update(self, instance, validated_data):
        group_name = validated_data.pop('group_name', None)
        password = validated_data.pop('password', None)

        # Update field-field user
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update password jika disediakan
        if password:
            instance.set_password(password)
            
        instance.save()

        # Update grup user (hapus grup lama, tambahkan grup baru)
        if group_name:
            instance.groups.clear() # Hapus semua grup lama
            try:
                group = Group.objects.get(name=group_name)
                instance.groups.add(group)
            except Group.DoesNotExist:
                raise serializers.ValidationError(f"Group '{group_name}' does not exist.")
        elif group_name is not None: # Jika group_name kosong string, berarti ingin menghapus user dari semua group
             instance.groups.clear()

        return instance