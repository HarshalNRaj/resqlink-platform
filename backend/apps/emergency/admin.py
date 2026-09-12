from django.contrib import admin
from .models import EmergencyRequest

@admin.register(EmergencyRequest)
class EmergencyRequestAdmin(admin.ModelAdmin):
    list_display = ("request_type", "urgency", "people_affected", "status", "created_at")
    list_filter = ("status", "urgency", "request_type")
