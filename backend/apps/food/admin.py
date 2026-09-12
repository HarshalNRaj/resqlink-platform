from django.contrib import admin
from .models import FoodListing

@admin.register(FoodListing)
class FoodListingAdmin(admin.ModelAdmin):
    list_display = ("title", "provider", "quantity_servings", "status", "expiry_time")
    list_filter = ("status",)
