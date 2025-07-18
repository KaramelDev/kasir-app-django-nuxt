from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductSerializer 
from products.models import Product# Import ProductSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group #


User = get_user_model()



class OrderItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True) # Untuk menampilkan detail produk
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), # <-- Perbaikan di sini!
        source='product',
        write_only=True
    )
    

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_detail','product_id', 'quantity', 'price_at_purchase']
        extra_kwargs = {'product': {'write_only': True}} # Product hanya untuk write
        read_only_fields = ['product_id']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True) # Nested serializer untuk items
    user_email = serializers.CharField(source='user.email', read_only=True) # Tampilkan email user
    items = OrderItemSerializer(many=True)
    

    class Meta:
        model = Order
        fields = ['id', 'total_amount','user_email', 'payment_method', 'status', 'created_at', 'items']
        read_only_fields = ['created_at', 'updated_at','user_email']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        return order

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', [])
        instance.total_amount = validated_data.get('total_amount', instance.total_amount)
        instance.payment_method = validated_data.get('payment_method', instance.payment_method)
        instance.status = validated_data.get('status', instance.status)
        instance.save()

        # Update atau buat OrderItem baru
        instance.items.all().delete() # Hapus item lama, lalu buat baru (atau bisa lebih kompleks)
        for item_data in items_data:
            OrderItem.objects.create(order=instance, **item_data)
        return instance
    

class CashierRegistrationSerializer(serializers.ModelSerializer):
        password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
        password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password2']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Dua field password tidak cocok."})
        return data

def create(self, validated_data):
        # Buat user baru
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password']
        )
        
        # Tambahkan user ini ke grup 'Cashier'
        try:
            cashier_group = Group.objects.get(name='Cashier')
            user.groups.add(cashier_group)
        except Group.DoesNotExist:
            raise serializers.ValidationError("Grup 'Cashier' tidak ditemukan. Mohon buat grup ini di admin Django terlebih dahulu.")
        
        return user
