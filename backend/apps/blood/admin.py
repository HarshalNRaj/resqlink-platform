from django.contrib import admin
from .models import BloodBank, BloodRequest

@admin.register(BloodRequest)
class BloodRequestAdmin(admin.ModelAdmin):
    list_display = ("blood_group", "units_needed", "urgency", "hospital_name", "status", "created_at")
    list_filter = ("status", "urgency", "blood_group")

@admin.register(BloodBank)
class BloodBankAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "contact_phone")
