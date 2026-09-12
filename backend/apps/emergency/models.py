from django.conf import settings
from django.db import models

from apps.common.models import Urgency


class RequestType(models.TextChoices):
    FOOD = "food", "Food"
    SHELTER = "shelter", "Shelter"
    TRANSPORT = "transport", "Transport"
    VOLUNTEERS = "volunteers", "Volunteers"
    SUPPLIES = "supplies", "Supplies"
    OTHER = "other", "Other"


class EmergencyStatus(models.TextChoices):
    OPEN = "open", "Open"
    IN_PROGRESS = "in_progress", "In progress"
    FULFILLED = "fulfilled", "Fulfilled"
    CLOSED = "closed", "Closed"


class EmergencyRequest(models.Model):
    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="emergency_requests",
    )
    request_type = models.CharField(max_length=20, choices=RequestType.choices)
    description = models.TextField()
    urgency = models.CharField(max_length=10, choices=Urgency.choices, default=Urgency.MEDIUM)
    people_affected = models.PositiveIntegerField(default=1)
    address_text = models.CharField(max_length=255, blank=True)
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=15, choices=EmergencyStatus.choices, default=EmergencyStatus.OPEN)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="emergency_assignments",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_request_type_display()} — {self.get_urgency_display()}"
