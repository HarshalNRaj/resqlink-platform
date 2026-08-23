from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.TextChoices):
    GENERAL = "general", "General user"
    DONOR = "donor", "Donor"
    VOLUNTEER = "volunteer", "Volunteer"
    NGO = "ngo", "NGO / community organization"
    BLOOD_BANK = "blood_bank", "Blood bank"
    ADMIN = "admin", "Administrator"


class User(AbstractUser):
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.GENERAL)
    phone = models.CharField(max_length=20, blank=True)
    organization_name = models.CharField(
        max_length=150, blank=True,
        help_text="Required for NGO and blood bank accounts.",
    )
    blood_group = models.CharField(max_length=5, blank=True)
    is_donor_available = models.BooleanField(
        default=False, help_text="Donor has opted in to appear as an available blood donor.",
    )
    is_verified = models.BooleanField(
        default=False,
        help_text="Set by an admin once an NGO/blood bank's identity is confirmed.",
    )
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
