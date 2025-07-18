from django.db import models
from products.models import Product # Import Product dari app products
from django.conf import settings # Import settings untuk AUTH_USER_MODEL
from django.contrib.auth import get_user_model
User = get_user_model()


class Order(models.Model):


    ORDER_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    # Tambahkan field ini
    # ForeignKey ke model User default Django
    # On_delete=models.SET_NULL berarti jika user dihapus, field user di order jadi NULL
    # null=True, blank=True berarti field ini opsional (bisa NULL)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, # Mengacu ke model User yang aktif di settings
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders' # Nama relasi balik dari User ke Order
    )
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50) # 'cash', 'card', 'qr'
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(
        max_length=20,
        choices=ORDER_STATUS_CHOICES,
        default='pending' # Default status saat order dibuat
    )

    def __str__(self):
        return f"Order {self.id} - {self.total_amount}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True) # Pastikan ini benar
    quantity = models.IntegerField(default=1)
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)
    # ...
    def __str__(self):
        return f"{self.quantity} x {self.product.name if self.product else 'Deleted Product'}"