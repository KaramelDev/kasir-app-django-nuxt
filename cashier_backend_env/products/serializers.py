from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='category.name', read_only=True)
    # Tambahkan ini untuk memastikan price dikirim sebagai string numerik jika bukan Decimal
    # Atau jika Anda menggunakan FloatField, tidak perlu ini.
    price = serializers.DecimalField(max_digits=10, decimal_places=2, localize=False)
    category_name = serializers.CharField(source='category.name', read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = '__all__'





    # Jika Anda ingin memastikan URL absolut dikembalikan, Anda bisa melakukan ini:
    # def to_representation(self, instance):
    #     representation = super().to_representation(instance)
    #     if instance.image:
    #         request = self.context.get('request')
    #         if request is not None:
    #             representation['image'] = request.build_absolute_uri(instance.image.url)
    #         else:
    #             representation['image'] = instance.image.url
    #     return representation