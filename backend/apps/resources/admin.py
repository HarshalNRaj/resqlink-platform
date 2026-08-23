from django.contrib import admin
from .models import Resource

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "category", "status", "created_at")
    list_filter = ("category", "status", "condition")
