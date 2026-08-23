from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


class UserAdmin(BaseUserAdmin):
    list_display = ("username", "email", "role", "organization_name", "is_verified", "is_staff")
    list_filter = ("role", "is_verified", "is_staff")
    fieldsets = BaseUserAdmin.fieldsets + (
        ("ResQLink profile", {
            "fields": ("role", "phone", "organization_name", "blood_group",
                       "is_donor_available", "is_verified", "lat", "lng"),
        }),
    )


admin.site.register(User, UserAdmin)
