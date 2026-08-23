from django.conf import settings
from django.db import models

from apps.common.models import Urgency


class BloodGroup(models.TextChoices):
    A_POS = "A+", "A+"
    A_NEG = "A-", "A-"
    B_POS = "B+", "B+"
    B_NEG = "B-", "B-"
    AB_POS = "AB+", "AB+"
    AB_NEG = "AB-", "AB-"
    O_POS = "O+", "O+"
    O_NEG = "O-", "O-"


class BloodRequestStatus(models.TextChoices):
    OPEN = "open", "Open"
    MATCHED = "matched", "Matched"
    FULFILLED = "fulfilled", "Fulfilled"
    CANCELLED = "cancelled", "Cancelled"


class BloodBank(models.Model):
    """A verified blood bank profile. One-to-one with a user of role
    'blood_bank' so it inherits auth and JWT identity from that account.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="blood_bank_profile",
    )
    name = models.CharField(max_length=150)
    address_text = models.CharField(max_length=255, blank=True)
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.name


class BloodRequest(models.Model):
    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="blood_requests",
    )
    blood_group = models.CharField(max_length=5, choices=BloodGroup.choices)
    units_needed = models.PositiveIntegerField(default=1)
    urgency = models.CharField(max_length=10, choices=Urgency.choices, default=Urgency.MEDIUM)
    hospital_name = models.CharField(max_length=150)
    address_text = models.CharField(max_length=255, blank=True)
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=BloodRequestStatus.choices, default=BloodRequestStatus.OPEN)
    matched_donor = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="blood_donations_matched",
    )
    matched_blood_bank = models.ForeignKey(
        BloodBank, null=True, blank=True, on_delete=models.SET_NULL, related_name="requests_handled",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    fulfilled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.blood_group} x{self.units_needed} @ {self.hospital_name}"
