from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        GENERAL = 'general', 'General'
        RECEIVER = 'receiver', 'Receiver'
        DONOR = 'donor', 'Donor'
        VOLUNTEER = 'volunteer', 'Volunteer'
        NGO = 'ngo', 'NGO'
        BLOOD_BANK = 'blood_bank', 'Blood Bank'

    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
    ]

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.GENERAL)
    phone = models.CharField(max_length=20, blank=True, default='')
    organization_name = models.CharField(max_length=255, blank=True, default='')
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUP_CHOICES, blank=True, default='')
    is_donor_available = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=True)
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.role in [self.Role.NGO, self.Role.BLOOD_BANK] and self._state.adding:
            self.is_verified = False
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.role})"
