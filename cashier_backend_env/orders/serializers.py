from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductSerializer # Import ProductSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True) # Untuk menampilkan detail produk

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_detail', 'quantity', 'price_at_purchase']
        extra_kwargs = {'product': {'write_only': True}} # Product hanya untuk write

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['id', 'total_amount', 'payment_method', 'status', 'created_at', 'items']
        read_only_fields = ['created_at', 'updated_at']

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