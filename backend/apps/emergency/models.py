from django.db import models
from django.conf import settings


class EmergencyRequest(models.Model):
    class RequestType(models.TextChoices):
        RESCUE = 'rescue', 'Rescue'
        MEDICAL = 'medical', 'Medical'
        SHELTER = 'shelter', 'Shelter'
        SUPPLIES = 'supplies', 'Supplies'

    class Urgency(models.TextChoices):
        CRITICAL = 'critical', 'Critical'
        HIGH = 'high', 'High'
        MEDIUM = 'medium', 'Medium'

    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        IN_PROGRESS = 'in_progress', 'In Progress'
        FULFILLED = 'fulfilled', 'Fulfilled'
        CLOSED = 'closed', 'Closed'

    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='emergency_requests')
    request_type = models.CharField(max_length=20, choices=RequestType.choices, default=RequestType.SUPPLIES)
    description = models.TextField()
    urgency = models.CharField(max_length=20, choices=Urgency.choices, default=Urgency.CRITICAL)
    people_affected = models.PositiveIntegerField(default=1)
    address_text = models.CharField(max_length=255, blank=True, default='')
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='emergency_assigned')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"SOS {self.request_type} - {self.urgency} ({self.status})"
