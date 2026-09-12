from django.db import models
from django.conf import settings


class BloodBank(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='blood_bank_profile')
    name = models.CharField(max_length=255)
    address_text = models.CharField(max_length=255, blank=True, default='')
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)
    contact_phone = models.CharField(max_length=20, blank=True, default='')

    def __str__(self):
        return self.name


class BloodRequest(models.Model):
    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        MATCHED = 'matched', 'Matched'
        FULFILLED = 'fulfilled', 'Fulfilled'
        CANCELLED = 'cancelled', 'Cancelled'

    class Urgency(models.TextChoices):
        CRITICAL = 'critical', 'Critical'
        HIGH = 'high', 'High'
        MEDIUM = 'medium', 'Medium'
        LOW = 'low', 'Low'

    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='blood_requests')
    blood_group = models.CharField(max_length=5)
    units_needed = models.PositiveIntegerField(default=1)
    urgency = models.CharField(max_length=20, choices=Urgency.choices, default=Urgency.HIGH)
    hospital_name = models.CharField(max_length=255)
    address_text = models.CharField(max_length=255, blank=True, default='')
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    matched_donor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='blood_matches')
    matched_blood_bank = models.ForeignKey(BloodBank, null=True, blank=True, on_delete=models.SET_NULL, related_name='requests_matched')
    matched_blood_bank_name = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    fulfilled_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.blood_group} for {self.hospital_name} ({self.status})"
