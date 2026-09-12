from django.db import models
from django.conf import settings


class FoodListing(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = 'available', 'Available'
        REQUESTED = 'requested', 'Requested'
        ASSIGNED = 'assigned', 'Assigned'
        COMPLETED = 'completed', 'Completed'
        EXPIRED = 'expired', 'Expired'

    provider = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='food_listings')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    quantity_servings = models.PositiveIntegerField(default=1)
    expiry_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='food_requested')
    volunteer = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='food_volunteered')
    address_text = models.CharField(max_length=255, blank=True, default='')
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} ({self.status})"
