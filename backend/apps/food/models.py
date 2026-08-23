from django.conf import settings
from django.db import models

from apps.common.models import LifecycleListing


class FoodListing(LifecycleListing):
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="food_listings",
    )
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    quantity_servings = models.PositiveIntegerField(help_text="Approximate number of servings.")
    expiry_time = models.DateTimeField(help_text="Food should be picked up before this time.")

    def __str__(self):
        return self.title
