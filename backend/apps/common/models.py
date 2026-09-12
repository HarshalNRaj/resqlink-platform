from django.conf import settings
from django.db import models


class Status(models.TextChoices):
    """The single lifecycle every module (resources, food, emergency) shares:
    a listing is posted, someone requests it, a volunteer is assigned to
    move it, and it's marked complete — counted toward the impact dashboard.
    """
    AVAILABLE = "available", "Available"
    REQUESTED = "requested", "Requested"
    ASSIGNED = "assigned", "Assigned"
    COMPLETED = "completed", "Completed"
    CANCELLED = "cancelled", "Cancelled"


class Urgency(models.TextChoices):
    LOW = "low", "Low"
    MEDIUM = "medium", "Medium"
    HIGH = "high", "High"
    CRITICAL = "critical", "Critical"


class LifecycleListing(models.Model):
    """Abstract base for anything that follows resource -> need -> connection
    -> impact: a Resource (donated item), a FoodListing, or an EmergencyRequest.
    BloodRequest has its own shape (matching a donor, not a volunteer pickup)
    so it does not use this base.
    """

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)
    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="%(class)s_requested",
    )
    volunteer = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="%(class)s_volunteered",
    )
    address_text = models.CharField(max_length=255, blank=True)
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True
        ordering = ["-created_at"]
